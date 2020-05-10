const AntiVirus = require('./services/AntiVirus')
const SQS = require('./services/SQS')
const S3 = require('./services/S3')
const File = require('./services/File')

const AntiVirusRunner = require('./providers/AntiVirusRunner')

new AntiVirusRunner(AntiVirus, S3, SQS, File).init()
