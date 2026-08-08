const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const pool = mysql.createPool(poolConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    logger.info('MySQL pool created successfully');
    connection.release();
  })
  .catch(err => {
    logger.error('Error creating MySQL pool', err);
  });

module.exports = pool;
