const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const emailService = require('../services/emailService');
const oracleCloudService = require('../services/oracleCloudService');
const rabbitmqService = require('../config/rabbitmq');
const logger = require('../utils/logger');

// All admin routes require authentication
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.verifyAdmin);

// Get all applications
router.get('/applications', async (req, res, next) => {
  try {
    const { status, position, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (position) {
      query += ' AND position = ?';
      params.push(position);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [applications] = await db.query(query, params);

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM applications'
    );

    res.json({
      applications,
      total: countResult[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countResult[0].total / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get single application details
router.get('/applications/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [applications] = await db.query(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(applications[0]);
  } catch (error) {
    next(error);
  }
});

// Update application status
router.put('/applications/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [applications] = await db.query(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = applications[0];

    await db.query(
      'UPDATE applications SET status = ?, admin_note = ?, updated_at = NOW() WHERE id = ?',
      [status, adminNote || null, id]
    );

    // Send status email via RabbitMQ
    await rabbitmqService.connect();
    await rabbitmqService.publishMessage(rabbitmqService.queues.EMAIL, {
      type: 'status',
      email: application.email,
      name: application.full_name,
      status: status,
      message: adminNote || `Your application has been ${status.toLowerCase()}.`
    });

    logger.info('Application status updated', { id, status });

    res.json({
      message: 'Application status updated successfully',
      status
    });
  } catch (error) {
    next(error);
  }
});

// Get application statistics
router.get('/statistics', async (req, res, next) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        AVG(match_score) as avg_match_score
      FROM applications
    `);

    const [positionStats] = await db.query(`
      SELECT position, COUNT(*) as count
      FROM applications
      GROUP BY position
      ORDER BY count DESC
    `);

    res.json({
      overall: stats[0],
      byPosition: positionStats
    });
  } catch (error) {
    next(error);
  }
});

// Backup database to Oracle Cloud
router.post('/backup', async (req, res, next) => {
  try {
    const [applications] = await db.query('SELECT * FROM applications');
    const [admins] = await db.query('SELECT id, email, role, created_at FROM admins');
    const [positions] = await db.query('SELECT * FROM job_positions');

    const backupData = {
      timestamp: new Date().toISOString(),
      applications,
      admins,
      positions
    };

    const result = await oracleCloudService.backupDatabase(backupData);

    logger.info('Database backup completed', result);

    res.json({
      message: 'Database backup completed successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Add new job position (Admin only)
router.post('/jobs', async (req, res, next) => {
  try {
    logger.info('POST /api/admin/jobs request received', {
      body: req.body,
      user: req.user
    });

    const { title, description, requirements } = req.body;

    // Input validation
    if (!title || !description) {
      logger.warn('Job creation failed: missing fields');
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // XSS prevention: sanitize inputs
    const sanitizedTitle = title.trim().substring(0, 100);
    const sanitizedDescription = description.trim().substring(0, 5000);
    const sanitizedRequirements = requirements ? requirements.trim().substring(0, 2000) : null;

    // Check for duplicate job title (only active jobs)
    const [existing] = await db.query(
      'SELECT id FROM job_positions WHERE title = ? AND active = 1',
      [sanitizedTitle]
    );

    if (existing.length > 0) {
      logger.warn('Job creation failed: duplicate title', { title: sanitizedTitle });
      return res.status(400).json({ error: 'Job position with this title already exists' });
    }

    // Insert job position
    const [result] = await db.query(
      'INSERT INTO job_positions (title, description, requirements, active) VALUES (?, ?, ?, 1)',
      [sanitizedTitle, sanitizedDescription, sanitizedRequirements]
    );

    logger.info('Job position added', { 
      id: result.insertId, 
      title: sanitizedTitle,
      admin: req.user?.email || 'unknown'
    });

    res.status(201).json({
      message: 'Job position added successfully',
      jobId: result.insertId
    });
  } catch (error) {
    logger.error('Error adding job position', error);
    next(error);
  }
});

// Delete job position (Admin only)
router.delete('/jobs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    // Check if job exists
    const [jobs] = await db.query(
      'SELECT id, title FROM job_positions WHERE id = ?',
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job position not found' });
    }

    // Check if there are applications for this job
    const [applications] = await db.query(
      'SELECT COUNT(*) as count FROM applications WHERE position = ?',
      [jobs[0].title]
    );

    // Soft delete: set active = 0 instead of hard delete
    await db.query(
      'UPDATE job_positions SET active = 0 WHERE id = ?',
      [id]
    );

    logger.info('Job position deleted', { 
      id, 
      title: jobs[0].title,
      applicationsCount: applications[0].count,
      admin: req.user?.email || 'unknown'
    });

    res.json({
      message: 'Job position deleted successfully',
      applicationsAffected: applications[0].count
    });
  } catch (error) {
    logger.error('Error deleting job position', error);
    next(error);
  }
});

// Get all job positions (Admin only)
router.get('/jobs', async (req, res, next) => {
  try {
    const [jobs] = await db.query(`
      SELECT 
        jp.*,
        COUNT(a.id) as application_count
      FROM job_positions jp
      LEFT JOIN applications a ON jp.title = a.position
      GROUP BY jp.id
      ORDER BY jp.created_at DESC
    `);

    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
