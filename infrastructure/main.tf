provider "aws" {
  region  = "eu-central-1"
  profile = "default"
}

module "s3" {
  source = "./modules/s3"

  bucket_name = "video-to-gif-assets"
}

module "dynamodb" {
  source = "./modules/dynamodb"

  assets_cache_table_name = "video-to-gif-assets-cache"
  runner_table_name       = "video-to-gif-job-runner"
}

module "iam_user" {
  source = "./modules/iam-user"

  bucket_arn = module.s3.bucket_arn

  dynamodb_tables_resources = [
    module.dynamodb.assets_cache_table_arn,
    module.dynamodb.job_runner_table_arn,
  ]
}
