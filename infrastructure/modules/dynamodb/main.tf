resource "aws_dynamodb_table" "assets_cache" {
  name         = var.assets_cache_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "VideoUrl"

  attribute {
    name = "VideoUrl"
    type = "S"
  }
}

resource "aws_dynamodb_table" "job_runner" {
  name         = var.runner_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "JobId"

  attribute {
    name = "JobId"
    type = "S"
  }

  attribute {
    name = "VideoUrl"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }

  global_secondary_index {
    name            = "VideoUrlIndex"
    hash_key        = "VideoUrl"
    projection_type = "KEYS_ONLY"
  }
}
