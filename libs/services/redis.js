function purgeKeys(redisDB) {
    console.log('Redis purge is running')
    var stream = redisDB.scanStream({ match: '*' })
    stream.on('data', function (resultKeys) {
        if (resultKeys.length) {
            redisDB.unlink(resultKeys)
        }
    })
    stream.on('end', function () {
        console.log('all keys have been visited')
    })
}

module.exports = function (redisDB) {
    this.purgeKeys = function () {
    // Run once on startup
        purgeKeys(redisDB)
        // Run every 3 hours
        if (process.env.worker_id == '1') setInterval(purgeKeys, 3 * 1000 * 60 * 60, redisDB)
    }
}