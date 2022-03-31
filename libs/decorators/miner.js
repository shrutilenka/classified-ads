const { TopK, BloomFilter } = require('bloom-filters')
const index = new BloomFilter(10, 4)

const minerTree = {
    host: new TopK(10, 0.001, 0.99),
    ua: new TopK(10, 0.001, 0.99),
}
const isHashable = (s) => s && typeof s === 'string' && s.length > 3

function miner(request, reply, done) {
    try {
        // can add more if necessary
        const host = request.headers.host
        const ua = request.headers['user-agent']
        if (![host, ua].every((v) => isHashable(v))) {
            done()
            return
        }
        // index by host only
        if (index.has(host)) {
            done()
            return
        }
        index.add(host)
        minerTree.host.add(host)
        minerTree.ua.add(ua)
    } catch (error) {
        request.log.error(error.message)
    }
    done()
}

module.exports = { miner, minerTree }
