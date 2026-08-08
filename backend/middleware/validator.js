const { body, validationResult } = require('express-validator');

class Validator {
  validateApplication() {
    return [
      body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2-100 characters')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
        .withMessage('Full name can only contain letters'),
      
      body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
      
      body('phone')
        .trim()
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Valid phone number required (10-15 digits)'),
      
      body('position')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Position must be between 2-100 characters'),
      
      body('experience')
        .isInt({ min: 0, max: 50 })
        .withMessage('Experience must be between 0-50 years'),
      
      body('coverLetter')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Cover letter must not exceed 2000 characters')
    ];
  }

  validateLogin() {
    return [
      body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
      
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
    ];
  }

  validateOTP() {
    return [
      body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
      
      body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be 6 digits')
    ];
  }

  checkValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
}

module.exports = new Validator();
