const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const Next = require('next')
const http = require('http')
const balancesRouter = require('./routers/balances').getRouter
const jobs = require('./jobs')
const socketIo = require('socket.io')

const { NODE_ENV, PORT: ENV_PORT } = process.env
const PORT = ENV_PORT || 3025

var io

const getIo = () => io

const app = new Koa()
app.use(bodyParser())

const next = Next({ dev: NODE_ENV != 'production' })
const handler = next.getRequestHandler()

next.prepare()

const router = new Router()

router.get('/(.*)', async (ctx) => {
  await handler(ctx.req, ctx.res)
  ctx.respond = false
})

app.use(balancesRouter(jobs, getIo).routes())

app.use(router.routes())

app.on('error', (error) => {
  console.error('App error', error)
})

const httpServer = http.createServer(app.callback())
httpServer.listen(PORT)
io = socketIo(httpServer)

io.on('connection', (socket) => {
  console.log('socket.io client connected')
})
jobs.scheduleJobs(getIo)