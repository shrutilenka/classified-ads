// No auth
require('dotenv').config()
const secretPath = process.env.SECRET_PATH

const visitorCounter = require('visitor-counter')
const url = require('url')
const visitorsHtml = require('./visitors-html')
const params = (req, param) => {
    const query = url.parse(req.url, true).query
    return query[param] || typeof query[param] === 'string'
}
let stats
module.exports.getStats = async function getStats(){
    stats = stats || await visitorCounter({ mongourl: 'mongodb://localhost:27017/', dbName: 'listings_db' })
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