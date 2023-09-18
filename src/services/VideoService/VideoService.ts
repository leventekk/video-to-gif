import tmp from 'tmp';
import { ProcessError } from '../../errors/ProcessError';
import { type VideoCache } from '../VideoCache/VideoCache';
import { type VideoDownloader } from '../VideoDownloader/VideoDownloader';
import { type VideoConverter } from '../VideoConverter/VideoConverter';

tmp.setGracefulCleanup();

export class VideoService {
  constructor(
    private downloaderService: VideoDownloader,
    private cacheService: VideoCache,
    private converterService: VideoConverter,
  ) {}

  async process(url: string) {
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    }

    const videoTmpFile = tmp.tmpNameSync();
    const gifTmpFile = tmp.tmpNameSync({
      postfix: '.gif',
    });

    const video = await this.downloaderService.download(url, videoTmpFile);

    if (!video) {
      return new ProcessError('Error during the video downloading');
    }

    const gifPath = await this.converterService.convert(video.path, gifTmpFile);

    if (!gifPath) {
      return new ProcessError('Error during the gif conversion');
    }

    this.cacheService.store(url, gifPath);

    return gifPath;
  }
}
