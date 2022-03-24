const { SVGs } = require('../services/data').give
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

// Encapsulates routes: (Init shared variables and so)
async function routes(fastify, options) {
    const blabla = require('../decorators/blabla')
    const queries = require('../services/mongo')
    const { db } = fastify.mongo
    const logger = fastify.log
    const QInstance = new queries(db, logger)
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
    
    // TODO: replace `reply.view` with reply.blabla([data, route, kind])
    fastify.decorateReply('blabla', blabla)

    /* GET home page. */
    fastify.get('/', async function (req, reply) {
        const listings = await QInstance.getDocumentsSince(
            20, '', req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            title: 'Classified-ads-48',
            context: 'index',
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage)
        }
        reply.blabla([data, 'index', 'listings'], req)
        return reply
    })

    // Example secured route
    fastify.route({
        method: 'GET',
        url: '/private',
        preHandler: auth,
        handler: (req, reply) => {
            req.log.info('Auth route')
            reply.send({ hello: 'whatssssss' })
        }
    })
    // Example secured route
    fastify.route({
        method: 'POST',
        url: '/upload',
        preHandler: auth,
        preValidation: require('../decorators/preValidation'),
        handler: (req, reply) => {
            req.log.info('Upload route')
            const { body } = req

            reply.send({ hello: body.exact })
        }
    })

    fastify.get('/tags', function (req, reply) {
        reply.blabla([{}, 'tags', 'tags'], req)
        return reply
    })

    // TODO: three repetitive methods but fine, 
    // maybe they evolve differently in future 
    fastify.get('/tag/:tag', async function (req, reply) {
        const tag = req.params.tag
        const listings = await QInstance.getDocumentsByTag(
            tag, 'origin', req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            title: tag,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage)
        }
        reply.blabla([data, 'index', 'tags'], req)
        return reply
    })

    fastify.get('/tag/parent/:tag', async function (req, reply) {
        const tag = req.params.tag
        const listings = await QInstance.getDocumentsByTag(
            tag, 'parent', req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            title: tag,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage)
        }
        reply.blabla([data, 'index', 'tags'], req)
        return reply
    })

    fastify.get('/tag/granpa/:tag', async function (req, reply) {
        const tag = req.params.tag
        const listings = await QInstance.getDocumentsByTag(
            tag, 'granpa', req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            title: tag,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage)
        }
        reply.blabla([data, 'index', 'tags'], req)
        return reply
    })

    fastify.get('/division/:division', async function (req, reply) {
        const division = req.params.division
        const listings = await QInstance.getDocumentsByDivision(
            division, req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            title: division,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage)
        }
        reply.blabla([data, 'index', 'division'], req)
        return reply
    })

    fastify.get('/keyword/:keyword', async function (req, reply) {
        const keyword = req.params.keyword
        const listings = await QInstance.getDocumentsByKeyword(
            keyword, req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            title: keyword,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage)
        }
        reply.blabla([data, 'index', 'keyword'], req)
        return reply
    })

    /* TODO: throttle this and limit requests to > 3 chars */
    fastify.get('/autocomplete/:keyword', async function (req, reply) {
        const keyword = req.params.keyword
        const elems = await QInstance.autocomplete(keyword)
        if (elems) {
            return elems
        }
        reply.blabla([{}, 'listing', 'not found'], req)
        return reply
    })

    /* GET Top listings by tag. */
    fastify.get('/top/tags', async function (req, reply) {
        const topTags = await QInstance.topTags()
        return topTags
    })
    
    fastify.get('/top/div', async function (req, reply) {
        // const section = req.params.section
        const topTags = await QInstance.topBydivision()
        return topTags
    })

    // TODO: not being called in UI yet, 
    fastify.get('/top/parent/tags', async function (req, reply) {
        // const section = req.params.section
        const topTags = await QInstance.topByParentTag()
        return topTags
    })

    fastify.get('/top/granpa/tags', async function (req, reply) {
        // const section = req.params.section
        const topTags = await QInstance.topByParentTag()
        return topTags
    })

    /* GET Top listings by tag. */
    fastify.get('/explore/tags', async function (req, reply) {
        reply.view('/templates/pages/tags', {
            title: 'Explore all tags!',
        })
    })
    
    // Blog pages are pages with little server processing
    fastify.get('/categories', function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'Categories',
            sections: [
                { id: 'Donations', html: req.t('page_content.donations') },
                { id: 'Skills', html: req.t('page_content.skills') },
                { id: 'Blogs', html: req.t('page_content.blogs') }
            ]
        })
    })

    fastify.get('/about', function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'What is Classified-ads-48',
            sections: [
                { id: 'What is', html: req.t('page_content.about') },
                { id: 'Careful', html: req.t('page_content.careful') }
            ]
        })
    })

    fastify.get('/howto', function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'How to post on Listings',
            sections: [
                { id: 'Careful', html: req.t('page_content.careful') },
                { id: 'Login', html: req.t('page_content.login') },
                { id: 'Validation', html: req.t('page_content.validation') }
            ]
        })
    })

    fastify.get('/policy', function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'Terms of usage',
            sections: [
                { id: 'sec1', html: 'bob' },
                { id: 'sec2', html: 'lorem upsom lorem upsom lorem upsom lorem  ' },
                { id: 'sec3', html: 'lorem upsom lorem upsom lorem upsom lorem  '.toUpperCase() }
            ]
        })
    })

    // Some eastereggs
    fastify.get('/fennec-fox', function (req, reply) {
        const idx = Math.floor(Math.random() * 4) + 1
        reply.view('/templates/pages/easteregg', {
            svg: SVGs[idx - 1],
            style: `easteregg-${idx}.css`
        })
    })

}

module.exports = routes
