/**
 * 
 * @param {import("ioredis").Redis} redisDB 
 */
function purgeKeys(redisDB) {
    console.log('Redis purge is running')
    var stream = redisDB.scanStream({ match: '*' })
    stream.on('data', function (resultKeys) {
        stream.pause()
        if (resultKeys.length) {
            redisDB.unlink(resultKeys).then(() => {
                stream.resume()
            })
        }
    })
    stream.on('end', function () {
        console.log('all keys have been visited')
    })
}

/**
 * 
 * @param {import("ioredis").Redis} redisDB 
 */
module.exports = function (redisDB) {
    this.purgeKeys = function () {
    // Run once on startup
        purgeKeys(redisDB)
        // Run every 3 hours
        if (process.env.worker_id == '1') setInterval(purgeKeys, 3 * 1000 * 60 * 60, redisDB)
    }
}