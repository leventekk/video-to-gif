export interface VideoCache {
  store(key: string, path: string): void;
  get(key: string): string;
  has(key: string): boolean;
}
