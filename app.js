// Require app configurations
require('dotenv').config()
process.title = 'classified-ads'
const config = require('config')
// Incremental is better
const NODE_ENV = {
    'monkey chaos': -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]

const dns = require('dns')
const path = require('path')
// Require dependencies
// Fastify plugins

const { fastifySchedulePlugin } = require('fastify-schedule')
const fastify_ = require('fastify')
const helmet = require('fastify-helmet')
const compressPlugin = require('@fastify/compress')
const errorPlugin = require('fastify-error-page')
const serve = require('@fastify/static')
const mongodb = require('@fastify/mongodb')
const redis = require('@fastify/redis')
const formbody = require('@fastify/formbody')
const rateLimit = require('fastify-rate-limit')
// TODO: looks heavy on memory
// const metricsPlugin = require('fastify-metrics')
const fastifySwagger = require('fastify-swagger')

// Rendering systems and internationalization
const ejs = require('ejs')
const viewsPlugin = require('point-of-view')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const i18nextMiddleware = require('i18next-http-middleware')

// Require plugins configurations
// TODO: this has of async operations
// const miner = require('./libs/decorators/miner').miner
const swagger_ = require('./config/options/swagger')
const logger_ = require('./config/options/logger')()
const helmet_ = require('./config/options/helmet')()

const crypto = require('node:crypto')
const fastifyJWT = require('fastify-jwt')
const fastifyAuth = require('@fastify/auth')
const fastifyCookies = require('@fastify/cookie')
const fastifySession = require('@fastify/session')
const fastifyFlash = require('@fastify/flash')
const { verifyJWT, softVerifyJWT } = require('./libs/decorators/jwt')
// In case we add ElasticSearch we can benefit 'swagger-stats'
// downloadFile('http://localhost:3000/documentation/json', 'swagger.json')
// const apiSpec = require('./swagger.json')
// async function setSwaggerStats(fastify, opts) {
//     await fastify.register(require('fastify-express'))
//     fastify.register(swStats.getFastifyPlugin, { })
// }

/**
 * Initialize the fastify app. It could be called many time
 * for NodeJS cluster case
 */
async function instantiateApp() {
    const fastify = fastify_({
        logger: logger_,
        disableRequestLogging: false,
        keepAliveTimeout: 10000,
        requestTimeout: 5000,
    })
    fastify.decorate('conf', (tag) => config.get(tag))
    fastify.register(formbody)

    // For easy debugging (in Localhost) set ERROR_STACK= true
    // Otherwise not useful and not secure,
    if (config.get('ERROR_STACK')) {
        fastify.register(errorPlugin)
    }

    //  !!Run only on one node!!
    if (NODE_ENV === 0 /*&& process.env.worker_id == '1'*/) {
        fastify.register(fastifySwagger, swagger_.options)
        console.log(`Please check localhost:${process.env.PORT || fastify.conf('NODE_PORT')}/documentation it's a nice start`)
        // fastify.register(setSwaggerStats)
        // setTimeout(() => {
        //     console.log(swStats.getCoreStats())
        // }, 10000)
    }

    // These routes must be required inside
    // instantiateApp (= called as many as nodes in cluster)
    // because I feel like it's safer 
    const authRouter = require('./libs/routes/auth.js')
    const indexRouter = require('./libs/routes/index.js')
    const adminRouter = require('./libs/routes/admin.js')
    const listingsRouter = require('./libs/routes/listings.js')
    const dataRouter = require('./libs/routes/data.js')
    const debugRouter = require('./libs/routes/debug.js')
    const gameRouter = require('./libs/routes/game.js')


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

    const Mailer = require('./libs/services/mailer')
    const { db } = fastify.mongo
    const mailer = Mailer.getInstance(db)


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
        } catch (err) {
            fastify.log.error(err)
            process.exit(1)
        }
    }
    start()

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
        // debug: true, // set debug: true for logging errors in internationalization
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
    // TODO: must be very safe, and fast
    // fastify.addHook('preHandler', miner)

    /*********************************************************************************************** */
    // !!SPAM ASSASSIN !!
    fastify.register(rateLimit, config.get('PING_LIMITER'))
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
      
    // TODO: Rate limiter && honeyPot except in process.env === 'monkey chaos'
    fastify.addHook('preHandler', (req, reply, done) => {
        // TODO: req.socket ? does it work ?
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        if (ip.substr(0, 7) === '::ffff:') {
            ip = ip.substr(7)
        }
        if (NODE_ENV < 1 || ip.split('.')[0] === '127') {
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
    fastify.register(gameRouter, { prefix: 'game' })
    fastify.register(serve, { root: path.join(__dirname, 'public') })
    fastify.register(serve, { root: path.join(__dirname, 'uploads'), prefix: '/cdn/', decorateReply: false })
    /*********************************************************************************************** */
    // !!BOOTSTRAP ENVIRONMENT AND DATA!!
    const { ops: bootstrap } = require('./bootstrap/bootstrap.js')
    const RedisAPI = require('./libs/services/redis')

    // Run only on one node
    if (process.env.worker_id == '1') {
        fastify.log.info('Checking environment data once')
        fastify.register(fastifySchedulePlugin)
        bootstrap.checkEnvironmentData(fastify.conf('DATABASE') || process.env.MONGODB_URI)
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
        const redisAPI = new RedisAPI(redis)
        redisAPI.purgeKeys()
        const colListings = db.collection('listing')
        const colUsers = db.collection('users')
        // Create indexes
        //process.env.NODE_ENV in {localhost, monkey chaos}
        if (NODE_ENV <= 1) {
            await colListings.deleteMany({})
            await colUsers.deleteMany({})
            bootstrap.seedDevelopmenetData(db).then(async (reply) => {
                await bootstrap.createIndexes(db)
                bootstrap.famousSearches()
                await bootstrap.fastifyInjects(fastify)
                // not working on heroku for some reason
                if (!fastify.conf('HEROKU'))
                    bootstrap.registerPipelines(db, fastify.scheduler, seconds)
            }).catch((err) => {
                fastify.log.error('Refusing to start because of ' + err)
                process.exit()
            })
        } else {
            // TODO: deal with production indexes and map reduce functions
            await bootstrap.createIndexes(db)
            bootstrap.registerPipelines(db, fastify.scheduler, seconds)
        }

        // db.on('error', function (error) {
        //     fastify.log.error(error)
        //     // global.mongodb.disconnect()
        // })


        setTimeout(() => {
            mailer.sendMail({
                to: process.env.ADMIN_EMAIL,
                subject:'app instance bootstrap',
                text:'app instance bootstrapped correctly',
                html:'app instance bootstrapped correctly'
            })
        }, 2000);

    }

    /*********************************************************************************************** */
    // !!APP AND USER METRICS!!
    // Don't track for monkey chaos env (API testing)
    const secretPath = process.env.SECRET_PATH
    const adminAuth = fastify.auth([fastify.verifyJWT('admin'),])
    if (NODE_ENV > -1 && process.env.worker_id == '1') {
        // TODO: modify https://github.com/bacloud22/visitor-counter/ to 
        // accept fastify.mongo instance instead
        // const myMongoDatabase = fastify.mongo.client.db('dbname')
        // TODO: this has of async operations
        /*
        const visitors = require('./libs/decorators/visitors-handler')
        fastify.addHook('preHandler', async (req, reply) => {
            let stats = await visitors.getStats()
            stats.record(req, reply)
        })
        fastify.get(`/${secretPath}/visitors`, { preHandler: adminAuth }, visitors.handler)
        */
        // Metrics exporter at least for one node to have a view on performance
        // fastify.register(metricsPlugin, { endpoint: '/metrics', blacklist: ['/metrics'], enableRouteMetrics: true })
    }

}
/*********************************************************************************************** */
// !!CLUSTER SETUP!!
if(process.env.NO_CLUSTER) {
    process.env.worker_id = '1'
    instantiateApp()
} else {
    const os = require('os')
    const cluster = require('cluster')
    const CPUS = NODE_ENV < 1 ? 2 : os.cpus().length - 1
    
    if (cluster.isMaster) {
        for (let i = 0; i < CPUS; i++) {
            cluster.fork({ worker_id: String(i) })
        }
        cluster.on('exit', (worker) => {
            console.log(`worker ${worker.process.pid} died`)
        })
    } else {
        instantiateApp()
    }    
}
