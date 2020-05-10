module.exports = {
  port: process.env.PORT,
  aws: {
    region: process.env.AWS_REGION,
    sqsEndpoint: process.env.AWS_SQS_ENDPOINT,
    s3Endpoint: process.env.AWS_S3_ENDPOINT,
    useLocalStack: process.env.AWS_USE_LOCAL_STACK,
  },
  fileCreationQueueUrl: process.env.FILE_CREATION_QUEUE_URL,
  safeBucketName: process.env.SAFE_BUCKET_NAME,
  quarantinePath: process.env.QUARANTINE_PATH,
  avStatusTagName: process.env.AV_STATUS_TAG_NAME,
  avStatusCleanValue: process.env.AV_STATUS_CLEAN_VALUE,
  avStatusInProgressValue: process.env.AV_STATUS_IN_PROGRESS_VALUE,
  avStatusInfectedValue: process.env.AV_STATUS_INFECTED_VALUE,
}
