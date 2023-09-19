export interface FileUploader {
  upload(path: string, name: string): Promise<Nullable<string>>;
}
