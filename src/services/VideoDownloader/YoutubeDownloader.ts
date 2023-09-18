import { type FastifyBaseLogger } from 'fastify';
import youtubeDL, { type YtFlags } from 'youtube-dl-exec';
import { type VideoDownloader } from './VideoDownloader';

export class YoutubeDownloader implements VideoDownloader {
  constructor(private loggerService: FastifyBaseLogger) {}

  async download(url: string, outputPath: string) {
    const logger = this.loggerService.child({ service: 'YoutubeDownloader' });

    logger.info('Received video url: %s', url);

    try {
      const downloadSettings: YtFlags = {
        format: 'bestvideo[height<=360]', // 360p
        // eslint-disable-next-line
        // @ts-ignore
        downloadSections: '*0-00:11',
        audioQuality: 9, // worst quality
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
      };

      const videoDetails = await youtubeDL(url, {
        skipDownload: true,
        dumpSingleJson: true,
        ...downloadSettings,
      });

      logger.info('Video downloaded to: %s', outputPath);

      await youtubeDL.exec(url, {
        ...downloadSettings,
        output: outputPath,
      });

      return {
        id: videoDetails.id,
        path: outputPath,
        url,
      };
    } catch (error) {
      logger.fatal(error);

      return null;
    }
  }
}
