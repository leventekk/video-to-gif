variable "bucket_arn" {
  description = "S3 Bucket ARN for the upload object policy"
  type        = string
}

variable "dynamodb_tables_resources" {
  description = "DynamoDB tables for job runner and asset caching"
  type        = list(string)
  default     = []
}
