import multer from 'fastify-multer'
import { tidy } from 'htmltidy2'
import DOMPurify from 'isomorphic-dompurify'
import { NLPEscape } from 'nlp-escape'
import { promisify } from 'util'
// import config from '../../configuration.js'
import constraints from '../constraints/constraints.js'
import { html } from '../constraints/regex.js'
import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/blabla.js'
import postListingHandler from '../decorators/postListingHandler.js'
import inputsValueMapping from '../decorators/valuesMapping.js'
import { crypto, ops as helpers, ops } from '../services/helpers.js'
import queries from '../services/mongo.js'
import { stringTransformer } from '../services/pipeLine.js'

// TODO: rethink validation errors: 'request.validationError'
const NODE_ENV = {
    api: -1,
    localhost: 0,
    production: 1,
}[process.env.NODE_ENV]

const tidyP = promisify(tidy)
const opt = { 'show-body-only': 'yes' }
const tags = html.allowedTags.map((tag) => `<${tag}>`).concat(html.allowedTags.map((tag) => `</${tag}>`))
const escaper = new NLPEscape(tags)
const key = crypto.passwordDerivedKey(process.env.PASSWORD)
const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null])
const onlyLatin = /[\b\t-'`~!@#$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi
// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify, options, next) {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis)
    let { auth, adminAuth, softAuth } = authAdapter(fastify)

    fastify.decorateReply('blabla', blabla)

    fastify.get('/', { preHandler: softAuth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsSince(20, '', req.pagination))
        const { page, perPage } = req.pagination
        const data = {
            section: '',
            context: 'alllistings',
            listings: listings.documents,
            addressPoints: [],
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'listings', 'listings'], req)
        return reply
    })

    const getSectionHandler = async (req, reply) => {
        const section = req.url.split('/')[2].split('?')[0]
        const [err, listings] = await to(QInstance.getListingsSince(100, section, req.pagination))
        if (err) {
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const { page, perPage } = req.pagination
        const data = {
            section: section,
            context: 'listings',
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
            addressPoints: [],
        }
        data.addressPoints = listings.documents.map((a) => {
            return [a.lat, a.lng, a.title, a._id, a.section]
        })
        reply.blabla([data, 'listings', section], req)
        return reply
    }
    fastify.get('/donations', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/events', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/skills', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/blogs', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/hobbies', { preHandler: softAuth }, getSectionHandler)

    /* GET one listing; must not be deactivated. */
    fastify.get('/id/:id/', { preHandler: softAuth }, async function (req, reply) {
        const viewer = req.params.username
        const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        const [err, elem] = mongoHex.test(req.params.id)
            ? await to(QInstance.getListingById(req.params.id, false, viewer))
            : ['NOT_FOUND', undefined]
        if (err === 'NOT_FOUND' || !elem) {
            reply.blabla([{}, 'message', 'NOT_FOUND'], req)
            return reply
        }
        if (err) {
            req.log.error(`get/id#getListingById: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        let data = {}
        // const author = elem.usr
        elem.email = crypto.encrypt(key, elem.usr)
        elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'

        // const channel = crypto.encrypt(key, `${author},${viewer},${req.params.id}`)
        // const readableChannel = `${author},${elem.title}`
        // Todo: if author == viewer then the author could have multiple channels on one thread
        data = { data: elem, section: elem.section, /*author , channel, readableChannel*/ }
        reply.blabla([data, 'listing', 'id'], req)
        return reply
    })

    /**
     * GET one new channel at least or all channels for the current logged viewer.
     * If the viewer is author, then gets all channels for the current thread (other viewers)
     * If not, then get the unique channel between the viewer and the author for the current thread
     */
    // TODO: cache later on Redis
    // const allChannels = [
    //     {
    //         au: 'super_author',
    //         vi: 'logged_in_viewer',
    //         th: 'LISTING0435232',
    //     },
    // ]
    // fastify.get('/id/:id/channels', { preHandler: auth }, async function (req, reply) {
    //     let channels = []
    //     let readableChannels = []
    //     const viewer = req.params.username
    //     const thread = req.params.id
    //     const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
    //     // replace getListingById by a quicker QInstance.listingExists()
    //     const [err, elem] = mongoHex.test(thread)
    //         ? await to(QInstance.getListingById(thread, false, viewer))
    //         : ['NOT_FOUND', undefined]
    //     if (err === 'NOT_FOUND' || !elem) return reply.send({ err: 'NOT_FOUND' })
    //     if (err) {
    //         req.log.error(`get/id#getListingById: ${err.message}`)
    //         return reply.send({ err: 'SERVER_ERROR' })
    //     }
    //     const author = elem.usr
    //     const newChannel = { au: author, vi: viewer, th: thread }

    //     // update allChannels with new channel if needed (new logged viewers landing on a thread)
    //     if (!allChannels.find((ch) => ch.au == author && ch.vi == viewer && ch.th == thread)) {
    //         allChannels.push(newChannel)
    //     }
    //     console.log('all channels')
    //     console.log(allChannels)
    //     // get channels convenient to this thread and viewer
    //     if (author === viewer) {
    //         // get channels of all visitors (viewer) for the author
    //         channels = allChannels.filter((ch) => ch.au == author && ch.th == thread)
    //     } else {
    //         // find the one channel for the current viewer
    //         channels = [allChannels.find((ch) => ch.au == author && ch.vi == viewer && ch.th == thread)]
    //     }
    //     console.log('result channels')
    //     console.log(channels)
    //     readableChannels = channels.map((ch) => `${ch.au},${ch.vi},${elem.title.slice(0, 20)}`)
    //     // encrypt channels names
    //     channels = channels.map((ch) => crypto.encrypt(key, `${ch.au},${ch.vi},${ch.th}`))
    //     return reply.send({ channels, readableChannels })
    // })

    const gwooglSchema = constraints[process.env.NODE_ENV].POST.queryGwoogl.schema
    /* Query listings not including deactivated */
    fastify.post(
        '/gwoogl',
        { schema: gwooglSchema, attachValidation: true, preHandler: softAuth, preValidation: inputsValueMapping },
        async (req, reply) => {
            let data = { context: 'gwoogl', addressPoints: [], listings: [], crossLangListings: [] }
            if (req.validationError && req.validationError.validation) {
                reply.blabla([data, 'listings', 'gwoogl'], req)
                return reply
            }
            const { body } = req
            const lang = await helpers.getLanguage(body.title_desc)
            let [err, listings] = await to(
                QInstance.gwoogl(body.title_desc, body.exact, body.div_q, body.section, lang),
            )
            if (err) {
                req.log.error(`gwoogl#gwoogl: ${err.message}`)
                reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                return reply
            }
            Object.assign(data, {
                section: body.section,
                listings: listings.documents,
                crossLangListings: listings.crossLangDocs,
            })
            reply.blabla([data, 'listings', 'gwoogl'], req)
            return reply
        },
    )
    const geolocationSchema = constraints[process.env.NODE_ENV].POST.queryGeolocation.schema
    /* Query listings withing a geo-point and radius */
    fastify.post(
        '/geolocation',
        { schema: geolocationSchema, attachValidation: true, preHandler: softAuth },
        async (req, reply) => {
            let data = { context: 'geolocation', addressPoints: [], listings: [] }
            if (req.validationError && req.validationError.validation) {
                reply.blabla([data, 'listings', 'geolocation'], req)
                return reply
            }
            const { body } = req
            let [err, listings] = await to(QInstance.getListingsByGeolocation(body.lat, body.lng, body.section))
            if (err) {
                req.log.error(`geolocation#getListingsByGeolocation: ${err.message}`)
                reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                return reply
            }
            Object.assign(data, { section: body.section, listings: listings.documents })
            reply.blabla([data, 'listings', 'geolocation'], req)
            return reply
        },
    )

    const handler = postListingHandler(fastify)
    fastify.register(multer.contentParser)
    const upload = NODE_ENV < 1 ? helpers.localMulter : helpers.cloudMulter
    fastify.post('/donations', { preHandler: [auth, upload] }, handler)
    fastify.post('/skills', { preHandler: [auth] }, handler)
    fastify.post('/blogs', { preHandler: auth }, handler)
    fastify.post('/events', { preHandler: auth }, handler)
    fastify.post('/hobbies', { preHandler: [auth, upload] }, handler)

    const messageSchema = constraints[process.env.NODE_ENV].POST.message.schema
    /* Query listings withing a geo-point and radius */
    fastify.post(
        '/sendmessage',
        { schema: messageSchema, preHandler: auth, attachValidation: true },
        async (req, reply) => {
            const { body } = req
            const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
            let receiver = crypto.decrypt(key, body.email)
            const [err, elem] = mongoHex.test(body.id)
                ? await to(QInstance.getListingById(body.id, false, receiver))
                : ['NOT_FOUND', undefined]
            if (err) {
                req.log.error(`post/sendmessage#getListingById: ${err.message}`)
                reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                return reply
            }
            if (!elem) {
                reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                return reply
            }
            if (req.validationError && req.validationError.validation) {
                reply.blabla([{ data: elem }, 'listing', 'contact'], req)
                return reply
            }
            try {
                body.message = await tidyP(body.message, opt)
                body.message = new stringTransformer(body.message).sanitizeHTML().valueOf()
                const clean = escaper.escape(body.message)
                const transformed = new stringTransformer(clean).decancer().badWords().cleanSensitive().valueOf()
                body.message = escaper.unescape(transformed)
                body.message = DOMPurify.sanitize(body.message)
            } catch (error) {
                req.log.error(
                    `post/sendmessage#tidyP|nlp-escape|dompurify|decancer:: ${body.message.slice(0, 100)} | ${error.message} `,
                )
                reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                return reply
            }
            const message = {
                to: receiver,
                from: req.params.username,
                sent: new Date(),
                threadId: body.id,
                thread: ops.toTitle(elem.title, 30),
                message: body.message,
            }
            const [errr, acknowledged] = await to(QInstance.insertComment(message))
            if (errr) {
                req.log.error(`post/sendmessage#getListingById: ${errr.message}`)
                reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                return reply
            }
            let data = {}
            elem.email = crypto.encrypt(key, elem.usr)
            elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'
            data = { data: elem, section: elem.section }
            reply.blabla([data, 'listing', 'contact'], req)
            return reply
        },
    )

    fastify.get('/user', { preHandler: auth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsByUser(req.params.username))
        if (err) {
            req.log.error(`user#getListingsByUser: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const user = { nickname: req.params.username }
        return reply.view('/pages/listings', {
            user: user,
            title: 'Your listings',
            intro: 'Classified advertising brought to the web',
            listings: listings,
            context: 'alllistings',
            success: 'Yep, we got some :)',
        })
    })

    fastify.get('/user/notifications', { preHandler: auth }, async function (req, reply) {
        const [err, notifications] = await to(QInstance.getNotificationsByUser(req.params.username))
        if (err) {
            req.log.error(`user#getNotificationsByUser: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const user = { nickname: req.params.username }
        // Thread which are like titles will be used as CSS selectors. So reformat to be a valid CSS selector.
        const threads = [
            ...new Set(
                notifications.map((notif) => {
                    return `${notif.thread.replace(/ /g, '-')}`
                }),
            ),
        ]
        return reply.view('/pages/notifications', {
            user: user,
            title: 'Notifications',
            intro: 'Classified advertising brought to the web',
            threads: threads,
            notifications: notifications,
            context: 'messages',
            success: 'Yep, we got some :)',
        })
    })

    fastify.get('/user/toggle/:id', { preHandler: auth }, async function (req, reply) {
        const [err, res] = await to(QInstance.toggleValue(req.params.id, 'd', 'listing'))
        if (err) {
            req.log.error(`user/toggle#toggleValue: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const [err2, listings] = await to(QInstance.getListingsByUser(req.params.username))
        if (err2) {
            req.log.error(`user/toggle#getListingsByUser: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const user = { nickname: req.params.username }
        return reply.view('/pages/listings', {
            user: user,
            title: 'Your listings',
            intro: 'Classified advertising brought to the web',
            listings: listings,
            context: 'alllistings',
            success: 'Yep, we got some :)',
            toFocus: req.params.id,
        })
    })
}

export default routes
