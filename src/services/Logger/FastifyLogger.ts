import { type FastifyBaseLogger } from 'fastify';

import { type Logger } from './Logger';

export class FastifyLogger implements Logger {
  constructor(private loggerService: FastifyBaseLogger) {}

  child(options: Record<string, string>) {
    return this.loggerService.child(options);
  }

  // eslint-disable-next-line
  info(msg: any, ...args: unknown[]) {
    this.loggerService.info(msg, args);
  }

  // eslint-disable-next-line
  debug(message: any, ...args: unknown[]) {
    this.loggerService.debug(message, ...args);
  }

  // eslint-disable-next-line
  warn(message: any, ...args: unknown[]) {
    this.loggerService.warn(message, ...args);
  }

  // eslint-disable-next-line
  error(message: any, ...args: unknown[]) {
    this.loggerService.error(message, ...args);
  }

  // eslint-disable-next-line
  fatal(message: any, ...args: unknown[]) {
    this.loggerService.fatal(message, ...args);
  }
}
