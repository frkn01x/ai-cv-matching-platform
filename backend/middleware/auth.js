const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const redisClient = require('../config/redis');

class AuthMiddleware {
  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Access token required' });
      }

      // Check if token is blacklisted
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({ error: 'Token is invalid' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Token verification failed', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  async verifyAdmin(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    } catch (error) {
      logger.error('Admin verification failed', error);
      return res.status(403).json({ error: 'Access forbidden' });
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP required' });
      }

      const storedOTP = await redisClient.get(`otp:${email}`);

      if (!storedOTP) {
        return res.status(400).json({ error: 'OTP expired or invalid' });
      }

      if (storedOTP !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      await redisClient.del(`otp:${email}`);
      next();
    } catch (error) {
      logger.error('OTP verification failed', error);
      return res.status(400).json({ error: 'OTP verification failed' });
    }
  }
}

module.exports = new AuthMiddleware();
