async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
        return { hello: 'game' }
    })
}

module.exports = routes