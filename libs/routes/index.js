import axios from 'axios'
import showdown from 'showdown'
import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/blabla.js'
import { EphemeralData } from '../services/helpers.js'
import queries from '../services/mongo.js'

const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null])

// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify, options) {
    const { db } = fastify.mongo
    /** @type { import('ioredis').Redis } redis */
    const redis = fastify.redis
    const QInstance = new queries(db, redis)
    let { softAuth } = authAdapter(fastify)

    // Using reply.blabla instead of regular `reply.view`
    fastify.decorateReply('blabla', blabla)

    fastify.get('/update/:id/', async function (req, reply) {
        await redis.hset(`up-ids`, req.params.id, 3)
        return reply
    })

    /* GET home page. */
    fastify.get('/', { preHandler: softAuth }, async function (req, reply) {
        // let announcement
        const [err, listings] = await to(QInstance.getListingsSince(20, '', req.pagination))
        if (err) {
            req.log.error(`index#getListingsSince: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
            addressPoints: [],
            // announcement: announcement
        }
        data.addressPoints = listings.documents.map((a) => {
            return [a.lat, a.lng, a.title, a._id, a.section]
        })
        reply.blabla([data, 'index', 'listings'], req)
        return reply
    })

    fastify.get('/tags', { preHandler: softAuth }, function (req, reply) {
        reply.blabla([{}, 'tags', 'tags'], req)
        return reply
    })

    // TODO: three repetitive methods but fine,
    // maybe they evolve differently in future
    fastify.get('/tag/:tag', { preHandler: softAuth }, async function (req, reply) {
        const tag = req.params.tag
        const [err, listings] = await to(QInstance.getListingsByTag(tag, 'origin', req.pagination))
        if (err) {
            req.log.error(`index/tag#getListingsByTag: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: tag,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'tags'], req)
        return reply
    })

    fastify.get('/tag/parent/:tag', { preHandler: softAuth }, async function (req, reply) {
        const tag = req.params.tag
        const [err, listings] = await to(QInstance.getListingsByTag(tag, 'parent', req.pagination))
        if (err) {
            req.log.error(`index/tag/parent#getListingsByTag: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: tag,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'tags'], req)
        return reply
    })

    fastify.get('/tag/granpa/:tag', { preHandler: softAuth }, async function (req, reply) {
        const tag = req.params.tag
        const [err, listings] = await to(QInstance.getListingsByTag(tag, 'granpa', req.pagination))
        if (err) {
            req.log.error(`index/tag/granpa#getListingsByTag: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: tag,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'tags'], req)
        return reply
    })

    fastify.get('/division/:division', { preHandler: softAuth }, async function (req, reply) {
        const division = req.params.division
        const [err, listings] = await to(QInstance.getListingsByDivision(division, req.pagination))
        if (err) {
            req.log.error(`index/division#getListingsByDivision: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: division,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'division'], req)
        return reply
    })

    fastify.get('/keyword/:keyword', { preHandler: softAuth }, async function (req, reply) {
        const keyword = req.params.keyword.trim()
        const [err, listings] = await to(QInstance.getListingsByKeyword(keyword, req.pagination))
        if (err) {
            req.log.error(`index/keyword#getListingsByKeyword: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: keyword,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'keyword'], req)
        return reply
    })

    /* TODO: throttle this and limit requests to > 3 chars */
    fastify.get('/autocomplete/:keyword', async function (req, reply) {
        const keyword = req.params.keyword.trim()
        const [err, keywords] = await to(QInstance.autocomplete(keyword))
        if (err) {
            req.log.error(`index/autocomplete#autocomplete: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        return keywords
    })

    /* GET Top listings by tag. */
    fastify.get('/top/tags', async function (req, reply) {
        const [err, topTags] = await to(QInstance.topTags())
        if (err) {
            req.log.error(`index/top#topTags: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        return topTags
    })

    fastify.get('/top/div', async function (req, reply) {
        // const section = req.params.section
        const [err, topTags] = await to(QInstance.topByDivision())
        if (err) {
            req.log.error(`index/top/div#topByDivision: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        return topTags
    })

    // TODO: not being called in UI yet,
    fastify.get('/top/parent/tags', async function (req, reply) {
        // const section = req.params.section
        const [err, topTags] = await to(QInstance.topByParentTag())
        if (err) {
            req.log.error(`index/top/parent#topByParentTag: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        return topTags
    })

    fastify.get('/top/granpa/tags', async function (req, reply) {
        // const section = req.params.section
        const [err, topTags] = await to(QInstance.topByGranpaTag)
        if (err) {
            req.log.error(`index/top/granpa#topByGranpaTag: ${err.message}`)
            return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
        }
        return topTags
    })

    /* GET Top listings by tag. */
    fastify.get('/explore/tags', { preHandler: softAuth }, async function (req, reply) {
        reply.view('/templates/pages/tags', {
            title: 'Explore all tags!',
        })
    })

    // Blog pages are pages with little server processing
    fastify.get('/categories', { preHandler: softAuth }, function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'Categories',
            sections: [
                { id: 'Donations', html: req.t('doc.donations') },
                { id: 'Skills', html: req.t('doc.skills') },
                { id: 'Blogs', html: req.t('doc.blogs') },
            ],
        })
    })

    fastify.get('/about', { preHandler: softAuth }, function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'What is Classified-ads',
            sections: [
                { id: 'About', html: req.t('doc.about') },
                { id: 'User agreement', html: req.t('doc.agreement') },
            ],
        })
    })

    fastify.get('/how-to', { preHandler: softAuth }, function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'How to post on Listings',
            sections: [
                { id: 'User agreement', html: req.t('doc.agreement') },
                { id: 'Login', html: req.t('doc.login') },
                { id: 'Validation', html: req.t('doc.validation') },
            ],
        })
    })

    fastify.get('/policy', { preHandler: softAuth }, function (req, reply) {
        reply.view('/templates/pages/blog', {
            title: 'Terms of usage',
            sections: [
                { id: 'sec1', html: 'bob' },
                { id: 'sec2', html: 'lorem upsom lorem upsom lorem upsom lorem  ' },
                { id: 'sec3', html: 'lorem upsom lorem upsom lorem upsom lorem  '.toUpperCase() },
            ],
        })
    })

    // Some easter-eggs
    // fastify.get('/fennec-fox', function (req, reply) {
    //     const idx = Math.floor(Math.random() * 4) + 1
    //     reply.view('/templates/pages/easter-egg', {
    //         svg: give.SVGs[idx - 1],
    //         style: `easter-egg-${idx}.css`,
    //     })
    // })

    let converter = new showdown.Converter()
    let dailyAnnouncements = new EphemeralData(86400000)
    let github =
        'https://raw.githubusercontent.com/bacloud22/Classified-ads-xx-data/main/data/announcements/fr/announcements.md'
    fastify.get('/announcements', function (req, reply) {
        let listings = []
        if (dailyAnnouncements.isSame()) {
            listings = dailyAnnouncements.data
            return reply.view('/templates/pages/blog', {
                title: 'Announcements',
                intro: req.t('blog.intro'),
                sections: listings,
            })
        }
        dailyAnnouncements.reset()
        axios
            .get(github)
            .then(function (response) {
                // handle success
                let announcements = response.data.split('<hr>').reverse()
                announcements.forEach((announcement) => {
                    let title = announcement.match(/#.+/g).filter((title) => title.indexOf('##') < 0)[0]
                    title = title.replace(/#/g, '')
                    announcement = converter.makeHtml(announcement)
                    listings.push({ id: title, html: announcement })
                })
                dailyAnnouncements.data = listings
                return reply.view('/templates/pages/blog', {
                    title: 'Announcements',
                    intro: req.t('blog.intro'),
                    sections: listings,
                })
            })
            .catch(function (error) {
                // handle error
                console.log(error)
            })
            .then(function () {
                // always executed
            })
    })
}

export default routes
