const amqp = require('amqplib');
const logger = require('../utils/logger');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      EMAIL: 'email_queue',
      CV_PROCESSING: 'cv_processing_queue',
      BACKUP: 'backup_queue'
    };
  }

  async connect() {
    try {
      const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Declare queues
      for (const queue of Object.values(this.queues)) {
        await this.channel.assertQueue(queue, { durable: true });
      }

      logger.info('RabbitMQ connected and queues declared');
    } catch (error) {
      logger.error('RabbitMQ connection error', error);
      throw error;
    }
  }

  async publishMessage(queue, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      const messageBuffer = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(queue, messageBuffer, { persistent: true });
      logger.info(`Message published to ${queue}`);
    } catch (error) {
      logger.error(`Error publishing message to ${queue}`, error);
      throw error;
    }
  }

  async consumeMessages(queue, callback) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      await this.channel.consume(queue, async (msg) => {
        if (msg !== null) {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel.ack(msg);
        }
      });
      logger.info(`Started consuming messages from ${queue}`);
    } catch (error) {
      logger.error(`Error consuming messages from ${queue}`, error);
      throw error;
    }
  }

  async close() {
    try {
      await this.channel.close();
      await this.connection.close();
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection', error);
    }
  }
}

module.exports = new RabbitMQService();
