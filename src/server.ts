import 'dotenv/config';
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { ConvertRequest, type ConvertRequestType } from './schema/convert';
import { YoutubeDownloader } from './services/VideoDownloader/YoutubeDownloader';
import { VideoService } from './services/VideoService/VideoService';
import { FfmpegConverter } from './services/VideoConverter/FffmpegConverter';
import { ProcessError } from './errors/ProcessError';
import { S3Uploader } from './services/FileUploader/S3Uploader';
import { DynamoDBCache } from './services/VideoCache/DynamoDBCache';
import { FastifyLogger } from './services/Logger/FastifyLogger';

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.get('/healthcheck', async function handler() {
  return 'ok';
});

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
    const logger = new FastifyLogger(request.log)
    const videoService = new VideoService(
      new YoutubeDownloader(logger),
      new DynamoDBCache(logger, {
        tableName: process.env.DYNAMODB_CACHE_TABLE!,
        accessKey: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        region: process.env.S3_REGION!,
      }),
      new FfmpegConverter(logger),
      new S3Uploader(logger, {
        bucketName: process.env.S3_BUCKET!,
        accessKey: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        region: process.env.S3_REGION!,
      }),
    );
    const videoProcess = await videoService.process(request.body.url.trim());

    if (videoProcess instanceof ProcessError) {
      throw videoProcess;
    }

    return { url: videoProcess };
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
