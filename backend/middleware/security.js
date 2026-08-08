const sanitizeHtml = require('sanitize-html');
const logger = require('../utils/logger');

class SecurityMiddleware {
  // Sanitize all input to prevent XSS and injection attacks
  sanitizeInput(req, res, next) {
    try {
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }
      if (req.params) {
        req.params = sanitizeObject(req.params);
      }
      next();
    } catch (error) {
      logger.error('Input sanitization error', error);
      res.status(400).json({ error: 'Invalid input detected' });
    }
  }

  // Prevent XSS attacks
  preventXSS(req, res, next) {
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'string') {
        data = sanitizeHtml(data, {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
      originalSend.call(this, data);
    };
    next();
  }

  // Prevent prompt injection in AI interactions
  preventPromptInjection(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Patterns that indicate potential prompt injection
    const dangerousPatterns = [
      /ignore\s+(previous|above|all)\s+instructions?/gi,
      /system\s*:\s*/gi,
      /you\s+are\s+now/gi,
      /new\s+instructions?/gi,
      /disregard\s+(previous|above|all)/gi,
      /forget\s+(previous|everything)/gi,
      /<\s*script/gi,
      /javascript\s*:/gi,
      /on\w+\s*=/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        logger.warn('Potential prompt injection detected', { text: text.substring(0, 100) });
        throw new Error('Input contains potentially malicious content');
      }
    }

    // Limit special characters that could be used in injection
    const suspiciousChars = /[<>{}[\]\\$`]/g;
    const suspiciousCount = (text.match(suspiciousChars) || []).length;
    
    if (suspiciousCount > text.length * 0.1) {
      logger.warn('Excessive special characters detected');
      throw new Error('Input contains suspicious patterns');
    }

    return text;
  }

  // Validate file type using magic numbers
  validateFileType(buffer, allowedTypes) {
    const signatures = {
      'application/pdf': [0x25, 0x50, 0x44, 0x46] // %PDF
    };

    for (const [mimeType, signature] of Object.entries(signatures)) {
      if (allowedTypes.includes(mimeType)) {
        const matches = signature.every((byte, index) => buffer[index] === byte);
        if (matches) {
          return mimeType;
        }
      }
    }

    return null;
  }

  // Sanitize filename to prevent path traversal
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '_')
      .substring(0, 255);
  }
}

// Helper function to recursively sanitize objects
function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeHtml(key, {
        allowedTags: [],
        allowedAttributes: {}
      });
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

module.exports = new SecurityMiddleware();
