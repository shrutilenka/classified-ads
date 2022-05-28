import queries from "../services/mongo";

async function routes(fastify, options, next) {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis)
    const queriesMethods = Object.getOwnPropertyNames(QInstance)
    queriesMethods.forEach((url) => {
        fastify.post(`/${url}`, async (request, reply) => {
            const { body } = request
            const params = body ? Object.values(body) : []
            const pagination = { perPage: 9, page: 1 }
            let res
            try {
                console.log(`calling /${url} with parameters ${JSON.stringify(params)}`)
                res = await QInstance[url](...params, pagination)
                reply.send({ url: url, data: res })
            } catch (error) {
                reply.send({ url: url, error: error })
            }
        })
    })
}

module.exports = routes
