import multer from 'fastify-multer'
// import config from '../../configuration.js'
import constraints from '../constraints/constraints.js'
import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/blabla.js'
import postListingHandler from '../decorators/postListingHandler.js'
import inputsValueMapping from '../decorators/valuesMapping.js'
import { crypto, ops as helpers } from '../services/helpers.js'
import queries from '../services/mongo.js'

const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]

const key = crypto.passwordDerivedKey(process.env.PASSWORD)
const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null])
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
        if (err) return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
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
        const hex = /[0-9A-Fa-f]{6}/g
        const [err, elem] = hex.test(req.params.id)
            ? await to(QInstance.getListingById(req.params.id, false, viewer))
            : ['NOT_FOUND', undefined]
        if (err === 'NOT_FOUND' || !elem) return reply.blabla([{}, 'message', 'NOT_FOUND'], req)
        if (err) {
            req.log.error(`get/id#getListingById: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        let data = {}
        const author = (elem.email = elem.usr)
        elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'

        const channel = crypto.encrypt(key, `${author},${viewer},${req.params.id}`)
        const readableChannel = `${author},${elem.title}`
        // Todo: if author == viewer then the author could have multiple channels on one thread
        data = { data: elem, section: elem.section, author, channel, readableChannel }
        reply.blabla([data, 'listing', 'id'], req)
        return reply
    })

    /**
     * GET one new channel at least or all channels for the current logged viewer.
     * If the viewer is author, then gets all channels for the current thread (other viewers)
     * If not, then get the unique channel between the viewer and the author for the current thread
     */
    // TODO: cache later on Redis
    const allChannels = [
        {
            au: 'super_author',
            vi: 'logged_in_viewer',
            th: 'LISTING0435232',
        },
    ]
    fastify.get('/id/:id/channels', { preHandler: auth }, async function (req, reply) {
        let channels = []
        let readableChannels = []
        const viewer = req.params.username
        const thread = req.params.id
        const hex = /[0-9A-Fa-f]{6}/g
        // replace getListingById by a quicker QInstance.listingExists()
        const [err, elem] = hex.test(thread)
            ? await to(QInstance.getListingById(thread, false, viewer))
            : ['NOT_FOUND', undefined]
        if (err === 'NOT_FOUND' || !elem) return reply.send({ err: 'NOT_FOUND' })
        if (err) {
            req.log.error(`get/id#getListingById: ${err.message}`)
            return reply.send({ err: 'SERVER_ERROR' })
        }
        const author = elem.usr
        const newChannel = { au: author, vi: viewer, th: thread }

        // update allChannels with new channel if needed (new logged viewers landing on a thread)
        if (!allChannels.find((ch) => ch.au == author && ch.vi == viewer && ch.th == thread)) {
            allChannels.push(newChannel)
        }
        console.log('all channels')
        console.log(allChannels)
        // get channels convenient to this thread and viewer
        if (author === viewer) {
            // get channels of all visitors (viewer) for the author
            channels = allChannels.filter((ch) => ch.au == author && ch.th == thread)
        } else {
            // find the one channel for the current viewer
            channels = [allChannels.find((ch) => ch.au == author && ch.vi == viewer && ch.th == thread)]
        }
        console.log('result channels')
        console.log(channels)
        readableChannels = channels.map((ch) => `${ch.au},${ch.vi},${elem.title.slice(0, 20)}`)
        // encrypt channels names
        channels = channels.map((ch) => crypto.encrypt(key, `${ch.au},${ch.vi},${ch.th}`))
        return reply.send({ channels, readableChannels })
    })

    /* GET one listing; must not be deactivated. */
    // const COOKIE_NAME = config('COOKIE_NAME')
    // fastify.get('/id/:id/comments', { preHandler: softAuth }, async function (req, reply) {
    //     const hex = /[0-9A-Fa-f]{6}/g
    //     const [err, elem] = hex.test(req.params.id)
    //         ? await to(QInstance.getListingById(req.params.id, false, req.params.username))
    //         : ['NOT_FOUND', undefined]
    //     if (err === 'NOT_FOUND' || !elem) return reply.send({ boom: ':(' })
    //     if (err) {
    //         req.log.error(`get/id/comments#getListingById: ${err.message}`)
    //         return reply.send({ boom: ':(' })
    //     }
    //     if (elem) {
    //         const peer2 = elem.usr
    //         elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'
    //         const user = {}
    //         user['nickname'] = req.params.username ? req.params.username : req.cookies[COOKIE_NAME] ? '🏠' : ''
    //         let comments = []
    //         if (req.params.username) {
    //             const peer1 = req.params.username
    //             // console.log(`=====fetching comments=====\npeer1 ${peer1} & peer2 ${peer2} & thread ${req.params.id}\n`)
    //             comments = await QInstance.getComments(peer1, peer2, req.params.id)
    //             comments.forEach((comment) => {
    //                 comment.from = helpers.initials(comment.from)
    //                 comment.to = helpers.initials(comment.to)
    //             })
    //         }
    //         reply.send({ comments: comments, user: user, author: peer2 })
    //         return reply
    //     }
    //     req.log.error(`get/comments#getComments: either no listing ${req.params.id} or an error`)
    //     reply.send({ boom: ':(' })
    //     return reply
    // })

    const gwooglSchema = constraints[process.env.NODE_ENV].POST.queryGwoogl.schema
    /* Query listings not including deactivated */
    fastify.post(
        '/gwoogl',
        { schema: gwooglSchema, preHandler: softAuth, preValidation: inputsValueMapping },
        async (req, reply) => {
            const { body } = req
            const lang = await helpers.getLanguage(body.title_desc)
            let [err, listings] = await to(
                QInstance.gwoogl(body.title_desc, body.exact, body.div_q, body.section, lang),
            )
            if (err) {
                req.log.error(`gwoogl#gwoogl: ${err.message}`)
                return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            }
            const data = {
                section: body.section,
                context: 'gwoogl',
                addressPoints: [],
                listings: listings.documents,
                crossLangListings: listings.crossLangDocs,
            }
            reply.blabla([data, 'listings', 'gwoogl'], req)
            return reply
        },
    )
    const geolocationSchema = constraints[process.env.NODE_ENV].POST.queryGeolocation.schema
    /* Query listings withing a geo-point and radius */
    fastify.post(
        '/geolocation',
        {
            schema: geolocationSchema,
            preHandler: softAuth,
        },
        async (req, reply) => {
            const { body } = req
            let [err, listings] = await to(QInstance.getListingsByGeolocation(body.lat, body.lng, body.section))
            if (err) {
                req.log.error(`geolocation#getListingsByGeolocation: ${err.message}`)
                return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            }
            const data = {
                section: body.section,
                context: 'geolocation',
                addressPoints: [],
                listings: listings.documents,
            }
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

    // const geolocationSchema = constraints[process.env.NODE_ENV].POST.queryGeolocation.schema
    /* Query listings withing a geo-point and radius */
    fastify.post(
        '/sendmessage',
        {
            // schema: geolocationSchema,
            preHandler: auth,
        },
        async (req, reply) => {
            const { body } = req
            console.log(body)
            const hex = /[0-9A-Fa-f]{6}/g
            const [err, elem] = hex.test(body.id)
                ? await to(QInstance.getListingById(body.id, false, body.email))
                : ['NOT_FOUND', undefined]
            if (err) {
                req.log.error(`post/sendmessage#getListingById: ${err.message}`)
                return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            }
            if (!elem) {
                reply.send({ boom: ':(' })
                // reply.blabla([{}, 'message', 'not found'], req)
                return reply
            }
            const message = {
                to: body.email,
                from: req.params.username,
                sent: new Date(),
                thread: body.id,
                message: body.content,
            }
            
            QInstance.insertComment(message)
                .then((acknowledged) => {
                    reply.send({ boom: ':)' })
                    return reply
                })
                .catch((err) => {
                    req.log.error(`post/comment#sendmessage: ${err.message}`)
                })
            reply.blabla([{ data: elem }, 'listing', 'contact'], req)
            return reply
        },
    )

    /*
    const commentSchema = constraints[process.env.NODE_ENV].POST.comment
    //  Contact poster one listing.
    fastify.post('/id/:id/comment', { schema: commentSchema, preHandler: auth }, async function (req, reply) {
        const hex = /[0-9A-Fa-f]{6}/g
        const [err, elem] = hex.test(req.params.id)
            ? await to(QInstance.getListingById(req.params.id, false, req.params.username))
            : ['NOT_FOUND', undefined]
        if (err) {
            req.log.error(`post/comment#getListingById: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        if (!elem) {
            reply.send({ boom: ':(' })
            // reply.blabla([{}, 'message', 'not found'], req)
            return reply
        }
        const from = req.params.username
        let to = elem.usr
        const { body } = req
        // from: the sender, which is the one logged in
        // to: two scenarios:
        // Sender is a visitor to the thread, then "to" is simply the "author" of the listing
        // Sender is the "author" of the thread, then "comment id" must be present, to derive 'from' from it.
        // author is the one logged in and now responding to a comment
        if (to === from && body.commentId) {
            const commentId = body.commentId
            const [commentFrom, commentTo] = await QInstance.getCommentById(commentId)
            to = commentFrom
        }
        const msg = {
            from: from,
            to: to,
            sent: new Date(),
            thread: req.params.id,
            message: body.message,
        }
        QInstance.insertComment(msg)
            .then((acknowledged) => {
                reply.send({ boom: ':)' })
                return reply
            })
            .catch((err) => {
                req.log.error(`post/comment#insertComment: ${err.message}`)
            })
        // reply.blabla([{ data: elem }, 'listing', 'contact'], req)
        // return reply
    })
    */
    fastify.get('/user', { preHandler: auth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsByUser(req.params.username))
        if (err) {
            req.log.error(`user#getListingsByUser: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const user = { nickname: req.params.username }
        return reply.view('/templates/pages/listings', {
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
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const user = { nickname: req.params.username }
        return reply.view('/templates/pages/notifications', {
            user: user,
            title: 'Notifications',
            intro: 'Classified advertising brought to the web',
            notifications: notifications,
            context: 'messages',
            success: 'Yep, we got some :)',
        })
    })

    fastify.get('/user/toggle/:id', { preHandler: auth }, async function (req, reply) {
        const [err, res] = await to(QInstance.toggleValue(req.params.id, 'd', 'listing'))
        if (err) {
            req.log.error(`user/toggle#toggleValue: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const [err2, listings] = await to(QInstance.getListingsByUser(req.params.username))
        if (err2) {
            req.log.error(`user/toggle#getListingsByUser: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const user = { nickname: req.params.username }
        return reply.view('/templates/pages/listings', {
            user: user,
            title: 'Your listings',
            intro: 'Classified advertising brought to the web',
            listings: listings,
            success: 'Yep, we got some :)',
            toFocus: req.params.id,
        })
    })
}

export default routes
