// eslint-disable-next-line
type LogFn = (msg: any, ...args: unknown[]) => void;

export interface Logger {
  child(options: Record<string, string>): Logger;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
  error: LogFn;
  fatal: LogFn;
}
