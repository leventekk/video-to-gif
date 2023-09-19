export interface VideoCache {
  store(key: string, value: string): Promise<void>;
  get(key: string): Promise<Nullable<string>>;
}
