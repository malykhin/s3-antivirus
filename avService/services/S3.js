const { promisify } = require('util')
const AWS = require('aws-sdk')

class S3 {
  constructor({ region, useLocalStack = false, endpoint = '' }) {
    const s3Params = {
      region,
    }
    if (useLocalStack) {
      s3Params.endpoint = endpoint
      s3Params.s3ForcePathStyle = true
    }
    const s3 = new AWS.S3(s3Params)

    this.s3 = s3
    this.putObjectTagging = promisify(s3.putObjectTagging).bind(s3)
  }

  getReadableStream = (bucket, key) => this.s3.getObject({ Bucket: bucket, Key: key }).createReadStream()

  uploadStream = (bucket, key, readStream) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: readStream,
    }

    return new Promise((resolve, reject) => {
      this.s3.upload(params, (error, data) => {
        readStream.destroy()
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

  putTags(bucket, key, tags) {
    const params = {
      Bucket: bucket,
      Key: key,
      Tagging: {
        TagSet: tags,
      },
    }
    return this.putObjectTagging(params)
  }
}

module.exports = S3
