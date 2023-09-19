resource "aws_s3_bucket" "s3_video_assets" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_acl" "public_read" {
  bucket     = aws_s3_bucket.s3_video_assets.id
  acl        = "public-read"
  depends_on = [aws_s3_bucket_ownership_controls.s3_video_assets]
}

resource "aws_s3_bucket_ownership_controls" "s3_video_assets" {
  bucket = aws_s3_bucket.s3_video_assets.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
  depends_on = [aws_s3_bucket_public_access_block.bucket_access]
}

resource "aws_s3_bucket_public_access_block" "bucket_access" {
  bucket = aws_s3_bucket.s3_video_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "s3_video_assets" {
  bucket = aws_s3_bucket.s3_video_assets.id
  policy = data.aws_iam_policy_document.s3_video_assets_policy.json
  depends_on = [ aws_s3_bucket_public_access_block.bucket_access ]
}

data "aws_iam_policy_document" "s3_video_assets_policy" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    effect = "Allow"

    actions = [
      "s3:GetObject"
    ]

    resources = [
      aws_s3_bucket.s3_video_assets.arn,
      "${aws_s3_bucket.s3_video_assets.arn}/*",
    ]
  }
}
