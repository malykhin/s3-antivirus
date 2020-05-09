const { createWriteStream } = require('fs')
const { unlink } = require('fs').promises

class File {
  constructor(path) {
    this.path = path
  }

  getReadStream = () => createWriteStream(this.path)

  delete = () => unlink(this.path)
}

module.exports = File
