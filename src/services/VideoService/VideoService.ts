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

  async process(url: string) {
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    }

    try {
      const downloadedVideo = await this.downloaderService.download(url, this.videoTempFile);

      if (!downloadedVideo) {
        return new ProcessError('Error during the video download');
      }

      const fileName = `${downloadedVideo.id}.gif`;
      const gifPath = await this.converterService.convert(downloadedVideo.path, this.mediaTempFile);

      if (!gifPath) {
        return new ProcessError('Error during the gif conversion');
      }

      const uploadPath = await this.uploaderService.upload(gifPath, fileName);

      if (!uploadPath) {
        return new ProcessError('Error during the file upload');
      }

      this.cacheService.store(url, uploadPath);

      return uploadPath;
    } catch (error) {
      throw error;
    } finally {
      this.cleanup();
    }
  }
}
