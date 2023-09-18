import Ffmpeg from 'ffmpeg';
import sharp from 'sharp';
import { type FastifyBaseLogger } from 'fastify';
import { type VideoConverter } from './VideoConverter';
import { createWriteStream } from 'fs';

export class FfmpegConverter implements VideoConverter {
  constructor(private loggerService: FastifyBaseLogger) {}

  async convert(path: string, outputPath: string) {
    const logger = this.loggerService.child({ service: 'FfmpegConverter' });

    logger.info('Converting video to image: %s', path);

    try {
      const converterProcess = await new Ffmpeg(path);

      converterProcess.setVideoFormat('gif');
      // improve gif quality
      converterProcess.addCommand('-filter_complex', '"[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse"');

      const convertedPath = await converterProcess.save(outputPath);

      // logger.info('Optimizing image');
      const optimizedBuffer = await sharp(convertedPath, {
        animated: true,
      })
        .gif({ effort: 10, interFrameMaxError: 10 })
        .toBuffer();

      const writeStream = createWriteStream(convertedPath);
      writeStream.write(optimizedBuffer);
      writeStream.end();

      return convertedPath;
    } catch (error) {
      logger.fatal(error);

      return null;
    }
  }
}
