import fastifyAuth from '@fastify/auth'
import compressPlugin from '@fastify/compress'
import fastifyCookies from '@fastify/cookie'
import fastifyFlash from '@fastify/flash'
import formbody from '@fastify/formbody'
import helmet from '@fastify/helmet'
import fastifyJWT from '@fastify/jwt'
import mongodb from '@fastify/mongodb'
import rateLimit from '@fastify/rate-limit'
import redis from '@fastify/redis'
import fastifySession from '@fastify/session'
import serve from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
// import GracefulServer from '@gquittet/graceful-server'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { fastifySchedulePlugin } = require('fastify-schedule')

const plugins = {
    fastifySchedulePlugin,
    compressPlugin,
    fastifyAuth,
    fastifyCookies,
    fastifyFlash,
    fastifyJWT,
    fastifySession,
    fastifySwagger,
    fastifyWebsocket,
    formbody,
    helmet,
    mongodb,
    rateLimit,
    redis,
    serve
}
export { plugins }

