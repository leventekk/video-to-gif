resource "aws_iam_user" "service_user" {
  name = "VideoToGifServiceUser"
}

data "aws_iam_policy_document" "dynamodb_policy" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:getitem",
      "dynamodb:putitem",
    ]
    resources = [for resource in var.dynamodb_tables_resources : "${resource}*"]
  }
}

data "aws_iam_policy_document" "s3_bucket_policy" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject"
    ]
    resources = [
      var.bucket_arn,
      "${var.bucket_arn}/*"
    ]
  }
}

resource "aws_iam_user_policy" "dynamodb_policy" {
  name   = "DynamoDBCacheTablePolicy"
  user   = aws_iam_user.service_user.name
  policy = data.aws_iam_policy_document.dynamodb_policy.json
}

resource "aws_iam_user_policy" "s3_bucket_policy" {
  name   = "S3BucketUploadPolicy"
  user   = aws_iam_user.service_user.name
  policy = data.aws_iam_policy_document.s3_bucket_policy.json
}

resource "aws_iam_access_key" "service_user" {
  user = aws_iam_user.service_user.name
}
