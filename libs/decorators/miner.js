const { TopK } = require('bloom-filters')

const minerTree = {
    'host': new TopK(10, 0.001, 0.99),
    'user-agent': new TopK(10, 0.001, 0.99),
}
const isGoodHashable = (s) => s && typeof s === 'string' && s.length > 3

function miner(request, reply, done) {
    try {
        const host = request.headers.host
        const ua = request.headers['user-agent']
        if(isGoodHashable(host)) {
            minerTree.host.add(request.headers.host)
        }
        if(isGoodHashable(ua)) {
            minerTree['user-agent'].add(request.headers['user-agent'])
        }
    } catch (error) {
        request.log.error(error.message)
    }
    done()
}

module.exports = { miner, minerTree }