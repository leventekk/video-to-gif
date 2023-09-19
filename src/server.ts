import 'dotenv/config';

import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify from 'fastify';

import { JobExecutionError } from '@error/JobExecutionError';
import { ProcessError } from '@error/ProcessError';
import { ConvertRequest, type ConvertRequestType } from '@schema/convert';
import { JobResponse, type JobResponseType } from '@schema/job';
import { S3Uploader } from '@service/FileUploader/S3Uploader';
import { VideoJobRunner } from '@service/Job/VideoJobRunner';
import { JobMemoryCache } from '@service/JobCache/JobMemoryCache';
import { FastifyLogger } from '@service/Logger/FastifyLogger';
import { type Logger } from '@service/Logger/Logger';
import { DynamoDBCache } from '@service/VideoCache/DynamoDBCache';
import { type VideoCache } from '@service/VideoCache/VideoCache';
import { FfmpegConverter } from '@service/VideoConverter/FffmpegConverter';
import { YoutubeDownloader } from '@service/VideoDownloader/YoutubeDownloader';
import { VideoService } from '@service/VideoService/VideoService';

function prepare(url: string) {
  return url.trim();
}

function createAssetCacheLayer(logger: Logger) {
  return new DynamoDBCache(logger, {
    tableName: process.env.DYNAMODB_ASSET_CACHE_TABLE!,
    accessKey: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
  });
}

function createVideoService(logger: Logger, assetCacheLayer: VideoCache) {
  return new VideoService(
    new YoutubeDownloader(logger),
    assetCacheLayer,
    new FfmpegConverter(logger),
    new S3Uploader(logger, {
      bucketName: process.env.S3_ASSETS_BUCKET!,
      accessKey: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION!,
    }),
  );
}

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.get('/healthcheck', async function handler() {
  return 'ok';
});

fastify.post<{ Body: ConvertRequestType; Reply: JobResponseType }>(
  '/create-job',
  {
    schema: {
      body: ConvertRequest,
      response: {
        200: JobResponse,
      },
    },
  },
  async function handler(request) {
    const logger = new FastifyLogger(request.log);
    const assetCacheLayer = createAssetCacheLayer(logger);
    const videoService = createVideoService(logger, assetCacheLayer);
    const runner = new VideoJobRunner(new JobMemoryCache(logger), assetCacheLayer, logger);
    const jobRunnerCallback = async () => {
      try {
        await videoService.process(prepare(request.body.url));
      } catch (error) {
        if (error instanceof ProcessError) {
          throw new JobExecutionError(error.message);
        }
      }
    };

    return await runner.run(prepare(request.body.url), jobRunnerCallback);
  },
);

fastify.post<{ Body: ConvertRequestType; Reply: ConvertRequestType }>(
  '/convert',
  {
    schema: {
      body: ConvertRequest,
      response: {
        200: ConvertRequest,
      },
    },
  },
  async function handler(request) {
    const logger = new FastifyLogger(request.log);
    const videoService = createVideoService(logger, createAssetCacheLayer(logger));
    const processedVideo = await videoService.process(prepare(request.body.url));

    if (processedVideo instanceof ProcessError) {
      throw processedVideo;
    }

    return processedVideo;
  },
);

(async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT ?? 3000) });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
