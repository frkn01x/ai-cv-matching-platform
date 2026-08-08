const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const redisClient = require('../config/redis');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// User Registration
router.post('/register', [
  body('fullName').trim().isLength({ min: 2, max: 100 }).matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }),
  body('phone').matches(/^[1-9][0-9]{9}$/)
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, phone } = req.body;

    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password (Security: bcrypt with cost factor 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store user (but not verified yet)
    await db.query(
      'INSERT INTO users (full_name, email, password, phone, email_verified) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, phone, false]
    );

    // Store OTP in database
    await db.query(
      'INSERT INTO otp_verifications (email, otp_code, otp_type, expires_at) VALUES (?, ?, ?, ?)',
      [email, otp, 'registration', expiresAt]
    );

    // Send OTP via email
    await emailService.sendOTP(email, otp);

    logger.info('Registration OTP sent', { email });
    res.json({ message: 'OTP sent to your email', email });
  } catch (error) {
    next(error);
  }
});

// Verify OTP and Complete Registration
router.post('/verify-registration', [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Get OTP from database
    const [otpRecords] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp_type = ? AND verified = ? ORDER BY created_at DESC LIMIT 1',
      [email, 'registration', false]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ error: 'No OTP found or already verified' });
    }

    const otpRecord = otpRecords[0];

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark user as verified
    await db.query('UPDATE users SET email_verified = ? WHERE email = ?', [true, email]);
    
    // Mark OTP as verified
    await db.query('UPDATE otp_verifications SET verified = ? WHERE id = ?', [true, otpRecord.id]);

    logger.info('User email verified', { email });
    res.json({ message: 'Registration successful' });
  } catch (error) {
    next(error);
  }
});

// User Login
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.query(
      'INSERT INTO otp_verifications (email, otp_code, otp_type, expires_at) VALUES (?, ?, ?, ?)',
      [email, otp, 'login', expiresAt]
    );

    await emailService.sendOTP(email, otp);

    logger.info('Login OTP sent', { email });
    res.json({ message: 'OTP sent', requiresOTP: true });
  } catch (error) {
    next(error);
  }
});

// Verify Login OTP
router.post('/verify-login', [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Get OTP from database
    const [otpRecords] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp_type = ? AND verified = ? ORDER BY created_at DESC LIMIT 1',
      [email, 'login', false]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ error: 'No OTP found or already used' });
    }

    const otpRecord = otpRecords[0];

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const [users] = await db.query('SELECT id, email, full_name, role FROM users WHERE email = ?', [email]);
    const user = users[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mark OTP as verified
    await db.query('UPDATE otp_verifications SET verified = ? WHERE id = ?', [true, otpRecord.id]);

    logger.info('User logged in', { email });
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
