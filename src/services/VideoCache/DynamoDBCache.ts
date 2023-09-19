import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

import { type Logger } from '../Logger/Logger';

import { type VideoCache } from './VideoCache';

interface DynamoDBConfig {
  tableName: string;
  accessKey: string;
  secretAccessKey: string;
  region: string;
}

export class DynamoDBCache implements VideoCache {
  private client: DynamoDBClient;
  private logger: Logger;

  constructor(
    private loggerService: Logger,
    private config: DynamoDBConfig,
  ) {
    this.logger = this.loggerService.child({ service: 'DynamoDBCache' });
    this.client = new DynamoDBClient({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async store(key: string, value: string) {
    this.logger.info('Storing dataset %o in cache', { key, value });

    await this.client.send(
      new PutItemCommand({
        TableName: this.config.tableName,
        Item: {
          VideoUrl: { S: key },
          ImageUrl: { S: value },
        },
      }),
    );
  }

  async get(key: string) {
    const { Item } = await this.client.send(
      new GetItemCommand({
        TableName: this.config.tableName,
        Key: {
          VideoUrl: { S: key },
        },
      }),
    );

    if (Item?.ImageUrl?.S) {
      this.logger.info('%s was found in cache: %s', key, Item.ImageUrl.S);

      return Item.ImageUrl.S;
    }

    this.logger.info('%s was not found in cache', key);

    return null;
  }
}
