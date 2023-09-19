variable "assets_cache_table_name" {
  description = "S3 assets cache table"
  type        = string
  default     = "video-to-gif-assets-cache"
}

variable "runner_table_name" {
  description = "Job runner table name"
  type        = string
  default     = "video-to-gif-job-runner"
}
