import authAdapter from '../decorators/auth.js'
import queries from '../services/mongo.js'
// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify, options) {
    const { db } = fastify.mongo
    const { redis } = fastify

    const QInstance = new queries(db, redis)
    let { adminAuth } = authAdapter(fastify)
    // CLONE BASE DATA LIST
    let realtimeJSON

    fastify.get('/', { preHandler: adminAuth }, async function (req, reply) {
        const listings = await QInstance.getListingsForModeration(true)
        realtimeJSON = listings.documents
        // realtimeJSON.forEach((a, idx) => a.id = idx+1)
        reply.send(realtimeJSON)
    })

    fastify.get('/dashboard', { preHandler: adminAuth }, async function (req, reply) {
        reply.view('/templates/pages/admin', {})
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
            await QInstance.updateDocument(realtimeJSON[match], 'listings')
            reply.send(realtimeJSON)
        }
    })

    // PUT (For multi-cell edit)
    // Replaces record instead of merging (patch)
    fastify.put('/:id', { preHandler: adminAuth }, async function (req, reply) {
        const match = getMatch(req)
        realtimeJSON[match] = req.body
        await QInstance.updateDocument(realtimeJSON[match], 'listings')
        reply.send(realtimeJSON)
    })

    // DELETE
    fastify.delete('/:id', { preHandler: adminAuth }, async function (req, reply) {
        const match = getMatch(req)
        await QInstance.removeDocument(realtimeJSON[match]._id.toString(), 'listings')
        if (match !== -1) realtimeJSON.splice(match, 1)
        reply.send(realtimeJSON)
    })

    function getMatch(req) {
        return realtimeJSON.findIndex((a) => a._id.toString() === req.params.id.toString())
    }
}

export default routes
