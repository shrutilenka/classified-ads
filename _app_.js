import fastifyAuth from '@fastify/auth'
import fastifyCompress from '@fastify/compress'
import fastifyCookies from '@fastify/cookie'
import fastifyFlash from '@fastify/flash'
import fastifyFormbody from '@fastify/formbody'
import fastifyHelmet from '@fastify/helmet'
import fastifyJWT from '@fastify/jwt'
import fastifyMongodb from '@fastify/mongodb'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyRedis from '@fastify/redis'
import fastifySession from '@fastify/session'
import fastifyServe from '@fastify/static'
import fastifySwagger from '@fastify/swagger'
import fastifyWebsocket from '@fastify/websocket'
import i18nextMiddleware from 'i18next-http-middleware'
// import GracefulServer from '@gquittet/graceful-server'
import { createRequire } from 'module'
import viewsPlugin from 'point-of-view'
const require = createRequire(import.meta.url)
const { fastifySchedule } = require('fastify-schedule')

const plugins = {
    fastifySchedule,
    i18nextMiddleware,
    fastifyCompress,
    fastifyAuth,
    fastifyCookies,
    fastifyFlash,
    fastifyJWT,
    fastifySession,
    fastifySwagger,
    fastifyWebsocket,
    viewsPlugin,
    fastifyFormbody,
    fastifyHelmet,
    fastifyMongodb,
    fastifyRateLimit,
    fastifyRedis,
    fastifyServe,
}
export { plugins }

