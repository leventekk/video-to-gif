import { randomUUID } from 'node:crypto';
import { Logger } from '../Logger/Logger';
import { type JobRunner } from './JobRunner';
import { type JobCache } from '../JobCache/JobCache';
import { type Status } from '../../schema/job';
import { JobExecutionError } from '../../errors/JobExecutionError';
import { type VideoCache } from '../VideoCache/VideoCache';

export class VideoJobRunner implements JobRunner {
  private logger: Logger;

  constructor(private cacheService: JobCache, private videoCacheService: VideoCache, private loggerService: Logger) {
    this.logger = this.loggerService.child({ service: 'Job' });
  }

  private async check(url: string) {
    this.logger.info('Checking job status with URL: %s', url);

    return await this.cacheService.findByUrl(url);
  }

  private async create(url: string) {
    const generatedJobID = randomUUID();

    this.logger.info('Creating job with ID: %s for %s', generatedJobID, url);
    const { jobId, status } = await this.cacheService.create(generatedJobID, {
      status: 'created',
      url,
    });

    return { jobId, status };
  }

  private async updateStatus(jobId: string, status: Status) {
    this.logger.info('Updating job (%s) status to %s', jobId, status);
    await this.cacheService.update(jobId, {
      status,
    });
  }

  private async updateFailedStatus(jobId: string, reason: string) {
    this.logger.info('Updating failed job (%s) reason to %s', jobId, reason);
    await this.cacheService.update(jobId, {
      status: 'failed',
      reason,
    });
  }

  private async execute(jobId: string, taskToRun: () => Promise<void>) {
    new Promise(async resolve => {
      try {
        await this.updateStatus(jobId, 'running');
        await taskToRun();
        await this.updateStatus(jobId, 'completed');
      } catch (error) {
        this.logger.fatal(error);

        if (error instanceof JobExecutionError) {
          await this.updateFailedStatus(jobId, error.message);
        }
      } finally {
        resolve(null);
      }
    });
  }

  private async retrieveCompletedJobData(url: string) {
    return await this.videoCacheService.get(url);
  }

  async run(url: string, taskToRun: () => Promise<void>) {
    const jobFromCache = await this.check(url);

    if (jobFromCache) {
      if (jobFromCache.status === 'completed') {
        const assetUrl = await this.retrieveCompletedJobData(url);

        if (!assetUrl) {
          throw new JobExecutionError('Missing asset url');
        }

        return {
          ...jobFromCache,
          data: {
            url: assetUrl,
          },
        };
      }

      return jobFromCache;
    }

    const { jobId, status } = await this.create(url);
    this.execute(jobId, taskToRun);

    return {
      jobId,
      status,
    };
  }
}
