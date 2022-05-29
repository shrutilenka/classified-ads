// No auth
import url from "url";
import visitorCounter from "visitor-counter";
import config from '../../configuration.js';
import visitorsHtml from "./visitors-html";
const secretPath = process.env.SECRET_PATH

const params = (req, param) => {
    const query = url.parse(req.url, true).query
    return query[param] || typeof query[param] === 'string'
}
let stats

const dbName = process.env.NODE_ENV === 'development' ? 'listings_db_dev' : 'listings_db'

export const getStats = async function getStats() {
    stats =
        stats ||
        (await visitorCounter({
            mongourl: config('DATABASE') || process.env.MONGODB_URI,
            dbName: dbName,
        }))
    return stats
}
export const handler = async (req, reply) => {
    if (params(req, 'all')) {
        const response = await stats.get()
        reply.send(JSON.stringify(response, null, 2))
    }

    if (params(req, 'range')) {
        const result = await stats.get(params(req, 'range'))
        reply.send(JSON.stringify(result, null, 2))
    }

    if (params(req, 'current')) {
        const result = await stats.visitors()
        reply.send(JSON.stringify(result, null, 2))
    }
    if (req.url === `/${secretPath}/visitors`) reply.type('text/html').send(visitorsHtml)
}
