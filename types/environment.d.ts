declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      S3_ASSETS_BUCKET: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      DYNAMODB_ASSET_CACHE_TABLE: string;
      DYNAMODB_JOB_RUNNER_TABLE: string;
      PORT?: string;
    }
  }
}

export {};
