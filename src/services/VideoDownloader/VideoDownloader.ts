interface DownloadResponse {
  id: string;
  path: string;
  url: string;
}

export interface VideoDownloader {
  download(url: string, outputPath: string): Promise<Nullable<DownloadResponse>>;
}
