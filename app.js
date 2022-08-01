import assert from 'assert'
import { config as dotenv } from 'dotenv'
import * as Eta from 'eta'
import fastify_ from 'fastify'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { createRequire } from 'module'
import crypto from 'node:crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import bootstrap from './bootstrap/bootstrap.js'
import { options } from './config/options/_options_.js'
import config from './configuration.js'
import { softVerifyJWT, testVerifyJWT, verifyJWT, wsauth } from './libs/decorators/jwt.js'
import isSpam from './libs/decorators/spam.js'
import valuesMapping from './libs/decorators/valuesMapping.js'
import isBot from './libs/decorators/visitorsFilter.js'
import { routes } from './libs/routes/_routes_.js'
import Mailer from './libs/services/mailer.js'
import { cache } from './libs/services/mongo-mem.js'
import RedisAPI from './libs/services/redis.js'
import { plugins } from './_app_.js'

const { helmet, logger, swagger } = options
const { adminRouter, authRouter, chatRouter, dataRouter, debugRouter, indexRouter, listingsRouter, wvRouter } = routes
const { fastifyCompress, fastifyAuth, fastifyCookies, fastifyFlash, fastifyJWT, GracefulServer } = plugins
const { fastifySchedule, i18nextMiddleware, fastifySession, fastifySwagger, fastifyWebsocket, viewsPlugin } = plugins
const { fastifyFormbody, fastifyHelmet, fastifyMongodb, fastifyRateLimit, fastifyRedis, fastifyServe, fastifyMetrics } =
    plugins

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

dotenv()

// Incremental is better
const NODE_ENV = {
    api: -1,
    localhost: 0,
    production: 1,
}[process.env.NODE_ENV]

const dbName = 'listings_db'
// In case we add ElasticSearch we can benefit 'swagger-stats'
// downloadFile('http://localhost:3000/documentation/json', 'swagger.json')
// const apiSpec = require('./swagger.json')
// async function setSwaggerStats(fastify, opts) {
//     await fastify.register(require('@fastify/express'))
//     fastify.register(swStats.getFastifyPlugin, { })
// }

/**
 * Initialize the fastify app. It could be called many time
 * for NodeJS cluster case
 */
/**
 * build a Fastify instance and run a server or not
 * @param { Boolean } doRun if true run the app on a server
 * @returns { Promise <import('fastify').FastifyInstance> }
 */
async function build(doRun) {
    const fastify = fastify_({
        logger: logger(),
        disableRequestLogging: true,
        keepAliveTimeout: 10000,
        requestTimeout: 5000,
    })
    const gracefulServer = GracefulServer(fastify.server)
    // TODO: manage open resources (not working !)
    gracefulServer.on(GracefulServer.READY, () => {
        fastify.log.info('Server is ready')
        console.log('Server is ready')
    })
    gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
        fastify.log.error('Server is shutting down')
        console.error('Server is shutting down')
    })
    gracefulServer.on(GracefulServer.SHUTDOWN, (error) => {
        fastify.log.error('Server is down because of', error.message)
        console.error('Server is down because of', error.message)
    })
    // TODO: SERVE STATIC CONTENT! LATER PREFERABLY ON A SEPARATE SERVER WITH PROPER PROTECTION
    fastify.register(fastifyServe, { root: path.join(__dirname, 'public') })

    fastify.register(fastifyServe, {
        root: path.join(__dirname, 'other_apps/so-cards/'),
        prefix: '/u/',
        decorateReply: false,
    })
    fastify.register(fastifyServe, {
        root: path.join(__dirname, `static/${config('APP_NAME')}`),
        prefix: '/static/',
        decorateReply: false,
    })

    fastify.decorate('conf', (tag) => config(tag))

    fastify.register(fastifySchedule)
    fastify.register(fastifyFormbody)
    fastify.register(fastifyWebsocket)

    //  !!Run only on one node!!
    if (NODE_ENV === 0 /*&& process.env.worker_id == '1'*/) {
        fastify.register(fastifySwagger, swagger)
        console.log(
            `Please check localhost:${process.env.PORT || fastify.conf('NODE_PORT')}/documentation it's a nice start`,
        )
        // fastify.register(setSwaggerStats)
        // setTimeout(() => {
        //     console.log(swStats.getCoreStats())
        // }, 10000)
    }
    fastify.register(fastifyHelmet, helmet())
    // fastify.register(cors, require('./config/options/cors'))
    // fastify.register(fastifyCompress) // Compress all possible types > 1024o
    fastify.register(fastifyMongodb, { forceClose: true, url: config('MONGODB_URI', { dbName }) })
    fastify.register(fastifyRedis, { host: config('REDIS_HOST'), port: 6379, password: config('PASSWORD') })

    await fastify.register(fastifyJWT, { secret: process.env.JWT_SECRET })
    await fastify.register(fastifyAuth)
    // TODO: fastify.after(routes)
    fastify.register(fastifyCookies)
    fastify.register(fastifySession, {
        cookieName: 'session',
        secret: crypto.randomBytes(16).toString('hex'),
        cookie: {
            secure: false,
            maxAge: 2592000000,
        },
    })
    fastify.register(fastifyFlash)

    // Set authentication as soon as possible
    // after necessary plugins have been loaded
    fastify.decorate('verifyJWT', verifyJWT)
    fastify.decorate('softVerifyJWT', softVerifyJWT)
    fastify.decorate('testVerifyJWT', testVerifyJWT)
    fastify.decorate('wsauth', wsauth)

    // Same db instance all over the all over the app.
    // never close !
    // const { db } = fastify.mongo

    const mongoURL = config('MONGODB_URI', { dbName })

    /*********************************************************************************************** */
    // Seeming heavy so use/register these after starting the app
    // !!TRANSLATIONS !!
    i18next
        .use(Backend)
        .use(i18nextMiddleware.LanguageDetector)
        .init({
            backend: {
                loadPath: __dirname + '/data/locales/{{lng}}/common.json',
            },
            fallbackLng: process.env.DEFAULT_LANG,
            preload: ['en-US', 'ar', 'fr', 'de'],
            cookiename: 'locale',
            detection: {
                order: ['cookie'],
                lookupCookie: 'locale',
                caches: ['cookie'],
            },
            // cache: {
            //     enabled: true,
            // },
            // load: 'languageOnly',
            // TODO: what's going on with en and en-US!!
            // debug: NODE_ENV < 1,
        })
    fastify.register(i18nextMiddleware.plugin, {
        i18next,
        ignoreRoutes: ['/data/', '/admin/'],
    })
    // Ping this from client side to change default language
    fastify.get('/i18n/:locale', (req, reply) => {
        reply.cookie('locale', req.params.locale, { path: '/' })
        req.i18n.changeLanguage(req.params.locale)
        if (req.headers.referer) reply.redirect(req.headers.referer)
        else reply.redirect('/')
    })
    /*********************************************************************************************** */
    // TODO: find a way to strip very long ejs logging errors
    fastify.register(viewsPlugin, {
        engine: {
            eta: Eta,
        },
        templates: 'templates',
        options: { useWith: true },
    })
    /*********************************************************************************************** */
    // !!PREHANDERS AND HOOKS !!
    fastify.addHook('onRequest', (req, reply, done) => {
        const perPage = 12
        const page = req.query.p || 1
        req.pagination = { perPage: perPage, page: page }
        done()
    })
    fastify.addHook('onRequest', isBot)
    fastify.addHook('preValidation', valuesMapping)
    // Mine topK events
    // fastify.addHook('preHandler', miner)

    /*********************************************************************************************** */
    // !!SPAM ASSASSIN !!
    if (NODE_ENV === 1) {
        fastify.register(fastifyRateLimit, config('PING_LIMITER'))
    }

    // against 404 endpoint ddos
    // fastify.setNotFoundHandler({
    //     preHandler: fastify.rateLimit()
    // }, function (request, reply) {
    //     reply.code(404).send({ hello: 'world' })
    // })

    // TODO: Rate limiter && honeyPot except in process.env === "api"
    fastify.addHook('onRequest', isSpam)

    const localize = {
        en: require('ajv-i18n/localize/en'),
        'en-US': require('ajv-i18n/localize/en'),
        ar: require('ajv-i18n/localize/ar'),
        fr: require('ajv-i18n/localize/fr'),
    }

    // All unhandled errors which are handled by fastify: just send http response
    fastify.setErrorHandler(function (error, request, reply) {
        if (reply.statusCode === 429) {
            error.message = 'You hit the rate limit! Slow down please!'
            reply.send(error)
            return reply
        }

        if (error.validation) {
            localize[request.cookies.locale || 'en'](error.validation)
            reply.status(422).send(error.validation)
            return reply
        }
        error.message = error.message.slice(0, 3000)
        request.log.error(error)
        error.message = 'Server is having hard times :( Please try again later.'
        reply.status(409).send(error)
    })

    /*********************************************************************************************** */
    // !!REGISTER ROUTES !!
    fastify.register(authRouter)
    fastify.register(indexRouter)
    fastify.register(adminRouter, { prefix: 'admin' })
    fastify.register(listingsRouter, { prefix: 'listings' })
    fastify.register(dataRouter, { prefix: 'data' })
    if (NODE_ENV < 1) {
        fastify.register(debugRouter, { prefix: 'debug' })
    }
    // TODO: CHAT @@@@@@@@@@@@@
    // fastify.register(chatRouter, { prefix: 'chat' })
    fastify.register(wvRouter, { prefix: 'wv' })

    /*********************************************************************************************** */
    // !!APP AND USER METRICS!!
    // Don't track for api env (API testing)
    const secretPath = process.env.SECRET_PATH
    const promURL = `/${secretPath}/metrics`
    // const adminAuth = fastify.auth([fastify.verifyJWT('admin')])
    if (NODE_ENV > -1 && process.env.worker_id == '1') {
        fastify.register(fastifyMetrics, { endpoint: promURL /*routeMetrics: { routeBlacklist: promURL }*/ })
    }

    const start = async () => {
        try {
            // whatever the env (like heroku)  wants
            const port = process.env.PORT || fastify.conf('NODE_PORT')
            console.log('The app is accessible on port: ' + port)
            await fastify.listen({ port, host: '0.0.0.0' })
            const mailer = await Mailer.getInstance(mongoURL, dbName)
            //  Run only on one node
            if (NODE_ENV === 0 /*process.env.worker_id == '1'*/) fastify.swagger()

            if (NODE_ENV === 1)
                mailer.sendMail({
                    to: process.env.ADMIN_EMAIL,
                    subject: 'App instance bootstrap',
                    text: 'App instance bootstrapped correctly',
                    html: 'App instance bootstrapped correctly',
                })
            gracefulServer.setReady()
        } catch (err) {
            console.log(err)
            fastify.log.error(err)
            process.exit(1)
        }
    }
    if (doRun) await start()

    /*********************************************************************************************** */
    // !!BOOTSTRAP ENVIRONMENT AND DATA!!

    // Run only on one node
    if (process.env.worker_id == '1') {
        fastify.log.info('Checking environment data once')
        assert(fastify.mongo.db, 'MongoDB connection error')
        assert(fastify.redis, 'Redis DB connection error')
        bootstrap
            .checkEnvironmentData(mongoURL)
            .then((reply) => {
                prepareData()
            })
            .catch((err) => {
                console.log('Refusing to start because of ' + err)
                fastify.log.error('Refusing to start because of ' + err)
                process.exit()
            })
    }
    const seconds = fastify.conf('PIPELINE_KEYWORDS_SECONDS') // a day
    // Use connect method to connect to the Server
    const prepareData = async () => {
        const db = fastify.mongo.db
        const redis = fastify.redis
        const redisAPI = new RedisAPI(redis, db)
        redisAPI.purgeKeys()
        redisAPI.cacheIds()
        const colListings = db.collection('listing')
        const colUsers = db.collection('users')
        // Create indexes
        //process.env.NODE_ENV in {localhost, api}
        // TODO: remove (testing prod now)
        if (NODE_ENV < 1) {
            await colListings.deleteMany({})
            await colUsers.deleteMany({})
            bootstrap
                .seedDevelopmentData(db)
                .then(async (reply) => {
                    await bootstrap.createIndexes(db)
                    bootstrap.famousSearches()
                    await bootstrap.fastifyInjects(fastify)
                    // not working on heroku for some reason
                    if (!fastify.conf('HEROKU')) bootstrap.registerPipelines(db, fastify.scheduler, seconds)
                    await cache(db, redis)
                })
                .catch((err) => {
                    console.log('Refusing to start because of ' + err)
                    fastify.log.error('Refusing to start because of ' + err)
                    process.exit()
                })
        } else {
            // TODO: deal with production indexes and map reduce functions
            await bootstrap.createIndexes(db)
            await bootstrap.fastifyInjects(fastify)
            bootstrap.registerPipelines(db, fastify.scheduler, seconds)
            await cache(db, redis)
        }

        // db.on('error', function (error) {
        //     fastify.log.error(error)
        //     // global.mongodb.disconnect()
        // })
    }

    return fastify
}

export default build
