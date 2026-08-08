const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const db = require('../config/database');
const redisClient = require('../config/redis');
const emailService = require('../services/emailService');
const validator = require('../middleware/validator');
const logger = require('../utils/logger');

// Admin login
router.post('/login', validator.validateLogin(), validator.checkValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate OTP
    const otp = speakeasy.totp({
      secret: process.env.JWT_SECRET,
      encoding: 'base32',
      step: 600 // 10 minutes
    });

    // Store OTP in Redis
    await redisClient.setEx(
      `otp:${email}`,
      parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 || 600,
      otp
    );

    // Send OTP via email
    await emailService.sendOTP(email, otp);

    logger.info('OTP sent for admin login', { email });

    res.json({
      message: 'OTP sent to your email',
      requiresOTP: true
    });
  } catch (error) {
    next(error);
  }
});

// Verify OTP and complete login
router.post('/verify-otp', validator.validateOTP(), validator.checkValidation, async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const storedOTP = await redisClient.get(`otp:${email}`);

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const [users] = await db.query(
      'SELECT id, email, role FROM admins WHERE email = ?',
      [email]
    );

    const user = users[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    await redisClient.del(`otp:${email}`);

    logger.info('Admin logged in successfully', { email });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.decode(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (expiresIn > 0) {
        await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
