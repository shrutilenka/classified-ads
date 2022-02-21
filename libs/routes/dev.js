const queries = require('../services/mongo')

async function routes(fastify, options, next) {
    const { db } = fastify.mongo
    const logger = fastify.log
    const QInstance = new queries(db, logger)
    const queriesMethods = Object.getOwnPropertyNames(QInstance)
    queriesMethods.forEach((url) => {
        fastify.get(`/${url}`, async (request, reply) => {
            let res = await QInstance[url]()
            reply.send({ url: url, data: res})
        })
    })
}

module.exports = routes