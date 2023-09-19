import { type Logger } from '../Logger/Logger';
import { type JobCache, type JobEntry } from './JobCache';

const cache = new Map<string, JobEntry>();

export class JobMemoryCache implements JobCache {
  private logger: Logger;

  constructor(private loggerService: Logger) {
    this.logger = this.loggerService.child({ service: 'JobMemoryCache' });
  }

  async create(key: string, value: JobEntry) {
    this.logger.info('Storing dataset %o in cache', { key, value });
    cache.set(key, value);

    return {
      jobId: key,
      status: value.status,
    };
  }

  async update(key: string, value: Omit<JobEntry, 'url'>) {
    const data = cache.get(key);

    if (data) {
      this.logger.info('Updating dataset %o in cache', { key, value });
      cache.set(key, {
        ...data,
        ...value,
      });
    }
  }

  async findByUrl(url: string) {
    let data = null;

    cache.forEach((dataset, jobId) => {
      if (dataset.url === url) {
        data = {
          jobId,
          ...dataset,
        };
      }
    });

    return data;
  }

  async get(key: string) {
    const data = cache.get(key);

    if (data) {
      this.logger.info('%s was found in cache: %s', key, data);

      return { jobId: key, ...data };
    }

    this.logger.info('%s was not found in cache', key);

    return null;
  }
}
