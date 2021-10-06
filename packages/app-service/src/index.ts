/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 21:22:31
 * @Description: 
 */

import * as express from 'express'
import { parseToken, splitBearerToken } from './lib/utils/token'
import Config from './config'
import { router } from './router/index'
import { logger } from './lib/logger'
import { generateUUID } from './lib/utils/rand'

/**
 * Just for generating declaration type files for `@/cloud-sdk` which used in cloud function
 */
export * from './cloud-sdk'

const server = express()
server.use(express.json() as any)
server.use(express.urlencoded({
  extended: true
}) as any)

/**
 * Allow CORS by default
 */
server.all('*', function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('X-Powered-By', 'LaF Server')
  next()
})

/**
 * Parsing bearer token
 */
server.use(function (req, res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] = generateUUID()
  logger.info(requestId, `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'} ${req.get('user-agent')}`)
  logger.trace(requestId, `${req.method} ${req.url}`, { body: req.body, headers: req.headers, auth })
  res.set('requestId', requestId)
  next()
})

server.use(router)

server.listen(Config.PORT, () => logger.info(`server ${process.pid} listened on ${Config.PORT}`))