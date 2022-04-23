// if not, specify jsdoc like
// /**
// * @return {Promise<string>}
// */

const { ObjectId } = require('fastify-mongodb')
const {
    MongoDBNamespace,
    Collection,
    Filter,
    CollationOptions,
} = require('mongodb')
const {
    Donation,
    Skill,
    Blog,
    Comment,
    User,
} = require('../constraints/db_models')
const { refreshTopK, topk } = require('../services/miner')
const EphemeralData = require('./helpers').EphemeralData

/**
 * This function returns an ObjectId embedded with a given datetime
 * Accepts number of days since document was created
 * Author: https://stackoverflow.com/a/8753670/1951298
 * @param {Number} days
 * @return {object}
 */
function getObjectId(days) {
    const yesterday = new Date()
    days = days || (process.env.NODE_ENV === 'localhost' ? 1000 : 14)
    yesterday.setDate(yesterday.getDate() - days)
    const hexSeconds = Math.floor(yesterday / 1000).toString(16)
    return new ObjectId(hexSeconds + '0000000000000000')
}

/**
 *
 * @param { MongoDBNamespace } mongoDB
 * @param { import('ioredis').Redis } redisDB
 */
module.exports = function (mongoDB, redisDB) {
    /** @type { Collection } */
    let collection
    /** @type { Filter } */
    const baseQuery = { d: false, a: true }
    const baseProjection = { geolocation: 0.0, d: 0.0, a: 0.0 }
    const baseSort = [['_id', 'desc']]
    /** @type { CollationOptions } */
    const baseCollation = {}
    /**
     * Insert a document into DB
     * @param {*} elem a JSON representation of a Listing
     * @return {Promise}
     */
    this.insertListing = async function (elem) {
        let listing
        collection = mongoDB.collection('listings')
        // https://stackoverflow.com/a/59841285/1951298
        elem.geolocation = {
            type: 'Point',
            coordinates: [parseFloat(elem.lng), parseFloat(elem.lat)],
        }
        return new Promise(function (resolve, reject) {
            try {
                switch (elem.section) {
                case 'donations':
                    listing = new Donation(elem)
                    break
                case 'skills':
                    listing = new Skill(elem)
                    break
                case 'blogs':
                    listing = new Blog(elem)
                    break
                default:
                    break
                }
                collection.insertOne(listing, function (err, res) {
                    if (err) return reject(err)
                    return resolve(res.acknowledged)
                })
            } catch (err) {
                return reject(err)
            }
        })
    }

    /**
     * Insert a document -message into DB
     * @param {*} elem a JSON representation of a Listing
     * @return {Promise}
     */
    this.insertComment = async function (elem) {
        let comment
        collection = mongoDB.collection('comment')
        return new Promise(function (resolve, reject) {
            try {
                comment = new Comment(elem)
                collection.insertOne(comment, function (err, res) {
                    if (err) return reject(err)
                    return resolve(res.acknowledged)
                })
            } catch (err) {
                return reject(err)
            }
        })
    }

    /**
     * Get comments from DB
     * @param {string} peer1 email of sender or reciever
     * @param {string} peer2 email of sender or reciever
     * @param {string} thread id of the thread where a message was sent/recieved
     * @return {Promise}
     */
    this.getComments = async function (peer1, peer2, thread) {
        const forward = { $and: [{ from: peer1 }, { to: peer2 }] }
        const backward = { $and: [{ from: peer2 }, { to: peer1 }] }
        const whenAuthor = { $or: [{ from: peer1 }, { to: peer1 }] }
        const bidirection =
            peer1 !== peer2 ? { $or: [forward, backward] } : whenAuthor
        const query = { $and: [bidirection, { thread: thread }] }
        return await mongoDB
            .collection('comment')
            .find(query)
            .sort({ sent: -1 })
            .toArray()
    }

    /**
     * Get the comment from DB
     * @param {string} peer1 email of sender or reciever
     * @param {string} peer2 email of sender or reciever
     * @param {string} thread id of the thread where a message was sent/recieved
     * @return {Promise}
     */
    this.getCommentById = async function (id) {
        collection = mongoDB.collection('listing')
        const query = JSON.parse(JSON.stringify(baseQuery))
        const projection = {
            from: 1.0,
            to: 1.0,
        }
        return new Promise(function (resolve, reject) {
            try {
                new ObjectId(id)
            } catch (err) {
                return reject(err)
            }
            query._id = new ObjectId(id)
            collection
                .findOne(query, { projection: projection })
                .then((doc) => {
                    return resolve([doc.from, doc.to])
                })
        })
    }

    // up-ids cached [doc._id] (just updated documents)
    // glid-@@@@@@@@@@@@ cached document
    // gls-#### cached pages

    // Cache mecanism
    // update doc then add it to up-ids[doc._id] with up = 3
    // 1- getListingById
    // if cached check:
    //  is doc up (up-ids[doc._id] ===1) do nothing proceed happily
    //  is doc up (up-ids[doc._id] ===3 or up-ids[doc._id]===2),
    //      then remove cache
    // get new doc from DB, down up-ids
    //      (up-ids[doc._id] ===3 ==> [doc._id] = 1) or (up-ids[doc._id] ===2 ==> [doc._id] = 0)
    //       and add it to glid-@@@@@@@@@@@@
    // 2- getListingsSince
    // if cached check:
    //  is doc up (up-ids[doc._id] ===2) do nothing proceed happily
    //  is doc up (up-ids[doc._id] ===3 or up-ids[doc._id]===1),
    //      then remove cache
    // get new doc from DB, down up-ids
    //      (up-ids[doc._id] ===3 ==> [doc._id] = 2) or (up-ids[doc._id] ===1 ==> [doc._id] = 0)
    //       and add it to gls-####

    // glid:${id}
    // redis> HSET glid id 3
    // (integer) 1
    // redis> HSET myhash id 2
    // (integer) 1
    // redis> HKEYS myhash
    // 1) "id1"
    // 2) "id2"

    /**
     * Get a document from DB
     * If Admin then get unnaproved document
     * @param {String} id Id of a Listing
     * @param {Boolean} isAdmin if the caller is admin
     * @return {Promise}
     */
    this.getListingById = async function (id, isAdmin, viewer) {
        const getListingById = new encoder.getListingById()
        const unique = `glid:${id}`
        const canView = (doc) => isAdmin || doc.usr === viewer || doc['a']
        const cached = await redisDB.exists(unique)
        collection = mongoDB.collection('listing')
        // const query = isAdmin ? { a: false } : JSON.parse(JSON.stringify(baseQuery))
        const query = {}
        const projection = { geolocation: 0.0 }
        if (cached) {
            const upLevel = (await redisDB.hget(`up-ids`, id)) || '1'
            if (upLevel === '1') {
                const buffer = await redisDB.getBuffer(unique)
                let cachedQResult = getListingById.decodeBuffer(buffer)
                if (canView(cachedQResult)) return cachedQResult
                else return
            }
            if (upLevel === '2' || upLevel === '3') await redisDB.del(unique)
        }
        query._id = new ObjectId(id)
        const doc = await collection.findOne(query, { projection: projection })
        // document has been removed from DB or doesn't exist at all
        if (!doc) {
            await redisDB.hdel(`up-ids`, id)
            if (cached) await redisDB.del(unique)
            return
        }
        if (canView(doc)) {
            try {
                doc._id = doc._id.toHexString()
                const buffer = getListingById.getBuffer(doc)
                redisDB.setBuffer(unique, buffer)
                const upLevel = (await redisDB.hget(`up-ids`, id)) || '1'
                // console.log(`current document level ${upLevel}`)
                if (upLevel === '2') await redisDB.hdel(`up-ids`, id)
                if (upLevel === '3') await redisDB.hset(`up-ids`, id, '1')
            } catch (error) {
                console.log(error)
            }
            return doc
        } else {
            return
        }
    }

    const encoder = require('./mongo-protobuff')
    /**
     * Get documents created since number of days
     * @param {*} days number of days since document was created
     * @param {*} section which section
     * @param {*} pagination number of pages and listings in each page
     * @return {Promise}
     */
    this.getListingsSince = async function (days, section, pagination) {
        const getListingsSince = new encoder.getListingsSince()
        const unique = `${section || 'index'}-${days}-${pagination.perPage}-${
            pagination.page
        }`
        const cached = await redisDB.exists(`gls:${unique}`)
        collection = mongoDB.collection('listing')
        const objectId = getObjectId(days)
        const query = JSON.parse(JSON.stringify(baseQuery))
        let sort = baseSort
        query._id = { $gt: objectId }
        if (section) {
            query.section = section
        } else {
            sort = [['section']]
            pagination.perPage = 18
        }
        const upIds = await redisDB.hkeys(`up-ids`)
        const glsIds = await redisDB.smembers(`gls-ids:${unique}`)
        // TODO: because cache mechanism is only one to many
        // only deal with pages with section 'index' (most important)
        if (cached && section === '') {
            // get gls-ids:${unique} and intersect with glid-ids
            let refreshed = false
            for (let i = 0; i < glsIds.length; i++) {
                const id = glsIds[i]
                if (upIds.indexOf(id) < 0) continue
                const upLevel = (await redisDB.hget(`up-ids`, id)) || '2'
                if (upLevel === '2') continue
                else {
                    if (upLevel === '3') await redisDB.hset(`up-ids`, id, '2')
                    if (upLevel === '1') await redisDB.hdel(`up-ids`, id)
                    await redisDB.del(`gls-ids:${unique}`)
                    refreshed = true
                }
            }
            if (!refreshed) {
                const buffer = await redisDB.getBuffer(`gls:${unique}`)
                let cachedQResult = getListingsSince.decodeBuffer(buffer)
                return cachedQResult
            }
        }
        const docs = await collection
            .find(query)
            .project(baseProjection)
            .skip(pagination.perPage * pagination.page - pagination.perPage)
            .limit(pagination.perPage)
            .sort(sort)
            .toArray()
        // Normally this doesn't happen (consistent UI / no bad doers)
        if (docs.length === 0) {
            await redisDB.del(`gls:${unique}`)
            await redisDB.del(`gls-ids:${unique}`)
            return { documents: [], count: 0 }
        }
        const count = await collection.countDocuments(query)
        const substring = 100
        docs.forEach((doc) => {
            doc.desc = doc.desc.substring(0, substring)
            doc.title = doc.desc.substring(0, Math.round(substring / 2))
            doc._id = doc._id.toHexString()
        })
        let newQResult = { documents: docs, count: count }
        if (section !== '') return newQResult
        try {
            const buffer = getListingsSince.getBuffer(newQResult)
            redisDB.setBuffer(`gls:${unique}`, buffer)
            await redisDB.sadd(
                `gls-ids:${unique}`,
                docs.map((doc) => doc._id),
            )
            // docs.forEach((doc) => redisDB.lpush('gls-ids', doc._id))
        } catch (error) {
            console.log(error)
        }
        return newQResult
    }

    /**
     * Get documents created by a specific user
     * @param {*} user user email
     * @return {Promise}
     */
    this.getListingsByUser = async function (user) {
        collection = mongoDB.collection('listing')
        const query = {}
        const projection = { geolocation: 0.0 /*d: 0.0, a: 0.0*/ }
        query.usr = user
        const tmp = await collection
            .find(query)
            .project(projection)
            .sort(baseSort)
            .toArray()
        tmp.forEach((l) => {
            l.a = l.a ? '' : 'notapproved'
            l.d = l.d ? 'deactivated' : ''
        })
        return tmp
    }

    /**
     * Get user by username
     * @param {*} user user email
     * @return {Promise}
     */
    this.getUserById = async function (username) {
        collection = mongoDB.collection('users')
        const query = {}
        query.username = username
        return await collection.findOne(query)
    }

    /**
     * Insert a user into DB
     * @param {*} elem a JSON representation of a user
     * @return {Promise}
     */
    this.insertUser = async function (elem) {
        let user
        collection = mongoDB.collection('users')
        return new Promise(function (resolve, reject) {
            try {
                user = new User(elem)
                // delete user.password
                // TODO: remove pass again, but objectmodel restricts that :(
                collection.insertOne(user, function (err, res) {
                    if (err) return reject(err)
                    return resolve(res.acknowledged)
                })
            } catch (err) {
                return reject(err)
            }
        })
    }

    this.updateUser = async function (elem) {
        const result = await mongoDB
            .collection('users')
            .updateOne(
                { _id: ObjectId(elem._id) },
                { $set: elem },
                { upsert: false },
            )
        return result
    }

    /**
     * Insert a temporary user into DB (ttl)
     * @param {*} elem a JSON representation of a user
     * @return {Promise}
     */
    this.insertTmpUser = async function (tempUser) {
        // createdAt: ttl index
        tempUser['createdAt'] = new Date()
        collection = mongoDB.collection('userstemp')
        return new Promise(function (resolve, reject) {
            try {
                collection.insertOne(tempUser, function (err, res) {
                    if (err) return reject(err)
                    return resolve(res.acknowledged)
                })
            } catch (err) {
                return reject(err)
            }
        })
    }

    /**
     * Get temp user by token
     * @param {*} token
     * @return {Promise}
     */
    this.getTmpUserByToken = async function (token) {
        collection = mongoDB.collection('userstemp')
        const query = {}
        query.token = token
        return await collection.findOne(query)
    }

    /**
     * Approximate search based on indexed text fields: title, desc, tags
     * It also feeds topK miner
     * @param {*} phrase sentense to search
     * @param {*} exact whether search the exact sentense or separate terms
     * @param {*} division which division
     * @param {*} section which section
     * @return {Promise}
     */
    this.gwoogl = async function (
        phrase,
        exact,
        division,
        section,
        lang,
        pagination,
    ) {
        const daysBefore = 100
        collection = mongoDB.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        phrase = exact ? `"${phrase}"` : phrase
        const query = JSON.parse(JSON.stringify(baseQuery))
        const collation = lang === 'und' ? baseCollation : { locale: lang }
        query.$text = { $search: phrase }
        query._id = { $gt: ObjectId }
        if (lang !== 'und') query.lang = lang
        if (section) query.section = section
        if (division) query.div = division
        return new Promise(function (resolve, reject) {
            collection
                .find(query, { score: { $meta: 'textScore' } })
                .collation(collation)
                .project(baseProjection)
                .sort({ score: { $meta: 'textScore' } })
                .skip(pagination.perPage * pagination.page - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) return reject(err)
                    const count = await collection.countDocuments(query)
                    if (count > 3) {
                        refreshTopK(phrase)
                    }
                    return resolve({ documents: docs, count: count })
                })
        })
    }

    /**
     * Search tag based on indexed tags field
     * @param {*} tag which tag
     * @param {*} pagination number of pages and listings in each page
     * @return {Promise}
     */
    this.getListingsByTag = async function (tag, level, pagination) {
        const daysBefore = 100
        collection = mongoDB.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        switch (level) {
        case 'origin':
            query.tags = tag
            break
        case 'parent':
            query.parent = tag
            break
        case 'granpa':
            query.granpa = tag
            break
        default:
            break
        }
        return new Promise(function (resolve, reject) {
            collection
                .find(query)
                .project(baseProjection)
                .sort(baseSort)
                .skip(pagination.perPage * pagination.page - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) return reject(err)
                    const count = await collection.countDocuments(query)
                    return resolve({ documents: docs, count: count })
                })
        })
    }

    /**
     * Search tag based on division field
     * @param {*} division which division
     * @param {*} pagination number of pages and listings in each page
     * @return {Promise}
     */
    this.getListingsByDivision = async function (division, pagination) {
        const daysBefore = 100
        collection = mongoDB.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        query.div = division
        return new Promise(function (resolve, reject) {
            collection
                .find(query)
                .project(baseProjection)
                .sort(baseSort)
                .skip(pagination.perPage * pagination.page - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) return reject(err)
                    const count = await collection.countDocuments(query)
                    return resolve({ documents: docs, count: count })
                })
        })
    }

    /**
     * Search based on indexed Geospatial field: lat, lng
     * @param {*} latitude
     * @param {*} longitude
     * @param {*} section
     * @return {Promise}
     */
    this.getListingsByGeolocation = async function (
        latitude,
        longitude,
        section,
        pagination,
    ) {
        const daysBefore = 100
        collection = mongoDB.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        if (section) query.section = section
        query.geolocation = {
            $geoWithin: {
                $centerSphere: [
                    [parseFloat(longitude), parseFloat(latitude)],
                    10 / 3963.2,
                ], // 10 miles = 16.09344 kilometers
            },
        }
        return new Promise(function (resolve, reject) {
            collection
                .find(query)
                .project(baseProjection)
                .sort(baseSort)
                .skip(pagination.perPage * pagination.page - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) return reject(err)
                    const count = await collection.countDocuments(query)
                    return resolve({ documents: docs, count: count })
                })
        })
    }

    /**
     *
     * @param {*} id id of unique document
     * @param {*} key boolean field to be toggeled
     * @returns
     */
    this.toggleValue = async function (id, key, collName) {
        collection = mongoDB.collection(collName)
        const query = {}
        return new Promise(function (resolve, reject) {
            try {
                new ObjectId(id)
            } catch (err) {
                return reject(err)
            }
            query._id = new ObjectId(id)
            collection.find(query, { limit: 1 }).toArray((err, docs) => {
                if (!docs) return reject(new Error('document not found'))
                const newValues = { $set: {} }
                newValues.$set[key] = !docs[0][key]
                const options = { returnOriginal: false }
                collection.findOneAndUpdate(
                    query,
                    newValues,
                    options,
                    function (err, res) {
                        if (err) return reject(err)
                        return resolve(res.value)
                    },
                )
            })
        })
    }

    this.autocomplete = async function (keyword) {
        collection = mongoDB.collection('words')
        const keywRgx = new RegExp('^' + keyword, 'i')
        return await collection
            .find({ _id: keywRgx })
            .project({ _id: 1 })
            .toArray()
    }

    this.getListingsByKeyword = async function (keyword, pagination) {
        collection = mongoDB.collection('words')
        return new Promise(function (resolve, reject) {
            collection.findOne({ _id: keyword }, function (err, result) {
                if (err) {
                    return reject(err)
                }
                if (result) {
                    const objIds = result.docs
                    if (objIds.length == 0) {
                        return resolve({ documents: [], count: 0 })
                    }
                    mongoDB
                        .collection('listing')
                        .find({ _id: { $in: objIds } })
                        .project(baseProjection)
                        .sort(baseSort)
                        .skip(
                            pagination.perPage * pagination.page -
                                pagination.perPage,
                        )
                        .limit(pagination.perPage)
                        .toArray(async function (err, docs) {
                            if (err) return reject(err)
                            const count = await collection.countDocuments({
                                _id: { $in: objIds },
                            })
                            return resolve({ documents: docs, count: count })
                        })
                } else {
                    return resolve({ documents: [], count: 0 })
                }
            })
        })
    }

    // { _id: { tags: 'qui', section: 'blogs' }, count: 11 }
    // { _id: { tags: 'voluptatem', section: 'skills' }, count: 8 }
    // { _id: { tags: 'rerum', section: 'skills' }, count: 8 }
    const reformat = (aa) => {
        let res = {}
        let sections = [...new Set(aa.map((a) => a._id.section))]
        let section
        while ((section = sections.pop()) !== undefined) {
            res[section] = aa
                .filter((z) => z._id.section === section)
                .map((l) => {
                    return { count: l.count, tag: l._id.tags }
                })
        }
        return res
    }

    // 5 minutes
    let topTags = new EphemeralData(300000)
    this.topTags = async function () {
        if (topTags.isSame()) {
            return reformat(topTags.data)
        }
        topTags.reset()
        collection = mongoDB.collection('listing')
        const pipeline = [
            { $unwind: '$tags' },
            // by section
            {
                $group: {
                    _id: { tags: '$tags', section: '$section' },
                    count: { $sum: 1 },
                },
            },
            // { $group: { "_id": "$tags", "count": { "$sum": 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
        ]
        topTags.data = await collection.aggregate(pipeline).toArray()
        return reformat(topTags.data)
    }

    // TODO: three repetitive methods but fine,
    // maybe they evolve differently in future
    // { _id: 'Tindouf', count: 8 }
    // { _id: 'Tebessa', count: 7 }
    // { _id: 'Ouargla', count: 6 }
    // 5 minutes
    let topByDiv = new EphemeralData(300000)
    this.topBydivision = async function () {
        if (topByDiv.isSame()) {
            return topByDiv.data
        }
        topByDiv.reset()
        collection = mongoDB.collection('listing')
        const pipeline = [
            // { $match: { section: section } },
            { $group: { _id: '$div', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]
        const tmp = await collection.aggregate(pipeline).toArray()
        topByDiv.data = tmp.map((a) => {
            return { tag: a._id, count: a.count }
        })
        return topByDiv.data
    }

    let topByParentTag = new EphemeralData(300000)
    // 5 minutes
    this.topByParentTag = async function () {
        if (topByParentTag.isSame()) {
            return topByParentTag.data
        }
        topByParentTag.reset()
        collection = mongoDB.collection('listing')
        const pipeline = [
            // { $match: { section: section } },
            { $group: { _id: '$parent', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]
        const tmp = await collection.aggregate(pipeline).toArray()
        topByParentTag.data = tmp.map((a) => {
            return { tag: a._id, count: a.count }
        })
        return topByParentTag.data
    }

    let topByGranpaTag = new EphemeralData(300000)
    // 5 minutes
    this.topByGranpaTag = async function () {
        if (topByGranpaTag.isSame()) {
            return topByGranpaTag.data
        }
        topByGranpaTag.reset()
        collection = mongoDB.collection('listing')
        const pipeline = [
            // { $match: { section: section } },
            { $group: { _id: '$granpa', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]
        const tmp = await collection.aggregate(pipeline).toArray()
        topByGranpaTag.data = tmp.map((a) => {
            return { tag: a._id, count: a.count }
        })
        return topByGranpaTag.data
    }

    /**
     * Get documents for approval or general review
     * When admin doing approval, we only need not yet approved listings
     * When he/she is not, he/she is still doing moderation on all items
     * @param {*} elem a JSON representation of a Listing
     * @return {Promise}
     */
    this.getListingsForModeration = async function (approving) {
        collection = mongoDB.collection('listing')
        const query = approving ? { a: false } : {}
        const projection = {
            geolocation: 0.0,
            ...(!approving && { d: 0.0, a: 0.0 }),
            lat: 0.0,
            lng: 0.0,
            ara: 0.0,
            div: 0.0,
        }
        // TODO: find a solution to limit number of docs not to block UI
        const limit = approving ? 0 : 200
        return new Promise(function (resolve, reject) {
            collection
                .find(query)
                .project(projection)
                .sort(baseSort)
                .limit(limit)
                .toArray(async function (err, docs) {
                    if (err) return reject(err)
                    const count = await collection.countDocuments(query)
                    return resolve({ documents: docs, count: count })
                })
        })
    }

    /**
     * Update a document in DB
     * @param {*} elem a JSON representation of a Listing
     * @return {Promise}
     */
    this.updateDocument = async function (elem, collName) {
        const result = await mongoDB
            .collection(collName)
            .updateOne(
                { _id: ObjectId(elem._id) },
                { $set: elem },
                { upsert: false },
            )
        return result
    }

    /**
     * Remove a document in DB
     * @param {*} id An ID of a Listing
     * @return {Promise}
     */
    this.removeDocument = async function (id, collName) {
        const result = await mongoDB
            .collection(collName)
            .deleteOne({ _id: ObjectId(id) })
        return result
    }
}

// // function traceMethodCalls(obj) {
// //   let handler = {
// //       get(target, propKey, receiver) {
// //           const origMethod = target[propKey]
// //           return function (...args) {
// //               let result = origMethod.apply(this, args)
// //               logger.log({ level: 'info', message: 'MONGO call ' + propKey })
// //               return result
// //           }
// //       }
// //   }
// //   return new Proxy(obj, handler)
// // }

// module.exports = queries // traceMethodCalls(queries)
