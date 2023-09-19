import { rmSync } from 'node:fs';
import tmp from 'tmp';
import { ProcessError } from '../../errors/ProcessError';
import { type VideoCache } from '../VideoCache/VideoCache';
import { type VideoDownloader } from '../VideoDownloader/VideoDownloader';
import { type VideoConverter } from '../VideoConverter/VideoConverter';
import { type FileUploader } from '../FileUploader/FileUploader';

tmp.setGracefulCleanup();

export class VideoService {
  private videoTempFile: string;
  private mediaTempFile: string;

  constructor(
    private downloaderService: VideoDownloader,
    private cacheService: VideoCache,
    private converterService: VideoConverter,
    private uploaderService: FileUploader,
  ) {
    this.videoTempFile = tmp.tmpNameSync();
    this.mediaTempFile = tmp.tmpNameSync();
  }

  private cleanup() {
    rmSync(this.mediaTempFile);
    rmSync(this.videoTempFile);
  }

  private formatResponse(url: string) {
    return { url };
  }

  async process(videoUrl: string) {
    const cachedAssetUrl = await this.cacheService.get(videoUrl);

    if (cachedAssetUrl) {
      return this.formatResponse(cachedAssetUrl);
    }

    try {
      const downloadedVideo = await this.downloaderService.download(videoUrl, this.videoTempFile);

      if (!downloadedVideo) {
        return new ProcessError('Error during the video download');
      }

      const fileName = `${downloadedVideo.id}.gif`;
      const gifPath = await this.converterService.convert(downloadedVideo.path, this.mediaTempFile);

      if (!gifPath) {
        return new ProcessError('Error during the gif conversion');
      }

      const assetUrl = await this.uploaderService.upload(gifPath, fileName);

      if (!assetUrl) {
        return new ProcessError('Error during the file upload');
      }

      await this.cacheService.store(videoUrl, assetUrl);

      return this.formatResponse(assetUrl);
    } catch (error) {
      throw error;
    } finally {
      this.cleanup();
    }
  }
}
