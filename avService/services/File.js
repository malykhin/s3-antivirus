const { createWriteStream, createReadStream } = require('fs')
const { unlink } = require('fs').promises

class File {
  constructor(path) {
    this.path = path
  }

  static setAntiVirusScanMethod(method) {
    File.isInfected = method
  }

  getWriteStream = () => createWriteStream(this.path)

  getReadStream = () => createReadStream(this.path)

  delete = () => unlink(this.path)

  isInfected = () => {
    if (!File.isInfected) {
      throw new Error('Set isInfected method first')
    }
    return File.isInfected(this.path)
  }
}

module.exports = File
