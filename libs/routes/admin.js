import authAdapter from '../decorators/auth.js'
import queries from '../services/mongo.js'

let imgHolder = {
    donations: 'https://via.placeholder.com/512x350/bd5912/100d00.png?text=Donation',
    skills: 'https://via.placeholder.com/512x350/ec496f/0f0f3f.png?text=Skill',
    events: 'https://via.placeholder.com/512x350/934fe9/11113e.png?text=Event',
    hobbies: 'https://via.placeholder.com/512x350/b2bd12/0a090a.png?text=Hobby',
    blogs: 'https://via.placeholder.com/512x350/f5eabf/100d00.png?text=Blog',
}

// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify, options) {
    const { db } = fastify.mongo
    const { redis } = fastify

    const QInstance = new queries(db, redis)
    let { adminAuth } = authAdapter(fastify)
    // CLONE BASE DATA LIST
    let realtimeJSON = []

    fastify.get('/', { preHandler: adminAuth }, async function (req, reply) {
        const listings = await QInstance.getListingsForModeration(true)
        listings.documents.forEach((elem) => {
            if (!elem.img) elem.img = imgHolder[elem['section']]
            elem._id = elem._id.toHexString()
        })
        listings.documents.forEach((elem) => {
            realtimeJSON[elem._id] = elem
        })
        reply.send(listings.documents)
    })

    fastify.get('/dashboard', { preHandler: adminAuth }, async function (req, reply) {
        reply.view('/pages/admin', {})
    })

    // CREATE
    fastify.post('/', { preHandler: adminAuth }, async function (req, reply) {
        realtimeJSON.push(req.body)
        // Return list
        reply.send(realtimeJSON)
    })

    // UPDATE (Patch for single-cell edit)
    // Replace some or all of an existing movie's properties
    // Using `patch` instead of `put` to allow partial update
    fastify.patch('/:id', { preHandler: adminAuth }, async function (req, reply) {
        // Early Exit
        if (!Object.keys(req.body).length) {
            reply.send('The request object has no options or is not in the correct format (application/json).')
        }
        // Update the target object
        else {
            const match = getMatch(req)
            realtimeJSON[match] = Object.assign({}, realtimeJSON[match], req.body)
            if (realtimeJSON[match].img.includes('via.placeholder')) realtimeJSON[match].img = ''
            await QInstance.updateDocument(realtimeJSON[match], 'listing')
            reply.send(realtimeJSON)
        }
    })

    // PUT (For multi-cell edit)
    // Replaces record instead of merging (patch)
    fastify.put('/:id', { preHandler: adminAuth }, async function (req, reply) {
        const match = getMatch(req)
        realtimeJSON[match] = req.body
        await QInstance.updateDocument(realtimeJSON[match], 'listing')
        reply.send(realtimeJSON)
    })

    // DELETE
    fastify.delete('/:id', { preHandler: adminAuth }, async function (req, reply) {
        const match = getMatch(req)
        await QInstance.removeDocument(realtimeJSON[match]._id, 'listing')
        if (match !== -1) realtimeJSON.splice(match, 1)
        reply.send(realtimeJSON)
    })

    function getMatch(req) {
        return realtimeJSON.findIndex((a) => a._id === req.params.id)
    }

    // Add an announcement
    fastify.post('/announce', { preHandler: adminAuth }, async function (req, reply) {
        const { body } = req
        // const { title_en, title_ar, title_fr, english, arabic, french } = body
        const res = await QInstance.insertAnnouncement(body)
        reply.send(`announcement added ${JSON.stringify(res)}`)
    })
}

export default routes
