const rabbitmqService = require('../config/rabbitmq');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

async function startEmailWorker() {
  try {
    await rabbitmqService.connect();
    
    logger.info('Email worker started');

    await rabbitmqService.consumeMessages(
      rabbitmqService.queues.EMAIL,
      async (message) => {
        try {
          logger.info('Processing email message', { type: message.type });

          switch (message.type) {
            case 'confirmation':
              await emailService.sendApplicationConfirmation(
                message.email,
                message.name,
                message.applicationId
              );
              break;

            case 'status':
              await emailService.sendApplicationStatus(
                message.email,
                message.name,
                message.status,
                message.message
              );
              break;

            case 'otp':
              await emailService.sendOTP(
                message.email,
                message.otp
              );
              break;

            default:
              logger.warn('Unknown email message type', { type: message.type });
          }

          logger.info('Email sent successfully', { type: message.type, email: message.email });
        } catch (error) {
          logger.error('Error processing email message', error);
        }
      }
    );
  } catch (error) {
    logger.error('Email worker error', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Email worker shutting down');
  await rabbitmqService.close();
  process.exit(0);
});

startEmailWorker();
