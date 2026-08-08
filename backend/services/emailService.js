const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendOTP(email, otp) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your OTP Code - CV Application System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .otp-box { background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
              .warning { color: #d32f2f; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>OTP Verification</h2>
              <p>Your OTP code for CV application verification is:</p>
              <div class="otp-box">${otp}</div>
              <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
              <p class="warning">⚠️ Never share this code with anyone. Our team will never ask for your OTP.</p>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info('OTP email sent', { email });
      return true;
    } catch (error) {
      logger.error('Error sending OTP email', error);
      throw error;
    }
  }

  async sendApplicationStatus(email, name, status, message) {
    try {
      const statusText = status === 'ACCEPTED' ? 'Accepted' : 'Rejected';
      const statusColor = status === 'ACCEPTED' ? '#4caf50' : '#f44336';

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Application Status: ${statusText}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .status-badge { background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold; }
              .message-box { background: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Dear ${name},</h2>
              <p>Thank you for your application to our company.</p>
              <div class="status-badge">${statusText}</div>
              <div class="message-box">
                <p>${message}</p>
              </div>
              ${status === 'ACCEPTED' ? '<p>We will contact you soon with next steps.</p>' : '<p>We encourage you to apply for future openings.</p>'}
              <p>Best regards,<br>HR Department</p>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info('Application status email sent', { email, status });
      return true;
    } catch (error) {
      logger.error('Error sending status email', error);
      throw error;
    }
  }

  async sendApplicationConfirmation(email, name, applicationId) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Application Received - CV Application System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .app-id { background: #e3f2fd; padding: 10px; font-weight: bold; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Dear ${name},</h2>
              <p>We have successfully received your job application.</p>
              <p>Application ID: <span class="app-id">${applicationId}</span></p>
              <p>Our HR team will review your application and get back to you within 5 business days.</p>
              <p>Best regards,<br>HR Department</p>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info('Application confirmation email sent', { email });
      return true;
    } catch (error) {
      logger.error('Error sending confirmation email', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
