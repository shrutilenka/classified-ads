// Require dependencies (fastify plugins and others)
require('dotenv').config()
const config = require('config')
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]
const pino = require('pino')

// require ('newrelic')
const dns = require('dns')
const { fastifySchedulePlugin } = require('fastify-schedule')
const fastify_ = require('fastify')
const helmet = require('fastify-helmet')
const compressPlugin = require('fastify-compress')
const errorPlugin = require('fastify-error-page')
const ejs = require('ejs')
const viewsPlugin = require('point-of-view')
const path = require('path')
const serve = require('fastify-static')
const mongodb = require('fastify-mongodb')
const formbody = require('fastify-formbody')
const rateLimit = require('fastify-rate-limit')

const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const i18nextMiddleware = require('i18next-http-middleware')
const metricsPlugin = require('fastify-metrics');
const swStats = require('swagger-stats')
// downloadFile('http://localhost:3000/documentation/json', 'swagger.json')
const apiSpec = require('./swagger.json')
async function setSwaggerStats(fastify, opts) {
    await fastify.register(require('fastify-express'))
    fastify.register(swStats.getFastifyPlugin, {
        name: 'swagger-stats-authtest',
        version: '0.94.0',
        hostname: "hostname",
        ip: "127.0.0.1:3000",
        timelineBucketDuration: 60000,
        swaggerSpec: apiSpec,
        uriPath: '/swagger-stats',
        durationBuckets: [50, 100, 200, 500, 1000, 5000],
        requestSizeBuckets: [500, 5000, 15000, 50000],
        responseSizeBuckets: [600, 6000, 6000, 60000],
        // Make sure both 50 and 50*4 are buckets in durationBuckets, 
        // so Apdex could be calculated in Prometheus 
        apdexThreshold: 50,
        authentication: true,
        elasticsearch: 'http://127.0.0.1:9200',
        onAuthenticate: function (req, username, password) {
            // simple check for username and password
            return ((username === 'swagger-stats')
                && (password === 'swagger-stats'));
        }

    });
}

async function instantiateApp() {
    const logger = config.get('HEROKU') ? true : pino('./logs/all.log')
    const fastify = fastify_({
        logger: logger,
        disableRequestLogging: true,
        keepAliveTimeout: 10000,
        requestTimeout: 5000,
    })
    fastify.decorate('conf', (tag) => config.get(tag))
    fastify.register(formbody)

    // For easy debugging in Localhost when needed, reply.send stack.
    // Otherwise not useful and not secure,
    // send plain JSON error with only error.message
    if (fastify.conf('ERROR_STACK')) {
        fastify.register(errorPlugin)
    }

    //  Run only on one node
    if (NODE_ENV < 1 /*&& process.env.worker_id == '1'*/) {
        const swagger = require('./config/options/swagger')
        fastify.register(require('fastify-swagger'), swagger.options)
        console.log(`Please check localhost:${process.env.PORT || fastify.conf('NODE_PORT')}/documentation it's a nice start`)
        // fastify.register(setSwaggerStats)
        // setTimeout(() => {
        //     console.log(swStats.getCoreStats())
        // }, 10000);
    }
    const authRouter = require('./libs/routes/auth.js')
    const indexRouter = require('./libs/routes/index.js')
    const adminRouter = require('./libs/routes/admin.js')
    const listingsRouter = require('./libs/routes/listings.js')
    const dataRouter = require('./libs/routes/data.js')
    const debugRouter = require('./libs/routes/debug.js')
    const gameRouter = require('./libs/routes/game.js')

    // const ffPlugin = require('fastify-feature-flags')
    // const ConfigProvider = require('fastify-feature-flags/dist/providers/config')
    // fastify.register(ffPlugin, { providers: [new ConfigProvider.ConfigProvider({ prefix: 'features' })] })

    fastify.register(helmet, require('./config/options/helmet'))
    // fastify.register(cors, require('./config/options/cors'))
    fastify.register(compressPlugin) // Compress all possible types > 1024o
    fastify.register(mongodb, { forceClose: true, url: config.get('DATABASE') || process.env.MONGODB_URI })

    await fastify.register(require('fastify-jwt'), { secret: process.env.JWT_SECRET })
    await fastify.register(require('fastify-auth')) // just 'fastify-auth' IRL
    // TODO: fastify.after(routes)
    fastify.register(require('fastify-cookie'))
    const { verifyJWT, softVerifyJWT } = require('./libs/decorators/jwt')
    fastify.decorate('verifyJWT', verifyJWT)
    fastify.decorate('softVerifyJWT', softVerifyJWT)

    fastify.route({
        method: 'GET',
        url: '/home',
        handler: (request, reply) => {
            reply.send(`Logged In as ${request.params.username}`)
        },
    })

    // Run the server as soon as possible!
    const start = async () => {
        try {
            // whatever the env (like heroku)  wants
            const port = process.env.PORT || fastify.conf('NODE_PORT')
            await fastify.listen(port, '0.0.0.0')
            //  Run only on one node
            if (NODE_ENV == 0/*process.env.worker_id == '1'*/) {
                fastify.swagger()
            }
        } catch (err) {
            fastify.log.error(err)
            process.exit(1)
        }
    }
    start()

    // Seeming heavy and not so important bootstrap stuff 
    i18next.use(Backend).use(i18nextMiddleware.LanguageDetector).init({
        backend: {
            loadPath: __dirname + '/data/locales/{{lng}}/translation.json'
        },
        fallbackLng: 'en',
        preload: ['en', 'ar', 'fr'],
        cookiename: 'locale',
        detection: {
            order: ['cookie'],
            lookupCookie: 'locale',
            caches: ['cookie']
        }
    })

    fastify.register(i18nextMiddleware.plugin, {
        i18next,
        ignoreRoutes: ['/data/', '/admin/']
    })

    fastify.get('/__ping_trans', async (req, reply) => {
        return { translationWorks: req.t('greetings.title') }
    })

    fastify.get('/i18n/:locale', (req, reply) => {
        reply.cookie('locale', req.params.locale, { path: '/' })
        if (req.headers.referer) reply.redirect(req.headers.referer)
        else reply.redirect('/')
    })

    // TODO: find a way to strip very long ejs logging errors
    fastify.register(viewsPlugin, {
        engine: {
            ejs: ejs,
            defaultContext: {
                dev: process.env.NODE_ENV === 'development',
            },
        }
    })

    // Update our property
    fastify.addHook('preHandler', (req, reply, done) => {
        const perPage = 9
        const page = req.query.p || 1
        req.pagination = { perPage: perPage, page: page }
        done()
    })

    fastify.register(rateLimit, config.get('PING_LIMITER'))

    // fastify.setNotFoundHandler({
    //     preHandler: fastify.rateLimit()
    // }, function (request, reply) {
    //     reply.code(404).send({ hello: 'world' })
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

    fastify.register(authRouter)
    fastify.register(indexRouter)
    fastify.register(adminRouter)
    fastify.register(listingsRouter, { prefix: 'listings' })
    fastify.register(dataRouter, { prefix: 'data' })
    if (NODE_ENV < 1) {
        fastify.register(debugRouter, { prefix: 'debug' })
    }
    fastify.register(gameRouter, { prefix: 'game' })

    fastify.register(serve, { root: path.join(__dirname, 'public') })

    const { ops: bootstrap } = require('./bootstrap.js')

    //  Run only on one node
    // no on heroku 
    if (fastify.conf('HEROKU') || process.env.worker_id == '1') {
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
    // TODO: use conf instead 
    const seconds = fastify.conf('PIPELINE_KEYWORDS_SECONDS') // a day
    // Use connect method to connect to the Server
    const prepareData = async () => {
        const { db } = fastify.mongo
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
    }
    // Don't track for monkey chaos env (API testing)
    // TODO: secure all /admin routes ? 
    const secretPath = process.env.SECRET_PATH
    const adminAuth = fastify.auth([fastify.verifyJWT('admin'),])
    if (NODE_ENV > -1) {
        // TODO: modify https://github.com/bacloud22/visitor-counter/ to 
        // accept fastify.mongo instance instead
        // const myMongoDatabase = fastify.mongo.client.db('dbname')
        // const visitors = require('./libs/decorators/visitors-handler')
        // fastify.addHook('preHandler', async (req, reply) => {
        //     let stats = await visitors.getStats()
        //     stats.record(req, reply)
        // })
        // fastify.get(`/${secretPath}/visitors`, { preHandler: adminAuth }, visitors.handler)

        fastify.register(metricsPlugin, { endpoint: '/metrics' });
    }
}
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
