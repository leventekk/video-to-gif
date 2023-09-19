import Ffmpeg from 'ffmpeg';

import { type Logger } from '../Logger/Logger';

import { type VideoConverter } from './VideoConverter';

export class FfmpegConverter implements VideoConverter {
  constructor(private loggerService: Logger) {}

  async convert(path: string, outputPath: string) {
    const logger = this.loggerService.child({ service: 'FfmpegConverter' });

    logger.info('Converting video to image: %s', path);

    try {
      const converterProcess = await new Ffmpeg(path);

      converterProcess.setVideoFormat('gif');
      // improve gif quality
      converterProcess.addCommand('-filter_complex', '"[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse"');

      return await converterProcess.save(outputPath);
    } catch (error) {
      logger.fatal(error);

      return null;
    }
  }
}
