console.log(`Running on Node environment ?: ${process.env.NODE_ENV}`)
// Require app configurations
import fastifyAuth from "@fastify/auth";
import compressPlugin from "@fastify/compress";
import fastifyCookies from "@fastify/cookie";
import fastifyFlash from "@fastify/flash";
import formbody from "@fastify/formbody";
import helmet from "@fastify/helmet";
import fastifyJWT from "@fastify/jwt";
import mongodb from "@fastify/mongodb";
import rateLimit from "@fastify/rate-limit";
import redis from "@fastify/redis";
import fastifySession from "@fastify/session";
import serve from "@fastify/static";
// TODO: looks heavy on memory
// const metricsPlugin = require('fastify-metrics')
import fastifySwagger from "@fastify/swagger";
import fastifyWebsocket from "@fastify/websocket";
import dns from "dns";
import { config } from "dotenv";
// Rendering systems and internationalization
import ejs from "ejs";
import fastify_ from "fastify";
// Require dependencies
// Fastify plugins
import { fastifySchedulePlugin } from "fastify-schedule";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nextMiddleware from "i18next-http-middleware";
import crypto from "node:crypto";
import path from "path";
import viewsPlugin from "point-of-view";
import { ops as bootstrap } from "./bootstrap/bootstrap.js";
import helmet_ from "./config/options/helmet.js";
import logger_ from "./config/options/logger.js";
// Require plugins configurations
// const miner = require('./libs/decorators/miner').miner
import swagger_ from "./config/options/swagger.js";
import { softVerifyJWT, verifyJWT, wsauth } from "./libs/decorators/jwt.js";
import adminRouter from "./libs/routes/admin.js";
import authRouter from "./libs/routes/auth.js";
import chatRouter from "./libs/routes/chat.js";
import dataRouter from "./libs/routes/data.js";
import debugRouter from "./libs/routes/debug.js";
import indexRouter from "./libs/routes/index.js";
import listingsRouter from "./libs/routes/listings.js";
import Mailer from "./libs/services/mailer.js";
import { cache } from "./libs/services/mongo-mem.js";
import RedisAPI from "./libs/services/redis.js";


config();
process.title = 'classified-ads'
// Incremental is better
const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2
}[process.env.NODE_ENV]





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
        logger: logger_,
        disableRequestLogging: false,
        keepAliveTimeout: 10000,
        requestTimeout: 5000,
    })
    fastify.decorate('conf', (tag) => config.get(tag))
    fastify.register(formbody)
    fastify.register(fastifyWebsocket)

    //  !!Run only on one node!!
    if (NODE_ENV === 0 /*&& process.env.worker_id == '1'*/) {
        fastify.register(fastifySwagger, swagger_.options)
        console.log(`Please check localhost:${process.env.PORT || fastify.conf('NODE_PORT')}/documentation it's a nice start`)
        // fastify.register(setSwaggerStats)
        // setTimeout(() => {
        //     console.log(swStats.getCoreStats())
        // }, 10000)
    }

    fastify.register(helmet, helmet_)
    // fastify.register(cors, require('./config/options/cors'))
    fastify.register(compressPlugin) // Compress all possible types > 1024o
    fastify.register(mongodb, { forceClose: true, url: config.get('DATABASE') || process.env.MONGODB_URI })
    fastify.register(redis, { host: '127.0.0.1' })

    await fastify.register(fastifyJWT, { secret: process.env.JWT_SECRET })
    await fastify.register(fastifyAuth)
    // TODO: fastify.after(routes)
    fastify.register(fastifyCookies)
    fastify.register(fastifySession, {
        cookieName: 'session',
        secret: crypto.randomBytes(16).toString('hex'),
        cookie: {
            secure: false,
            maxAge:  2592000000
        }
    })
    fastify.register(fastifyFlash)
    
    // Set authentication as soon as possible
    // after necessary plugins have been loaded
    fastify.decorate('verifyJWT', verifyJWT)
    fastify.decorate('softVerifyJWT', softVerifyJWT)
    fastify.decorate('wsauth', wsauth)

    // Same db instance all over the all over the app.
    // never close !
    // const { db } = fastify.mongo

    const mongoURL = fastify.conf('DATABASE') || process.env.MONGODB_URI
    const dbName =
                process.env.NODE_ENV === 'development'
                    ? 'listings_db_dev'
                    : 'listings_db'
    // Run the server as soon as possible!
    const start = async () => {
        try {
            // whatever the env (like heroku)  wants
            const port = process.env.PORT || fastify.conf('NODE_PORT')
            await fastify.listen(port, '0.0.0.0')
            //  Run only on one node
            if (NODE_ENV === 0/*process.env.worker_id == '1'*/) {
                fastify.swagger()
            }
            Mailer.getInstance(mongoURL, dbName).then((mailer) => {
                mailer.sendMail({
                    to: process.env.ADMIN_EMAIL,
                    subject:'app instance bootstrap',
                    text:'app instance bootstrapped correctly',
                    html:'app instance bootstrapped correctly'
                })
            }).catch((err) => {
                fastify.log.error(err)
            })
        } catch (err) {
            fastify.log.error(err)
            process.exit(1)
        }
    }
    if(doRun) start()

    /*********************************************************************************************** */
    // Seeming heavy so use/register these after starting the app
    // !!TRANSLATIONS !!
    i18next.use(Backend).use(i18nextMiddleware.LanguageDetector).init({
        backend: {
            loadPath: __dirname + '/data/locales/{{lng}}/common.json'
        },
        fallbackLng: process.env.DEFAULT_LANG,
        preload: ['en-US', 'ar', 'fr'],
        cookiename: 'locale',
        detection: {
            order: ['cookie'],
            lookupCookie: 'locale',
            caches: ['cookie']
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
        ignoreRoutes: ['/data/', '/admin/']
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
            ejs: ejs,
            defaultContext: {
                dev: process.env.NODE_ENV === 'development',
            },
        }
    })
    /*********************************************************************************************** */
    // !!PREHANDERS AND HOOKS !!
    fastify.addHook('preHandler', (req, reply, done) => {
        const perPage = 12
        const page = req.query.p || 1
        req.pagination = { perPage: perPage, page: page }
        done()
    })

    // Mine topK events
    // fastify.addHook('preHandler', miner)

    /*********************************************************************************************** */
    // !!SPAM ASSASSIN !!
    if (NODE_ENV > 1) {
        fastify.register(rateLimit, config.get('PING_LIMITER'))
    }
    
    // against 404 endoint ddos
    // fastify.setNotFoundHandler({
    //     preHandler: fastify.rateLimit()
    // }, function (request, reply) {
    //     reply.code(404).send({ hello: 'world' })
    // })
    // fastify.register(require('under-pressure'), {
    //     maxEventLoopDelay: 3000,
    //     maxHeapUsedBytes: 100000000,
    //     maxRssBytes: 100000000,
    //     maxEventLoopUtilization:0.98
    // })
      
    // TODO: Rate limiter && honeyPot except in process.env === "api"
    fastify.addHook('preHandler', (req, reply, done) => {
        // TODO: req.socket ? does it work ?
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        if (ip.substr(0, 7) === '::ffff:') {
            ip = ip.substr(7)
        }
        if (NODE_ENV <= 1 || ip.split('.')[0] === '127') {
            done()
            return
        }
        const reversedIp = ip.split('.').reverse().join('.')
        dns.resolve4([process.env.HONEYPOT_KEY, reversedIp, 'dnsbl.httpbl.org'].join('.'),
            function (err, addresses) {
                if (!addresses) {
                    done()
                    return
                } else {
                    const _response = addresses.toString().split('.').map(Number)
                    // https://www.projecthoneypot.org/threat_info.php
                    const test = (_response[0] === 127 && _response[2] > 50)
                    if (test) {
                        reply.send({ msg: 'we hate spam to begin with!' })
                    }
                    done()
                    return
                }
            })
    })
    
    const localize = {
        en: require('ajv-i18n/localize/en'),
        'en-US': require('ajv-i18n/localize/en'),
        ar: require('ajv-i18n/localize/ar'),
        fr: require('ajv-i18n/localize/fr'),
    }
    fastify.setErrorHandler(function (error, request, reply) {
        if (error.validation) {
            localize[request.cookies.locale || 'en'](error.validation)
            reply.status(422).send(error.validation)
            return
        }
        reply.send(error)
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
    fastify.register(chatRouter, { prefix: 'chat' })
    fastify.register(serve, { root: path.join(__dirname, 'public') })
    fastify.register(serve, { root: path.join(__dirname, 'uploads'), prefix: '/cdn/', decorateReply: false })
    /*********************************************************************************************** */
    // !!BOOTSTRAP ENVIRONMENT AND DATA!!

    // Run only on one node
    if (process.env.worker_id == '1') {
        fastify.log.info('Checking environment data once')
        fastify.register(fastifySchedulePlugin)
        bootstrap.checkEnvironmentData(mongoURL)
            .then(reply => {
                prepareData()
            })
            .catch((err) => {
                fastify.log.error('Refusing to start because of ' + err)
                process.exit()
            })
    }
    const seconds = fastify.conf('PIPELINE_KEYWORDS_SECONDS') // a day
    // Use connect method to connect to the Server
    const prepareData = async () => {
        const { db } = fastify.mongo
        const redis = fastify.redis
        const redisAPI = new RedisAPI(redis, db)
        redisAPI.purgeKeys()
        redisAPI.cacheIds()
        const colListings = db.collection('listing')
        const colUsers = db.collection('users')
        // Create indexes
        //process.env.NODE_ENV in {development, localhost, api}
        if (NODE_ENV <= 1) {
            await colListings.deleteMany({})
            await colUsers.deleteMany({})
            bootstrap.seedDevelopmenetData(db).then(async (reply) => {
                await bootstrap.createIndexes(db)
                bootstrap.famousSearches()
                // await bootstrap.fastifyInjects(fastify)
                // not working on heroku for some reason
                if (!fastify.conf('HEROKU'))
                    bootstrap.registerPipelines(db, fastify.scheduler, seconds)
                await cache(db, redis)
            }).catch((err) => {
                fastify.log.error('Refusing to start because of ' + err)
                process.exit()
            })
        } else {
            // TODO: deal with production indexes and map reduce functions
            await bootstrap.createIndexes(db)
            bootstrap.registerPipelines(db, fastify.scheduler, seconds)
            await cache(db, redis)
        }

        // db.on('error', function (error) {
        //     fastify.log.error(error)
        //     // global.mongodb.disconnect()
        // })
    }

    /*********************************************************************************************** */
    // !!APP AND USER METRICS!!
    // Don't track for api env (API testing)
    const secretPath = process.env.SECRET_PATH
    const adminAuth = fastify.auth([fastify.verifyJWT('admin'),])
    if (NODE_ENV > -1 && process.env.worker_id == '1') {
        // TODO: modify https://github.com/bacloud22/visitor-counter/ to 
        // accept fastify.mongo instance instead
        // const myMongoDatabase = fastify.mongo.client.db('dbname')
        // TODO: this has of async operations
        /*
        import visitors from "./libs/decorators/visitors-handler";
        fastify.addHook('preHandler', async (req, reply) => {
            let stats = await visitors.getStats()
            stats.record(req, reply)
        })
        fastify.get(`/${secretPath}/visitors`, { preHandler: adminAuth }, visitors.handler)
        */
        // Metrics exporter at least for one node to have a view on performance
        // fastify.register(metricsPlugin, { endpoint: '/metrics', blacklist: ['/metrics'], enableRouteMetrics: true })
    }

    return fastify
}

export default build
