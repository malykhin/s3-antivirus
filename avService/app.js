const Koa = require('koa')
const logger = require('koa-logger')
const Router = require('koa-router')

const config = require('./config')
const AntiVirus = require('./services/AntiVirus')
const SQS = require('./services/SQS')
const S3 = require('./services/S3')
const File = require('./services/File')

const AntiVirusRunner = require('./providers/AntiVirusRunner')

const app = new Koa()
const router = new Router()

app.use(logger())

router.get('/bucket', (ctx, next) => {
  ctx.body = { buckets: [] }
  next()
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(config.PORT, () => console.log('Listening:', config.port))

new AntiVirusRunner(AntiVirus, S3, SQS, File).init()
