import { type FastifyBaseLogger } from 'fastify';
import { type VideoCache } from './VideoCache';

const cache = new Map<string, string>();

export class MemoryCache implements VideoCache {
  constructor(private loggerService: FastifyBaseLogger) {}

  store(key: string, path: string) {
    cache.set(key, path);
  }

  has(key: string) {
    const logger = this.loggerService.child({ service: 'MemoryCache' });
    const hasCachedData = cache.has(key);

    logger.info('%s was%s found in cache', key, hasCachedData ? '' : ' not');

    return hasCachedData;
  }

  get(key: string) {
    return cache.get(key)!;
  }
}
