const rabbitmqService = require('../config/rabbitmq');
const oracleCloudService = require('../services/oracleCloudService');
const logger = require('../utils/logger');

async function startBackupWorker() {
  try {
    await rabbitmqService.connect();
    
    logger.info('Backup worker started');

    await rabbitmqService.consumeMessages(
      rabbitmqService.queues.BACKUP,
      async (message) => {
        try {
          logger.info('Processing backup message', { type: message.type });

          if (message.type === 'cv_backup') {
            await oracleCloudService.uploadFile(
              message.filePath,
              message.fileName
            );

            logger.info('CV backup completed', {
              applicationId: message.applicationId,
              fileName: message.fileName
            });
          }
        } catch (error) {
          logger.error('Error processing backup message', error);
        }
      }
    );
  } catch (error) {
    logger.error('Backup worker error', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Backup worker shutting down');
  await rabbitmqService.close();
  process.exit(0);
});

startBackupWorker();
