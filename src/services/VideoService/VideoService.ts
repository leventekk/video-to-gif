import { rmSync } from 'node:fs';

import { setGracefulCleanup, tmpNameSync } from 'tmp';

import { ProcessError } from '@error/ProcessError';
import { type FileUploader } from '@service/FileUploader/FileUploader';
import { type VideoCache } from '@service/VideoCache/VideoCache';
import { type VideoConverter } from '@service/VideoConverter/VideoConverter';
import { type VideoDownloader } from '@service/VideoDownloader/VideoDownloader';

setGracefulCleanup();

export class VideoService {
  private videoTempFile: string;
  private mediaTempFile: string;

  constructor(
    private downloaderService: VideoDownloader,
    private cacheService: VideoCache,
    private converterService: VideoConverter,
    private uploaderService: FileUploader,
  ) {
    this.videoTempFile = tmpNameSync();
    this.mediaTempFile = tmpNameSync();
  }

  private cleanup() {
    try {
      rmSync(this.mediaTempFile);
      rmSync(this.videoTempFile);
    } catch (_) {}
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
        throw new ProcessError('Error during the video download');
      }

      const fileName = `${downloadedVideo.id}.gif`;
      const gifPath = await this.converterService.convert(downloadedVideo.path, this.mediaTempFile);

      if (!gifPath) {
        throw new ProcessError('Error during the gif conversion');
      }

      const assetUrl = await this.uploaderService.upload(gifPath, fileName);

      if (!assetUrl) {
        throw new ProcessError('Error during the file upload');
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
