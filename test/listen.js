const tap = require('tap')
const request = require('request')
const buildFastify = require('../app')

tap.test('GET `/` route', async (t) => {
    t.plan(5)
    
    buildFastify(false).then((fastify) => {
        t.teardown(() => fastify.close())

        fastify.listen(0, (err) => {
            t.error(err)
    
            request({
                method: 'GET',
                url: 'http://localhost:' + fastify.server.address().port
            }, (err, response, body) => {
                t.error(err)
                t.equal(response.statusCode, 200)
                t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
                // t.same(JSON.parse(body), { hello: 'world' })
                t.has(JSON.parse(body), 'listings', )
            })
        })
    })

})