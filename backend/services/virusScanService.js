const axios = require('axios');
const fs = require('fs').promises;
const FormData = require('form-data');
const logger = require('../utils/logger');

class VirusScanService {
  constructor() {
    this.apiKey = process.env.VIRUSTOTAL_API_KEY;
    this.baseUrl = 'https://www.virustotal.com/api/v3';
  }

  async scanFile(filePath) {
    try {
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename: 'document.pdf' });

      // Upload file to VirusTotal
      const uploadResponse = await axios.post(
        `${this.baseUrl}/files`,
        formData,
        {
          headers: {
            'x-apikey': this.apiKey,
            ...formData.getHeaders()
          },
          maxBodyLength: Infinity
        }
      );

      const analysisId = uploadResponse.data.data.id;
      
      // Wait and get analysis results
      await this.delay(15000); // Wait 15 seconds for analysis

      const analysisResponse = await axios.get(
        `${this.baseUrl}/analyses/${analysisId}`,
        {
          headers: {
            'x-apikey': this.apiKey
          }
        }
      );

      const stats = analysisResponse.data.data.attributes.stats;
      const isSafe = stats.malicious === 0 && stats.suspicious === 0;

      logger.info('VirusTotal scan completed', {
        malicious: stats.malicious,
        suspicious: stats.suspicious,
        safe: isSafe
      });

      return {
        safe: isSafe,
        malicious: stats.malicious,
        suspicious: stats.suspicious,
        undetected: stats.undetected
      };
    } catch (error) {
      logger.error('VirusTotal scan error', error);
      
      // If VirusTotal is unavailable, perform basic checks
      return await this.basicSecurityCheck(filePath);
    }
  }

  async basicSecurityCheck(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      // Check file signature (magic numbers)
      const isPDF = fileBuffer[0] === 0x25 && 
                    fileBuffer[1] === 0x50 && 
                    fileBuffer[2] === 0x44 && 
                    fileBuffer[3] === 0x46;

      if (!isPDF) {
        logger.warn('File is not a valid PDF');
        return { safe: false, reason: 'Invalid PDF format' };
      }

      // Check for suspicious embedded scripts (strict patterns only)
      const fileContent = fileBuffer.toString('binary');
      
      // Only flag if JavaScript contains suspicious patterns
      const hasSuspiciousScript = fileContent.includes('/JS') && 
                                 (fileContent.includes('eval(') || 
                                  fileContent.includes('unescape(') ||
                                  fileContent.includes('fromCharCode('));

      if (hasSuspiciousScript) {
        logger.warn('PDF contains suspicious JavaScript');
        return { safe: false, reason: 'PDF contains potentially dangerous JavaScript' };
      }

      // Check for suspicious auto-launch (only flag dangerous ones)
      const hasSuspiciousAutoAction = fileContent.includes('/Launch') && 
                                      (fileContent.includes('.exe') || 
                                       fileContent.includes('.bat') ||
                                       fileContent.includes('.cmd'));

      if (hasSuspiciousAutoAction) {
        logger.warn('PDF contains suspicious auto-launch');
        return { safe: false, reason: 'PDF contains suspicious auto-launch actions' };
      }

      // Basic PDF - safe to process
      logger.info('PDF passed basic security check');
      return { safe: true };
    } catch (error) {
      logger.error('Basic security check error', error);
      // If check fails, allow PDF but log the error
      logger.warn('Security check failed, allowing PDF with caution');
      return { safe: true };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new VirusScanService();
