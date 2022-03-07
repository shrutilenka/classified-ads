const helpers = require('../services/helpers').ops
require('dotenv').config()
const config = require('config')
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]
// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify, options, next) {
    const { constraints } = require('../constraints/constraints')
    const blabla = require('../decorators/blabla')
    const queries = require('../services/mongo')
    const { db } = fastify.mongo
    const logger = fastify.log
    const QInstance = new queries(db, logger)
    let auth, softAuth
    if (fastify.auth) {
        auth = fastify.auth([fastify.verifyJWT,])
        softAuth = fastify.auth([fastify.softVerifyJWT])
    } else if (NODE_ENV < 1) {
        auth = softAuth = (fastify, opts, done) => { done() }
    } else {
        auth = softAuth = (fastify, opts, done) => { done(new Error('An error happened')) }
    }

    // TODO: replace `reply.view` with reply.blabla([data, route, kind])
    fastify.decorateReply('blabla', blabla)

    fastify.get('/', { preHandler: softAuth }, async function (req, reply) {
        const listings = await QInstance.getDocumentsSince(
            20, '', req.pagination)
        const { page, perPage } = req.pagination
        const data = {
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
        const listings = await QInstance.getDocumentsSince(
            100, section, req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            section: section,
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
    fastify.get('/skills', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/blogs', { preHandler: softAuth }, getSectionHandler)


    /* GET one listing; must not be deactivated. */
    fastify.get('/id/:id/', { preHandler: softAuth }, async function (req, reply) {
        const hex = /[0-9A-Fa-f]{6}/g
        const elem = (hex.test(req.params.id))
            ? await QInstance.getDocumentById(req.params.id, false)
            : undefined
        let data = {}
        if (elem) {
            const peer2 = elem.usr;

            elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'
            data = { data: elem, section: elem.section, author: peer2 }
            reply.blabla([data, 'listing', 'id'], req)
            return reply
        }
        reply.blabla([data, 'message', 'not found'], req)
        return reply
    })

    /* GET one listing; must not be deactivated. */
    const COOKIE_NAME = config.get('COOKIE_NAME')
    fastify.get('/id/:id/comments', { preHandler: softAuth }, async function (req, reply) {
        const hex = /[0-9A-Fa-f]{6}/g
        const elem = (hex.test(req.params.id))
            ? await QInstance.getDocumentById(req.params.id, false)
            : undefined
        if (elem) {
            const peer2 = elem.usr;
            elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'
            const user = {}
            user['nickname'] = req.params.username ? req.params.username : req.cookies[COOKIE_NAME] ? '🏠' : ''
            let comments = []
            if (req.params.username) {
                const peer1 = req.params.username
                comments = await QInstance.getComments(peer1, peer2, req.params.id)
                comments.forEach(comment => {
                    comment.from = helpers.initials(comment.from)
                    comment.to = helpers.initials(comment.to)
                });
            }
            reply.send({ comments: comments, user: user, auther: peer2 })
            return reply
        }
        reply.code(500).send("A very event happened!");
        return reply
    })


    const gwooglSchema = constraints[process.env.NODE_ENV].POST.queryGwoogl.schema
    /* Query listings not including deactivated */
    fastify.post(
        '/gwoogl', { schema: gwooglSchema, preHandler: softAuth, preValidation: require('../decorators/preValidation') },
        async (req, reply) => {
            const { body } = req
            let listings = await QInstance.gwoogl(body.title_desc,
                body.exact, body.div_q, body.section, req.pagination)
            const { page, perPage } = req.pagination
            const data = {
                section: body.section,
                addressPoints: [],
                listings: listings.documents,
                current: page,
                pages: Math.ceil(listings.count / perPage),
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
            let listings = await QInstance.getDocumentsByGeolocation(
                body.lat, body.lng, body.section, req.pagination)
            const { page, perPage } = req.pagination
            const data = {
                section: body.section,
                addressPoints: [],
                listings: listings.documents,
                current: page,
                pages: Math.ceil(listings.count / perPage),
            }
            reply.blabla([data, 'listings', 'geolocation'], req)
            return reply
        }
    );

    const multer = require('fastify-multer')
    const postSectionHandler = require('../decorators/postSectionHandler')(fastify)
    fastify.register(multer.contentParser)
    const upload = NODE_ENV < 1 ? helpers.localMulter : helpers.cloudMulter
    fastify.post('/donations', { preHandler: [auth, upload] }, postSectionHandler)
    fastify.post('/skills', { preHandler: [auth, upload] }, postSectionHandler)
    fastify.post('/blogs', { preHandler: auth }, postSectionHandler)

    const adminPass = process.env.SECRET_PATH

    /* Admin Checks one listing; */
    fastify.get(`/admin/check/${adminPass}/:id`, async function (req, reply) {
        const hex = /[0-9A-Fa-f]{6}/g
        const elem = (hex.test(req.params.id))
            ? await QInstance.getDocumentById(req.params.id, true)
            : undefined
        if (elem) {
            elem.usr = elem.usr ? helpers.initials(elem.usr) : 'YY'
            return reply.view('/templates/listing', {
                title: 'Check',
                data: elem,
                success: 'Admin check :)',
                section: elem.section
            })
        }
        // elem is empty or password is not correct
        reply.view('/templates/pages/message', {
            title: 'Check',
            message: 'No listing found :(',
            error: 'No listing found :('
        })
    })

    const commentSchema = constraints[process.env.NODE_ENV].POST.comment
    /* Contact poster one listing. */
    fastify.post('/id/:id/comment', { schema: commentSchema, preHandler: auth }, async function (req, reply) {
        const hex = /[0-9A-Fa-f]{6}/g
        const elem = (hex.test(req.params.id))
            ? await QInstance.getDocumentById(req.params.id, false)
            : undefined
        if (!elem) {
            reply.blabla([{}, 'listing', 'not found'], req)
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
        const acknowledged = await QInstance.insertMessage(msg)
        reply.blabla([{ data: elem }, 'listing', 'contact'], req)
        return reply
    })

    fastify.get('/user', { preHandler: auth }, async function (req, reply) {
        const listings = await QInstance.getDocumentsByUser(req.params.username)
        const user = { nickname: req.params.username }
        reply.view('/templates/pages/listings', {
            user: user,
            title: 'Your listings',
            intro: 'Classified advertising brought to the web',
            listings: listings,
            success: 'Yep, we got some :)'
        })
    })
}

module.exports = routes
