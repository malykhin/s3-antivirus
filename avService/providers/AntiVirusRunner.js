const path = require('path')

const {
  quarantinePath,
  fileCreationQueueUrl,
  aws: { region, useLocalStack, sqsEndpoint, s3Endpoint },
  avStatusTagName,
  avStatusCleanValue,
  avStatusInProgressValue,
  avStatusInfectedValue,
} = require('../config')

class AntiVirusRunner {
  constructor(AntiVirus, S3, SQS, File) {
    this.antiVirus = new AntiVirus()
    this.quarantinePath = quarantinePath
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

  copyFile = async (bucketName, objectKey, file) => {
    return new Promise((resolve, reject) => {
      const fileStream = file.getReadStream()
      const s3Stream = this.s3.getReadableStream(bucketName, objectKey)

      s3Stream.on('error', reject)
      s3Stream.pipe(fileStream).on('error', reject).on('close', resolve)
    })
  }

  processPayload = async (data) => {
    const {
      bucket: { name: bucketName },
      object: { key: objectKey },
    } = data.Records[0].s3

    const filePath = path.resolve(this.quarantinePath, objectKey)
    const file = new this.File(filePath)

    await this.copyFile(bucketName, objectKey, file)

    await this.s3.putTags(bucketName, objectKey, [{ Key: avStatusTagName, Value: avStatusInProgressValue }])

    const { is_infected: isInfected } = await this.antiVirus.isInfected(filePath)

    await file.delete()

    if (isInfected) {
      await this.s3.putTags(bucketName, objectKey, [{ Key: avStatusTagName, Value: avStatusInfectedValue }])
    } else {
      await this.s3.putTags(bucketName, objectKey, [{ Key: avStatusTagName, Value: avStatusCleanValue }])
    }
  }

  handleError = async (error) => {
    console.log('error', error)
  }

  async init() {
    await this.antiVirus.init()
    this.sqs.messageProcessingSequence(this.processPayload, this.handleError)
  }
}

module.exports = AntiVirusRunner
