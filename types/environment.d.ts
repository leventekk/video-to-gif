declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      S3_BUCKET: string;
      S3_ACCESS_KEY: string;
      S3_SECRET_ACCESS_KEY: string;
      S3_REGION: string;
      DYNAMODB_CACHE_TABLE: string
      PORT?: string;
    }
  }
}

export {};
