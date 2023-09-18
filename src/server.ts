import 'dotenv/config';
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { ConvertRequest, type ConvertRequestType } from './schema/convert';
import { YoutubeDownloader } from './services/VideoDownloader/YoutubeDownloader';
import { VideoService } from './services/VideoService/VideoService';
import { MemoryCache } from './services/VideoCache/MemoryCache';
import { FfmpegConverter } from './services/VideoConverter/FffmpegConverter';
import { ProcessError } from './errors/ProcessError';

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
    const videoService = new VideoService(
      new YoutubeDownloader(request.log),
      new MemoryCache(request.log),
      new FfmpegConverter(request.log)
    );
    const videoProcess = await videoService.process(request.body.url);

    if (videoProcess instanceof ProcessError) {
      throw videoProcess;
    }

    return { url: videoProcess };
  },
);

(async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
