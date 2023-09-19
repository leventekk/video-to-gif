import { type Logger } from '../Logger/Logger';

import { type VideoCache } from './VideoCache';

const cache = new Map<string, string>();

export class MemoryCache implements VideoCache {
  private logger: Logger;

  constructor(private loggerService: Logger) {
    this.logger = this.loggerService.child({ service: 'MemoryCache' });
  }

  async store(key: string, value: string) {
    this.logger.info('Storing dataset %o in cache', { key, value });
    cache.set(key, value);
  }

  async get(key: string) {
    const data = cache.get(key);

    if (data) {
      this.logger.info('%s was found in cache: %s', key, data);

      return data;
    }

    this.logger.info('%s was not found in cache', key);

    return null;
  }
}
