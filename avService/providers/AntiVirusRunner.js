const path = require('path')

const {
  quarantinePath,
  fileCreationQueueUrl,
  aws: { region, useLocalStack, sqsEndpoint, s3Endpoint },
  avStatusTagName,
  avStatusCleanValue,
  avStatusInProgressValue,
  avStatusInfectedValue,
  safeBucketName,
} = require('../config')

class AntiVirusRunner {
  constructor(AntiVirus, S3, SQS, File) {
    this.antiVirus = new AntiVirus()
    this.quarantinePath = quarantinePath
    this.safeBucketName = safeBucketName
    this.sqs = new SQS({
      region,
      queueURL: fileCreationQueueUrl,
      useLocalStack,
      endpoint: sqsEndpoint,
    })
    this.s3 = new S3({
      region,
      useLocalStack,
      endpoint: s3Endpoint,
    })
    this.File = File
  }

  copyFileFromS3 = async (bucketName, objectKey, file) => {
    return new Promise((resolve, reject) => {
      const fileStream = file.getWriteStream()
      const s3Stream = this.s3.getReadableStream(bucketName, objectKey)

      s3Stream.on('error', reject)
      s3Stream.pipe(fileStream).on('error', reject).on('close', resolve)
    })
  }

  copyFileToS3 = (bucketName, objectKey, file) => {
    const fileStream = file.getReadStream()
    return this.s3.uploadStream(bucketName, objectKey, fileStream)
  }

  processPayload = async (data) => {
    const {
      bucket: { name: bucketName },
      object: { key: objectKey },
    } = data.Records[0].s3

    const filePath = path.resolve(this.quarantinePath, objectKey)
    const file = new this.File(filePath)

    await this.copyFileFromS3(bucketName, objectKey, file)

    await this.s3.putTags(bucketName, objectKey, [{ Key: avStatusTagName, Value: avStatusInProgressValue }])

    const { is_infected: isInfected } = await file.isInfected()

    if (isInfected) {
      await this.s3.putTags(bucketName, objectKey, [{ Key: avStatusTagName, Value: avStatusInfectedValue }])
    } else {
      await this.copyFileToS3(this.safeBucketName, objectKey, file)
      await this.s3.putTags(bucketName, objectKey, [{ Key: avStatusTagName, Value: avStatusCleanValue }])
    }

    await file.delete()
  }

  handleError = async (error) => {
    console.log('error', error)
  }

  async init() {
    await this.antiVirus.init()
    this.File.setAntiVirusScanMethod(this.antiVirus.isInfected)
    this.sqs.messageProcessingSequence(this.processPayload, this.handleError)
  }
}

module.exports = AntiVirusRunner
