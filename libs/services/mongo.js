import { ObjectId } from '@fastify/mongodb'
import { Mutex } from 'async-mutex'
import emailToName from 'email-to-name'
import { Blog, Comment, Donation, Skill, User } from '../constraints/models.js'
import { refreshTopK } from '../services/miner.js'
import Dictionary from './dictionary.js'
import { crypto, EphemeralData } from './helpers.js'
import { getListingById, getListingsSince } from './mongo-protobuff.js'
/**
 * This function returns an ObjectId embedded with a given dateTime
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
const key = crypto.passwordDerivedKey(process.env.PASSWORD)
/**
 *
 * @param { MongoDBNamespace } mongoDB
 * @param { import('ioredis').Redis } redisDB
 */
export default function (mongoDB, redisDB) {
    /** @type { Map<string, Mutex> } */
    let locks = new Map()
    /** @type { Collection } */
    let collection
    /** @type { Filter } */
    const baseQuery = { d: false, a: true }
    const baseProjection = { geolocation: 0.0, d: 0.0, a: 0.0 }
    const baseSort = [['_id']] //'desc'
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
        if (elem.lng)
            elem.geolocation = {
                type: 'Point',
                coordinates: [parseFloat(elem.lng), parseFloat(elem.lat)],
            }
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
        const res = await collection.insertOne(listing)
        return res.insertedId
    }

    /**
     * Insert a document -message into DB
     * @param {*} elem a JSON representation of a Listing
     * @return {Promise}
     */
    this.insertComment = async function (elem) {
        // console.log('inserting')
        // console.log(elem)
        let comment
        collection = mongoDB.collection('comment')
        comment = new Comment(elem)
        const res = await collection.insertOne(comment)
        return res.acknowledged
    }

    /**
     * Get comments from DB
     * @param {string} peer1 email of sender or receiver
     * @param {string} peer2 email of sender or receiver
     * @param {string} thread id of the thread where a message was sent/received
     * @return {Promise}
     */
    this.getComments = async function (peer1, peer2, thread) {
        const forward = { $and: [{ from: peer1 }, { to: peer2 }] }
        const backward = { $and: [{ from: peer2 }, { to: peer1 }] }
        const whenAuthor = { $or: [{ from: peer1 }, { to: peer1 }] }
        const bidirection = peer1 !== peer2 ? { $or: [forward, backward] } : whenAuthor
        const query = { $and: [bidirection, { thread: thread }] }
        return await mongoDB.collection('comment').find(query).sort({ sent: -1 }).toArray()
    }

    /**
     * Get the comment from DB
     * @param {string} peer1 email of sender or receiver
     * @param {string} peer2 email of sender or receiver
     * @param {string} thread id of the thread where a message was sent/received
     * @return {Promise}
     */
    this.getCommentById = async function (id) {
        collection = mongoDB.collection('listing')
        const query = JSON.parse(JSON.stringify(baseQuery))
        const projection = {
            from: 1.0,
            to: 1.0,
        }
        query._id = new ObjectId(id)
        const doc = await collection.findOne(query, { projection: projection })
        return [doc.from, doc.to]
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
     * If Admin then get unapproved document
     * @param {String} id Id of a Listing
     * @param {Boolean} isAdmin if the caller is admin
     * @return {Promise}
     */
    this.getListingById = async function (id, isAdmin, viewer) {
        if (!locks.has(id)) locks.set(id, new Mutex())
        const release = await locks.get(id).acquire()
        const unique = `glid:${id}`
        const canView = (doc) => isAdmin || doc.usr === viewer || doc['a']

        const cached = await redisDB.exists(unique) // && false
        collection = mongoDB.collection('listing')
        // const query = isAdmin ? { a: false } : JSON.parse(JSON.stringify(baseQuery))
        const query = {}
        const projection = { geolocation: 0.0 }
        if (cached) {
            const upLevel = (await redisDB.hget(`up-ids`, id)) || '1'
            if (upLevel === '1') {
                const buffer = await redisDB.getBuffer(unique)
                let cachedQResult = new getListingById().decodeBuffer(buffer)
                // console.log(cachedQResult)
                release()
                if (canView(cachedQResult)) return cachedQResult
                else return
            }
            if (upLevel === '2' || upLevel === '3') await redisDB.del(unique)
        }
        query._id = new ObjectId(id)
        const doc = await collection.findOne(query, { projection: projection })
        // console.log(doc)
        // document has been removed from DB or doesn't exist at all
        if (!doc) {
            await redisDB.hdel(`up-ids`, id)
            if (cached) await redisDB.del(unique)
            release()
            return
        }
        if (canView(doc)) {
            doc._id = doc._id.toHexString()
            const buffer = new getListingById().getBuffer(doc)
            redisDB.setBuffer(unique, buffer)
            const upLevel = (await redisDB.hget(`up-ids`, id)) || '1'
            // console.log(`current document level ${upLevel}`)
            if (upLevel === '2') await redisDB.hdel(`up-ids`, id)
            if (upLevel === '3') await redisDB.hset(`up-ids`, id, '1')
            release()
            return doc
        } else {
            release()
            return
        }
    }

    /**
     * Get documents created since number of days
     * @param {*} days number of days since document was created
     * @param {*} section which section
     * @param {*} pagination number of pages and listings in each page
     * @return {Promise}
     */
    this.getListingsSince = async function (days, section, pagination) {
        const unique = `${section || 'index'}-${days}-${pagination.perPage}-${pagination.page}`
        const cached = await redisDB.exists(`gls:${unique}`)
        collection = mongoDB.collection('listing')
        const objectId = getObjectId(days)
        const query = JSON.parse(JSON.stringify(baseQuery))
        let sort = baseSort
        query._id = { $gt: objectId }
        if (section) {
            query.section = section
        } else {
            // sort = [['section']]
            pagination.perPage = 18
        }
        const upIds = await redisDB.hkeys(`up-ids`)
        const glsIds = await redisDB.smembers(`gls-ids:${unique}`)
        // Because cache mechanism is only one to many
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
                let cachedQResult = new getListingsSince().decodeBuffer(buffer)
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
            // doc.title = doc.desc.substring(0, Math.round(substring / 2))
            doc._id = doc._id.toHexString()
        })
        let newQResult = { documents: docs, count: count }
        if (section !== '') return newQResult
        try {
            const buffer = new getListingsSince().getBuffer(newQResult)
            redisDB.setBuffer(`gls:${unique}`, buffer)
            await redisDB.sadd(
                `gls-ids:${unique}`,
                docs.map((doc) => doc._id),
            )
            // docs.forEach((doc) => redisDB.lpush('gls-ids', doc._id))
        } catch (error) {
            console.error(error)
        }
        // Not rendered in template by remove anyway
        newQResult.documents.forEach((doc) => {
            delete doc.usr
        })
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
        const tmp = await collection.find(query).project(projection).sort(baseSort).toArray()
        tmp.forEach((l) => {
            l.a = l.a ? '' : 'nonapproved'
            l.d = l.d ? 'deactivated' : ''
        })
        return tmp
    }
    
    /**
     * Get notification (messages/...) attached to a specific user
     * @param {*} user user email
     * @return {Promise}
     */
    this.getNotificationsByUser = async function (user) {
        collection = mongoDB.collection('comment')
        const query = { $or: [{ from: user }, { to: user }] }
        const projection = {}
        const sort = [['threadId', 1], ['sent', 1]]
        // from: String,
        // to: String,
        // sent: Date,
        // threadId: String,
        // thread: String,
        // message: String,
        const tmp = await collection.find(query).project(projection).sort(sort).toArray()
        tmp.forEach((element) => {
            // TODO: replace peer by initials
            if (element.from === user) {
                element['peer'] = emailToName.process(element.to)
                element['direction'] = 'sender'
            }
            else {
                element['peer'] = emailToName.process(element.from)
                element['direction'] = 'receiver'
            }
            // A crypt is gonna be used on front-end instead
            element.from = crypto.encrypt(key, element.from)
            element.to = crypto.encrypt(key, element.to)
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
        user = new User(elem)
        delete user.password
        return await collection.insertOne(user)
    }

    this.updateUser = async function (elem) {
        const result = await mongoDB
            .collection('users')
            .updateOne({ _id: ObjectId(elem._id) }, { $set: elem }, { upsert: false })
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
        const res = await collection.insertOne(tempUser)
        return res.acknowledged
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

    const translator = new Dictionary(['en', 'ar', 'fr'])

    /**
     * Approximate search based on indexed text fields: title, desc, tags
     * It also feeds topK miner
     * @param {*} phrase sentence to search
     * @param {*} exact whether search the exact sentence or separate terms
     * @param {*} division which division
     * @param {*} section which section
     * @param {*} lang which language
     * @return {Promise}
     */
    this.gwoogl = async function (phrase, exact, division, section, lang) {
        const daysBefore = 100
        collection = mongoDB.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        phrase = exact ? `"${phrase.trim()}"` : phrase.trim()
        const query = JSON.parse(JSON.stringify(baseQuery))
        let collation = lang === 'und' ? baseCollation : { locale: lang }
        query.$text = { $search: phrase }
        query._id = { $gt: ObjectId }
        if (lang !== 'und') query.lang = lang
        if (section) query.section = section
        if (division && division !== 'und') query.div = division
        const docs = await collection
            .find(query, { score: { $meta: 'textScore' } })
            .collation(collation)
            .project(baseProjection)
            .sort({ score: { $meta: 'textScore' } })
            .limit(21)
            .toArray()
        const count = await collection.countDocuments(query)
        const result = { documents: docs, count: count, crossLangDocs: [] }
        if (count > 3) {
            refreshTopK(phrase)
        }
        if (count < 6 && phrase.indexOf(' ') < 0) {
            let translations
            try {
                // console.log(`---------${lang}--------`)
                translations = translator.translate(phrase, lang, 3)
                // console.log(translations)
                for (const [lang, keywords] of Object.entries(translations)) {
                    collation = { locale: lang }
                    phrase = keywords.join(' ')
                    query.$text = { $search: phrase }
                    const crossLangDocs = await collection
                        .find(query, { score: { $meta: 'textScore' } })
                        .collation(collation)
                        .project(baseProjection)
                        .sort({ score: { $meta: 'textScore' } })
                        .limit(3)
                        .toArray()
                    // console.log(crossLangDocs)
                    crossLangDocs.forEach((doc) => {
                        doc['crosslang'] = lang
                    })
                    result.crossLangDocs = result.crossLangDocs.concat(crossLangDocs)
                }
            } catch (error) {
                console.error(error.message)
            }
        }
        return result
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
        const docs = await collection
            .find(query)
            .project(baseProjection)
            .sort(baseSort)
            .skip(pagination.perPage * pagination.page - pagination.perPage)
            .limit(pagination.perPage)
            .toArray()
        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
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
        const docs = await collection
            .find(query)
            .project(baseProjection)
            .sort(baseSort)
            .skip(pagination.perPage * pagination.page - pagination.perPage)
            .limit(pagination.perPage)
            .toArray()
        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
    }

    /**
     * Search based on indexed Geo-spatial field: lat, lng
     * @param {*} latitude
     * @param {*} longitude
     * @param {*} section (should be 'donations' or 'events'.)
     * @return {Promise}
     */
    this.getListingsByGeolocation = async function (latitude, longitude, section) {
        const daysBefore = 100
        collection = mongoDB.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        if (section) query.section = section
        query.geolocation = {
            $geoWithin: {
                $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], 10 / 3963.2], // 10 miles = 16.09344 kilometers
            },
        }
        const docs = await collection.find(query).project(baseProjection).sort(baseSort).limit(21).toArray()
        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
    }

    /**
     *
     * @param {*} id id of unique document
     * @param {*} key boolean field to be toggled
     * @returns
     */
    this.toggleValue = async function (id, key, collName) {
        if (!locks.has(id)) locks.set(id, new Mutex())
        const release = await locks.get(id).acquire()
        collection = await mongoDB.collection(collName)
        const query = {}
        query._id = new ObjectId(id)
        const docs = await collection.find(query, { limit: 1 }).toArray()
        if (!docs) {
            release()
            return
        }
        const newValues = { $set: {} }

        newValues.$set[key] = !docs[0][key]
        const options = { returnOriginal: false }
        const res = await collection.findOneAndUpdate(query, newValues, options)
        await redisDB.hset(`up-ids`, id, '3')
        release()
        return res.value
    }

    this.autocomplete = async function (keyword) {
        collection = mongoDB.collection('words')
        const keywordRgx = new RegExp('^' + keyword, 'i')
        return await collection.find({ _id: keywordRgx }).project({ _id: 1 }).toArray()
    }

    // One day
    let topSearches = new EphemeralData(86400000)
    this.topSearches = async function () {
        if (topSearches.isSame()) {
            return topSearches.data
        }
        topSearches.reset()
        collection = mongoDB.collection('words')
        topSearches.data = await collection.find({}).project({ _id: 1 }).sort(/* somehow */).limit(10).toArray()
        return topSearches.data
    }

    this.getListingsByKeyword = async function (keyword, pagination) {
        collection = mongoDB.collection('words')
        const result = await collection.findOne({ _id: keyword })
        if (result) {
            const objIds = result.docs
            if (objIds.length == 0) {
                return { documents: [], count: 0 }
            }
            const docs = await mongoDB
                .collection('listing')
                .find({ _id: { $in: objIds } })
                .project(baseProjection)
                .sort(baseSort)
                .skip(pagination.perPage * pagination.page - pagination.perPage)
                .limit(pagination.perPage)
                .toArray()
            const count = await collection.countDocuments({
                _id: { $in: objIds },
            })
            return { documents: docs, count: count }
        } else {
            return { documents: [], count: 0 }
        }
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
    this.topByDivision = async function () {
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
        const docs = await collection.find(query).project(projection).sort(baseSort).limit(limit).toArray()
        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
    }

    /**
     * Update a document in DB
     * @param {*} elem a JSON representation of a Listing
     * @return {Promise}
     */
    this.updateDocument = async function (elem, collName) {
        const id = elem._id.toHexString()
        if (!locks.has(id)) locks.set(id, new Mutex())
        const release = await locks.get(id).acquire()
        const result = await mongoDB
            .collection(collName)
            .updateOne({ _id: ObjectId(elem._id) }, { $set: elem }, { upsert: false })
        await redisDB.hset(`up-ids`, elem._id.toHexString(), '1')
        release()
        return result
    }

    /**
     * Remove a document in DB
     * @param {*} id An ID of a Listing
     * @return {Promise}
     */
    this.removeDocument = async function (id, collName) {
        const result = await mongoDB.collection(collName).deleteOne({ _id: ObjectId(id) })
        return result
    }

    this.existsDocument = async function (id, collName) {
        return await redisDB.exists(`cacheIds:${collName}:${id}`)
    }

    this.insertAnnouncement = async function (doc) {
        collection = mongoDB.collection('announcements')
        const res = await collection.insertOne(doc)
        return res.insertedId
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
