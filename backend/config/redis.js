const redis = require('redis');
const logger = require('../utils/logger');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379
  },
  password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

module.exports = redisClient;
