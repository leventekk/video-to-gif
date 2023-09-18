import { type FastifyBaseLogger } from 'fastify';
import { type VideoCache } from './VideoCache';

const cache = new Map<string, string>();

export class MemoryCache implements VideoCache {
  private logger: FastifyBaseLogger;

  constructor(private loggerService: FastifyBaseLogger) {
    this.logger = this.loggerService.child({ service: 'MemoryCache' });
  }

  async store(key: string, path: string) {
    this.logger.info('Storing dataset %o in cache', { key, path });
    cache.set(key, path);
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
