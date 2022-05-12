// A full database replica based on some collections subkeys
// Data is replicated on startup and updated in realtime
// Methods must be synchronous and fast

let listings

/**
 *
 * @param { MongoDBNamespace } mongoDB
 * @param { import('ioredis').Redis } redisDB
 */
async function cache(mongoDB, redisDB) {
    let collection
    // fill in listings
    collection = mongoDB.collection('listings')
    const tmp = await collection
        .find()
        .project({ _id: 1.0, usr: 1.0 })
        .toArray()
    listings = tmp.map((doc) => {
        return { id: doc._id.toHexString(), author: doc.usr }
    })
}

function isAuthor(id, author) {
    return listings[id] && listings[id].author === author
}

module.exports = { cache, isAuthor }
