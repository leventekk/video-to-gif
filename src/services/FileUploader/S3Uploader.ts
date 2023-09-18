import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'node:fs';
import { type FileUploader } from './FileUploader';
import { type Logger } from '../Logger/Logger';

interface S3Config {
  bucketName: string;
  accessKey: string;
  secretAccessKey: string;
  region: string;
}

export class S3Uploader implements FileUploader {
  constructor(private loggerService: Logger, private config: S3Config) {}

  private getObjectUrl(name: string) {
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${name}`;
  }

  async upload(path: string, name: string) {
    const logger = this.loggerService.child({ service: 'S3Uploader' });
    const client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretAccessKey,
      },
    });

    const uploadCommand = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: name,
      Body: readFileSync(path),
    });

    try {
      await client.send(uploadCommand);

      const objectUrl = this.getObjectUrl(name);
      logger.info('Uploaded file path: %s', objectUrl);

      return objectUrl;
    } catch (error) {
      logger.fatal(error);

      console.log({ error });

      return null;
    }
  }
}
