output "assets_cache_table_arn" {
  value = aws_dynamodb_table.assets_cache.arn
}

output "job_runner_table_arn" {
  value = aws_dynamodb_table.job_runner.arn
}
