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

var i18next = require('i18next')
var middleware = require('i18next-http-middleware')


async function instantiateApp() {
    const logger = pino('./logs/all.log')
    const fastify = fastify_({
        logger: logger,
        disableRequestLogging: false
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

    fastify.register(helmet, require("./config/options/helmet"))
    // fastify.register(cors, require("./config/options/cors"))
    fastify.register(compressPlugin) // Compress all possible types > 1024o
    fastify.register(mongodb, { forceClose: true, url: config.get('DATABASE') })

    fastify.register(require('fastify-jwt'), { secret: process.env.JWT_SECRET })
    fastify.register(require('fastify-auth')) // just 'fastify-auth' IRL
    // TODO: fastify.after(routes)
    fastify.register(require('fastify-cookie'))
    const { verifyJWT, softVerifyJWT } = require('./libs/decorators/jwt')
    fastify.decorate("verifyJWT", verifyJWT)
    fastify.decorate("softVerifyJWT", softVerifyJWT)

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
            await fastify.listen(fastify.conf('NODE_PORT'))
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
    i18next.use(middleware.LanguageDetector).init({
        backend: {
            loadPath: __dirname + '/data/locales/{{lng}}/{{ns}}.json'
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

    fastify.register(middleware.plugin, {
        i18next,
        ignoreRoutes: ['/data/', '/admin/']
    })

    // Endpoints
    fastify.get('/__ping_trans', async (req, reply) => {
        return { translationWorks: req.t('greeting') }
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


    // TODO: Rate limiter && honeyPot except in process.env === 'monkey chaos'
    fastify.addHook('preHandler', (req, reply, done) => {
        // TODO: req.socket ? does it work ?
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        if (ip.substr(0, 7) === '::ffff:') {
            ip = ip.substr(7)
        }
        if (NODE_ENV < 1 || ip.split('.')[0] === '127') {
            done()
        }
        const reversedIp = ip.split('.').reverse().join('.')
        dns.resolve4([process.env.HONEYPOT_KEY, reversedIp, 'dnsbl.httpbl.org'].join('.'),
            function (err, addresses) {
                if (!addresses) {
                    return
                } else {
                    const _response = addresses.toString().split('.').map(Number)
                    // https://www.projecthoneypot.org/threat_info.php
                    const test = (_response[0] === 127 && _response[2] > 50)
                    if (test) {
                        reply.send({ msg: 'we hate spam to begin with!' })
                    }
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
    if (process.env.worker_id == '1') {
        fastify.log.info('Checking environment data once')
        fastify.register(fastifySchedulePlugin)
        bootstrap.checkEnvironmentData(fastify.conf('DATABASE'))
            .then(reply => prepareData())
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
        const collection = db.collection('listing')
        // Create indexes
        //process.env.NODE_ENV in {localhost, monkey chaos}
        if (NODE_ENV < 1) {
            bootstrap.famousSearches()
            await collection.deleteMany({})
            bootstrap.seedDevelopmenetData(db).then(async (reply) => {
                await bootstrap.createIndexes(db)
                await bootstrap.fastifyInjects(fastify)
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
    if (NODE_ENV > -1) {
        const visitors = require('./libs/decorators/visitors-handler')
        fastify.addHook('preHandler', async (req, reply) => {
            let stats = await visitors.getStats()
            stats.record(req, reply)
        })
        fastify.get(`/${secretPath}/visitors`, visitors.handler)
    }
}
const os = require("os")
const cluster = require("cluster")
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
