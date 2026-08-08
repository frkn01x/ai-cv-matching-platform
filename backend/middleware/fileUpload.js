const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const security = require('./security');
const logger = require('../utils/logger');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join('uploads', 'temp');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      logger.error('Error creating upload directory', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const sanitizedName = security.sanitizeFilename(file.originalname);
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

// File filter for security
const fileFilter = async function (req, file, cb) {
  try {
    // Check MIME type
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Invalid file extension'), false);
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: fileFilter
});

module.exports = upload;
