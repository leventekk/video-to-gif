export interface VideoCache {
  store(key: string, path: string): Promise<void>;
  get(key: string): Promise<Nullable<string>>;
}
