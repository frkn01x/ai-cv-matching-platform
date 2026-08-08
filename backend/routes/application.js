const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const db = require('../config/database');
const upload = require('../middleware/fileUpload');
const validator = require('../middleware/validator');
const security = require('../middleware/security');
const virusScanService = require('../services/virusScanService');
const openRouterService = require('../services/openRouterService');
const emailService = require('../services/emailService');
const oracleCloudService = require('../services/oracleCloudService');
const rabbitmqService = require('../config/rabbitmq');
const logger = require('../utils/logger');

// Submit CV application
router.post('/submit',
  upload.single('cv'),
  async (req, res, next) => {
    let tempFilePath = null;
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'CV file is required' });
      }

      tempFilePath = req.file.path;
      const { fullName, phone, jobId, jobTitle } = req.body;

      // Validate required fields
      if (!fullName || !phone) {
        throw new Error('Full name and phone number are required');
      }

      // Validate fullName (only letters and spaces)
      if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]{2,100}$/.test(fullName)) {
        throw new Error('Invalid name format');
      }

      // Validate phone (10-15 digits)
      if (!/^[0-9]{10,15}$/.test(phone)) {
        throw new Error('Invalid phone format. Use 10-15 digits');
      }

      // Validate file type using magic numbers
      const fileBuffer = await fs.readFile(tempFilePath);
      const fileType = security.validateFileType(fileBuffer, ['application/pdf']);
      
      if (!fileType) {
        throw new Error('Invalid file type. Only PDF files are allowed.');
      }

      // Scan file for viruses
      logger.info('Starting virus scan', { fileName: req.file.originalname });
      const scanResult = await virusScanService.scanFile(tempFilePath);

      if (!scanResult.safe) {
        throw new Error('File failed security scan. Please ensure your PDF is clean.');
      }

      // Extract text from PDF
      const pdfData = await pdfParse(fileBuffer);
      const cvText = pdfData.text;

      // Prevent prompt injection in CV content
      try {
        security.preventPromptInjection(cvText);
      } catch (error) {
        throw new Error('CV contains suspicious content. Please review your document.');
      }

      // Get job description
      let jobDescription;
      let positionTitle = 'General Application';
      
      if (jobId && jobTitle) {
        // Get specific job description from database
        const [jobs] = await db.query(
          'SELECT description FROM job_positions WHERE id = ? AND active = 1',
          [jobId]
        );
        
        if (jobs.length > 0) {
          jobDescription = jobs[0].description;
          positionTitle = jobTitle;
          logger.info('Using specific job description', { jobId, jobTitle });
        } else {
          // Job not found or inactive, use generic
          jobDescription = `We are looking for talented professionals with strong technical skills, 
            problem-solving abilities, and excellent communication. Experience in software development, 
            relevant technologies, and proven track record of delivering quality work is valued.`;
          logger.warn('Job not found, using generic description', { jobId });
        }
      } else {
        // No job selected, use generic description
        jobDescription = `We are looking for talented professionals with strong technical skills, 
          problem-solving abilities, and excellent communication. Experience in software development, 
          relevant technologies, and proven track record of delivering quality work is valued.`;
        logger.info('No job selected, using generic description');
      }

      // Match CV with job description using OpenRouter
      logger.info('Starting CV matching', { fullName, position: positionTitle });
      const matchResult = await openRouterService.matchCVWithJob(cvText, jobDescription);

      // Save CV to permanent location
      const cvFileName = `${Date.now()}-${security.sanitizeFilename(req.file.originalname)}`;
      const cvPath = path.join('uploads', 'cv', cvFileName);
      await fs.mkdir(path.dirname(cvPath), { recursive: true });
      await fs.copyFile(tempFilePath, cvPath);

      // Insert application into database
      const [result] = await db.query(
        `INSERT INTO applications 
        (full_name, phone, position, cv_path, match_score, ai_analysis, recommendation, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullName,
          phone,
          positionTitle,
          cvPath,
          matchResult.score,
          matchResult.rawAnalysis,
          matchResult.recommendation,
          'PENDING'
        ]
      );

      const applicationId = result.insertId;

      // Backup CV to Oracle Cloud
      await rabbitmqService.connect();
      await rabbitmqService.publishMessage(rabbitmqService.queues.BACKUP, {
        type: 'cv_backup',
        filePath: cvPath,
        fileName: cvFileName,
        applicationId
      });

      // Clean up temp file
      await fs.unlink(tempFilePath);

      logger.info('Application submitted successfully', { applicationId, fullName });

      res.status(201).json({
        message: 'Application submitted successfully'
      });
    } catch (error) {
      // Clean up temp file on error
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
        } catch (unlinkError) {
          logger.error('Error deleting temp file', unlinkError);
        }
      }
      next(error);
    }
  }
);

// Get all active jobs
router.get('/jobs', async (req, res, next) => {
  try {
    const [jobs] = await db.query(
      'SELECT id, title, description, requirements, active, created_at FROM job_positions WHERE active = 1 ORDER BY created_at DESC'
    );
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

// Get application status
router.get('/status/:applicationId', async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const [applications] = await db.query(
      'SELECT id, full_name, position, status, match_score, created_at FROM applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(applications[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
