const { promisify } = require('util')
const AWS = require('aws-sdk')

class SQS {
  constructor({ queueURL, region, useLocalStack = false, endpoint = '', receiveParams = {} }) {
    const sqsParams = {
      region,
    }
    if (useLocalStack) {
      sqsParams.endpoint = endpoint
    }
    this.queueURL = queueURL
    this.receiveParams = {
      MaxNumberOfMessages: receiveParams.maxNumberOfMessages || 1,
      QueueUrl: queueURL,
      WaitTimeSeconds: receiveParams.waitTimeSeconds || 20,
    }
    const sqs = new AWS.SQS(sqsParams)

    this.receiveMessage = promisify(sqs.receiveMessage).bind(sqs)
    this.sendMessage = promisify(sqs.sendMessage).bind(sqs)
    this.deleteMessage = promisify(sqs.deleteMessage).bind(sqs)
  }

  receive = () => this.receiveMessage(this.receiveParams)

  send = (message) => {
    const sendParams = {
      MessageBody: JSON.stringify(message),
      QueueUrl: this.queueURL,
    }
    return this.sendMessage(sendParams)
  }

  ack = (data) => {
    const deleteParams = {
      QueueUrl: this.queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle,
    }
    return this.deleteMessage(deleteParams)
  }

  messageProcessingSequence = async (successHandler, errorHandler) => {
    try {
      const data = await this.receive()
      if (data.Messages) {
        const message = JSON.parse(data.Messages[0].Body)
        await successHandler(message)
        await this.ack(data)
      }
    } catch (error) {
      await errorHandler(error)
    } finally {
      return this.messageProcessingSequence(successHandler, errorHandler)
    }
  }
}

module.exports = SQS
