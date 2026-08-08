const axios = require('axios');
const fs = require('fs').promises;
const crypto = require('crypto');
const logger = require('../utils/logger');

class OracleCloudService {
  constructor() {
    this.namespace = process.env.OCI_NAMESPACE;
    this.bucketName = process.env.OCI_BUCKET_NAME;
    this.region = process.env.OCI_REGION;
    this.tenancyId = process.env.OCI_TENANCY_ID;
    this.userId = process.env.OCI_USER_ID;
    this.fingerprint = process.env.OCI_FINGERPRINT;
    this.baseUrl = `https://objectstorage.${this.region}.oraclecloud.com`;
    
    // Private key can be loaded from file or base64 env variable
    this.privateKeyPath = process.env.OCI_PRIVATE_KEY_PATH;
    this.privateKeyBase64 = process.env.OCI_PRIVATE_KEY_BASE64;
  }

  async getPrivateKey() {
    if (this.privateKeyBase64) {
      // Decode base64 private key
      return Buffer.from(this.privateKeyBase64, 'base64').toString('utf8');
    } else if (this.privateKeyPath) {
      // Read from file
      return await fs.readFile(this.privateKeyPath, 'utf8');
    } else {
      throw new Error('Oracle Cloud private key not configured');
    }
  }

  async uploadFile(filePath, fileName) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const objectName = `cv-backups/${Date.now()}-${fileName}`;
      const encodedObjectName = encodeURIComponent(objectName);

      const url = `${this.baseUrl}/n/${this.namespace}/b/${this.bucketName}/o/${encodedObjectName}`;

      logger.info('Oracle Cloud upload attempt', {
        namespace: this.namespace,
        bucketName: this.bucketName,
        region: this.region,
        url: url,
        objectName: objectName
      });

      const timestamp = new Date().toUTCString();
      const privateKey = await this.getPrivateKey();
      const signature = this.generateSignature('PUT', encodedObjectName, timestamp, privateKey);

      await axios.put(url, fileBuffer, {
        headers: {
          'Date': timestamp,
          'Authorization': signature,
          'Content-Type': 'application/pdf',
          'Content-Length': fileBuffer.length
        }
      });

      logger.info('File uploaded to Oracle Cloud', { fileName: objectName });
      
      return {
        success: true,
        objectName: objectName,
        url: url
      };
    } catch (error) {
      logger.error('Oracle Cloud upload error', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw new Error('Failed to upload file to Oracle Cloud');
    }
  }

  async backupDatabase(backupData) {
    try {
      const fileName = `db-backup-${Date.now()}.json`;
      const tempPath = `uploads/temp/${fileName}`;

      await fs.writeFile(tempPath, JSON.stringify(backupData, null, 2));
      
      const result = await this.uploadFile(tempPath, fileName);
      
      await fs.unlink(tempPath);
      
      logger.info('Database backup completed', { fileName });
      return result;
    } catch (error) {
      logger.error('Database backup error', error);
      throw error;
    }
  }

  generateSignature(method, encodedObjectName, timestamp, privateKey) {
    // Oracle Cloud signing string - encodedObjectName should already be encoded
    const signingString = [
      `(request-target): ${method.toLowerCase()} /n/${this.namespace}/b/${this.bucketName}/o/${encodedObjectName}`,
      `date: ${timestamp}`,
      `host: objectstorage.${this.region}.oraclecloud.com`
    ].join('\n');
    
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signingString);
    sign.end();
    
    const signature = sign.sign(privateKey, 'base64');
    
    const keyId = `${this.tenancyId}/${this.userId}/${this.fingerprint}`;
    
    return `Signature version="1",headers="(request-target) date host",keyId="${keyId}",algorithm="rsa-sha256",signature="${signature}"`;
  }
}

module.exports = new OracleCloudService();
