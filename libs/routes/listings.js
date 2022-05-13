const helpers = require('../services/helpers').ops
const crypto = require('../services/helpers').crypto
const key = crypto.passwordDerivedKey(process.env.PASSWORD)
const config = require('config')
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]
const to = (promise) => promise.then(data => [null, data]).catch(err => [err, null])
// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify, options, next) {
    const { constraints } = require('../constraints/constraints')
    const blabla = require('../decorators/blabla')
    const queries = require('../services/mongo')

    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis)
    let auth, adminAuth, softAuth
    if (fastify.auth) {
        auth = fastify.auth([fastify.verifyJWT('regular'),])
        adminAuth = fastify.auth([fastify.verifyJWT('admin'),])
        softAuth = fastify.auth([fastify.softVerifyJWT,])
    } else if (NODE_ENV < 1) {
        auth = softAuth = (fastify, opts, done) => { done() }
    } else {
        auth = softAuth = (fastify, opts, done) => { done(new Error('An error happened')) }
    }

    fastify.decorateReply('blabla', blabla)

    fastify.get('/', { preHandler: softAuth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsSince(
            20, '', req.pagination))
        const { page, perPage } = req.pagination
        const data = {
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
        const [err, listings] = await to(QInstance.getListingsSince(
            100, section, req.pagination))
        if (err) return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        const { page, perPage } = req.pagination
        const data = {
            section: section,
            context: 'listings',
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
            addressPoints: []
        }
        data.addressPoints = listings.documents.map((a) => {
            return [a.lat, a.lng, a.title, a._id]
        })
        reply.blabla([data, 'listings', section], req)
        return reply
    }
    fastify.get('/donations', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/events', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/skills', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/blogs', { preHandler: softAuth }, getSectionHandler)
    
    /* GET one listing; must not be deactivated. */
    fastify.get('/id/:id/', { preHandler: softAuth }, async function (req, reply) {
        const viewer = req.params.username
        const hex = /[0-9A-Fa-f]{6}/g
        const [err, elem] = (hex.test(req.params.id))
            ? await to(QInstance.getListingById(req.params.id, false, viewer))
            : ['NOT_FOUND', undefined]
        if (err === 'NOT_FOUND' || !elem) return reply.blabla([{}, 'message', 'NOT_FOUND'], req)
        if (err) {
            req.log.error(`get/id#getListingById: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        let data = {}
        const author = elem.usr;
        elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'

        const channel = crypto.encrypt(key, `${author},${viewer},${req.params.id}`)
        data = { data: elem, section: elem.section, author, channel }
        reply.blabla([data, 'listing', 'id'], req)
        return reply
    })

    /* GET one listing; must not be deactivated. */
    const COOKIE_NAME = config.get('COOKIE_NAME')
    fastify.get('/id/:id/comments', { preHandler: softAuth }, async function (req, reply) {
        const hex = /[0-9A-Fa-f]{6}/g
        const [err, elem] = (hex.test(req.params.id))
            ? await to(QInstance.getListingById(req.params.id, false, req.params.username))
            : ['NOT_FOUND', undefined]
        if (err === 'NOT_FOUND') return reply.send({ boom: ':(' })
        if (err) {
            req.log.error(`get/id/comments#getListingById: ${err.message}`)
            return reply.send({ boom: ':(' })
        }
        if (elem) {
            const peer2 = elem.usr;
            elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'
            const user = {}
            user['nickname'] = req.params.username ? req.params.username : req.cookies[COOKIE_NAME] ? '🏠' : ''
            let comments = []
            if (req.params.username) {
                const peer1 = req.params.username
                // console.log(`=====fetching comments=====\npeer1 ${peer1} & peer2 ${peer2} & thread ${req.params.id}\n`)
                comments = await QInstance.getComments(peer1, peer2, req.params.id)
                comments.forEach(comment => {
                    comment.from = helpers.initials(comment.from)
                    comment.to = helpers.initials(comment.to)
                });
            }
            reply.send({ comments: comments, user: user, author: peer2 })
            return reply
        }
        req.log.error(`get/comments#getComments: either no listing ${req.params.id} or an error`)
        reply.send({boom: ':('})
        return reply
    })


    const gwooglSchema = constraints[process.env.NODE_ENV].POST.queryGwoogl.schema
    /* Query listings not including deactivated */
    fastify.post(
        '/gwoogl', { schema: gwooglSchema, preHandler: softAuth, preValidation: require('../decorators/preValidation') },
        async (req, reply) => {
            const { body } = req
            const lang = await helpers.getLanguage(body.title_desc)
            let [err, listings] = await to(QInstance.gwoogl(body.title_desc,
                body.exact, body.div_q, body.section, lang))
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
        }
    );
    const geolocationSchema = constraints[process.env.NODE_ENV].POST.queryGeolocation.schema
    /* Query listings withing a geopoint and radius */
    fastify.post(
        '/geolocation', { schema: geolocationSchema, preHandler: softAuth, preValidation: require('../decorators/preValidation') },
        async (req, reply) => {
            const { body } = req
            let [err, listings] = await to(QInstance.getListingsByGeolocation(
                body.lat, body.lng, body.section))
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
        }
    );

    const multer = require('fastify-multer')
    const postSectionHandler = require('../decorators/postSectionHandler')(fastify)
    // TODO: only register this when upload is attached
    fastify.register(multer.contentParser)
    const upload = NODE_ENV < 1 ? helpers.localMulter : helpers.cloudMulter
    fastify.post('/donations', { preHandler: [auth, upload] }, postSectionHandler)
    fastify.post('/skills', { preHandler: [auth, upload] }, postSectionHandler)
    fastify.post('/blogs', { preHandler: auth }, postSectionHandler)
    fastify.post('/events', { preHandler: auth }, postSectionHandler)

    const commentSchema = constraints[process.env.NODE_ENV].POST.comment
    /* Contact poster one listing. */
    fastify.post('/id/:id/comment', { schema: commentSchema, preHandler: auth }, async function (req, reply) {
        const hex = /[0-9A-Fa-f]{6}/g
        const [err, elem] = (hex.test(req.params.id))
            ? await to(QInstance.getListingById(req.params.id, false, req.params.username))
            : ['NOT_FOUND', undefined]
        if (err) {
            req.log.error(`post/comment#getListingById: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        if (!elem) {
            reply.send({boom: ':('})
            // reply.blabla([{}, 'message', 'not found'], req)
            return reply
        }
        const from = req.params.username
        let to = elem.usr
        const { body } = req
        // from: the sender, which is the one logged in
        // to: two scenarion:
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
            message: body.message
        }
        QInstance.insertComment(msg).then((acknowledged) => {
            reply.send({boom: ':)'})
            return reply
        }).catch((err) => {
            req.log.error(`post/comment#insertComment: ${err.message}`)
        })
        // reply.blabla([{ data: elem }, 'listing', 'contact'], req)
        // return reply
    })

    fastify.get('/user', { preHandler: auth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsByUser(req.params.username))
        if (err) {
            req.log.error(`user#getListingsByUser: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const user = { nickname: req.params.username }
        reply.view('/templates/pages/listings', {
            user: user,
            title: 'Your listings',
            intro: 'Classified advertising brought to the web',
            listings: listings,
            success: 'Yep, we got some :)'
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
        reply.view('/templates/pages/listings', {
            user: user,
            title: 'Your listings',
            intro: 'Classified advertising brought to the web',
            listings: listings,
            success: 'Yep, we got some :)',
            toFocus: req.params.id
        })
    })
}

module.exports = routes
