// No auth
const config = require('config')
const secretPath = process.env.SECRET_PATH

const visitorCounter = require('visitor-counter')
const url = require('url')
const visitorsHtml = require('./visitors-html')
const params = (req, param) => {
    const query = url.parse(req.url, true).query
    return query[param] || typeof query[param] === 'string'
}
let stats

const dbName = process.env.NODE_ENV === 'development'? 'listings_db_dev': 'listings_db'

module.exports.getStats = async function getStats(){
    stats = stats || await visitorCounter({ mongourl: config.get('DATABASE') || process.env.MONGODB_URI, dbName: dbName })
    return stats
}
module.exports.handler = async (req, reply) => {
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