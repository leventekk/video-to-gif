# Youtube To Gif

## Environment variables

```
PORT=3000
S3_BUCKET=s3-bucket-name
S3_ACCESS_KEY=aws-access-key
S3_SECRET_ACCESS_KEY=aws-secret-key
S3_REGION=aws-region
DYNAMODB_ASSET_CACHE_TABLE=video-cache-table-name
DYNAMODB_JOB_RUNNER_TABLE=video-cache-table-name
```

## Infrastructure

The base config is generated with Terraform with the following services:

### S3

Is used for storing and serving the generated assets

### DynamoDB

Is used for tracking the job runner process and for caching the response for the given url

### IAM User

Is used to separate and restrict the permissions for the related services.

### Retrieving the created user credentials

```bash
terraform state pull | jq '.resources[] | select(.type == "aws_iam_access_key") | .instances[0].attributes'
```

## Requirements

- yt-dlp
- ffmpeg
