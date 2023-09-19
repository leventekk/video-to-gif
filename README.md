# Youtube To Gif

The YouTube to GIF API is a versatile and powerful tool designed to simplify the process of generating GIFs
from YouTube videos. With two distinct modes of operation, it offers flexibility to suit various use cases,
making GIF generation seamless and efficient.

### Synchronous Mode:

In synchronous mode, the API can generate GIFs instantly with a single API call.
This is perfect for applications that require immediate GIF creation without the need for job queues or
background processing.

### Job Queue Mode:

For scenarios where processing time is less critical, the API seamlessly integrates with job queues.
This enables you to submit video-to-GIF conversion tasks to a queue, allowing your application to efficiently
handle GIF generation in the background, freeing up resources for other tasks.

### AWS S3 Integration:

The YouTube to GIF API provides native integration with Amazon Web Services (AWS) Simple Storage Service (S3).
This allows you to effortlessly upload the converted GIFs to your S3 buckets, ensuring secure and scalable storage
for your media assets.

### Caching Layers:

To enhance performance and reduce processing time, the API incorporates advanced caching mechanisms.
It offers two caching options:

**In-Memory Caching**: Store frequently accessed data in memory for lightning-fast retrieval, minimizing the need
for repeated processing.

**DynamoDB Caching:** For persistence and scalability, you can use DynamoDB as a caching layer, providing long-term
storage of key data for your GIF conversion tasks.

Whether you need immediate GIF generation, background processing, seamless AWS S3 integration, or efficient caching,
the YouTube to GIF API is a valuable addition to your application stack.
It empowers you to deliver dynamic and engaging content while optimizing performance and resource utilization.

## Requirements

- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [ffmpeg](https://ffmpeg.org/)

## Setup

In order to run the project, you need to install the requirements, after that you can install the dependencies:

```bash
pnpm install
```

Before running the project, you need to setup and fill the environment variables that's required for the project.

To run the development server, please use the following command

```bash
pnpm dev
```

If you would like to build the project, you can use this command:

```bash
pnpm build
```

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

#### S3

Is used for storing and serving the generated assets

#### DynamoDB

Is used for tracking the job runner process and for caching the response for the given url

#### IAM User

Is used to separate and restrict the permissions for the related services.

#### Retrieving the created user credentials

```bash
terraform state pull | jq '.resources[] | select(.type == "aws_iam_access_key") | .instances[0].attributes'
```
