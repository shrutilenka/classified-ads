// if not, specify jsdoc like 
// /**
// * @return {Promise<string>}
// */

const { ObjectId } = require('fastify-mongodb')
const { Donation, Skill, Blog, Comment, User } = require('../constraints/db_models')
const { refreshTopK, topk } = require('../services/miner')

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

// Closure for db instance only
module.exports = function (db) {
    /**
   * Insert a document into DB
   * @param {*} elem a JSON representation of a Listing
   * @return {Promise}
   */
    this.insertListing = async function (elem) {
        let listing
        const collection = db.collection('listing')
        // https://stackoverflow.com/a/59841285/1951298
        elem.geolocation = {
            type: 'Point',
            coordinates: [parseFloat(elem.lng), parseFloat(elem.lat)]
        }
        return new Promise(function (resolve, reject) {
            try {
                switch (elem.section) {
                case 'donations':
                    listing = new Donation(elem)
                    break;
                case 'skills':
                    listing = new Skill(elem)
                    break;
                case 'blogs':
                    listing = new Blog(elem)
                    break;
                default:
                    break;
                }
                collection.insertOne(listing, function(err, res) {
                    if (err) reject(err)
                    resolve(res.acknowledged)
                })
            } catch (err) {
                reject(err)
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
        const collection = db.collection('comment')
        return new Promise(function (resolve, reject) {
            try {
                comment = new Comment(elem)
                collection.insertOne(comment, function(err, res) {
                    if (err) reject(err)
                    resolve(res.acknowledged)
                })
            } catch (err) {
                reject(err)
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
        const bidirection = peer1 !== peer2 ? { $or: [forward, backward] } : whenAuthor
        const query = { $and: [bidirection, { thread: thread }] }
        return await db.collection('comment').find(query).sort({ sent: -1 }).toArray()
    }

    /**
    * Get the comment from DB
    * @param {string} peer1 email of sender or reciever
    * @param {string} peer2 email of sender or reciever
    * @param {string} thread id of the thread where a message was sent/recieved
    * @return {Promise}
    */
    this.getCommentById = async function (id) {
        const collection = db.collection('listing')
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
            collection.findOne(query, { projection: projection })
                .then((doc) => {
                    resolve([doc.from, doc.to])
                })
        })
    }


    const baseQuery = { d: false, a: true }
    const baseProjection = { pass: 0.0, geolocation: 0.0, d: 0.0, a: 0.0 }
    const baseSort = [['_id', 'desc']]
    const baseCollation = { }
    /**
   * Get a document from DB
   * If Admin then get unnaproved document
   * @param {String} id Id of a Listing
   * @param {Boolean} isAdmin if the caller is admin
   * @return {Promise}
   */
    this.getDocumentById = async function (id, isAdmin, viewer) {
        const collection = db.collection('listing')
        // const query = isAdmin ? { a: false } : JSON.parse(JSON.stringify(baseQuery))
        const query = {}
        const projection = { pass: 0.0, geolocation: 0.0 }
        return new Promise(function (resolve, reject) {
            try {
                new ObjectId(id)
            } catch (err) {
                return reject(err)
            }
            query._id = new ObjectId(id)
            collection.findOne(query, { projection: projection })
                .then((doc) => {
                    if (!doc) {
                        resolve()
                        return
                    }
                    // console.log(`viewer ${viewer}`)
                    // console.log(`admin ${isAdmin}`)
                    // console.log(doc)
                    const isAuthor = doc.usr === viewer
                    if (isAdmin || isAuthor || doc['a']) {
                        resolve(doc)
                    } else {
                        resolve()
                    }
                })
        })
    }

    /**
   * Get documents created since number of days
   * @param {*} days number of days since document was created
   * @param {*} section which section
   * @param {*} pagination number of pages and listings in each page
   * @return {Promise}
   */
    this.getDocumentsSince = async function (days, section, pagination) {
        const substring = 100
        const collection = db.collection('listing')
        const ObjectId = getObjectId(days)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        if (section) query.section = section
        return new Promise(function (resolve, reject) {
            collection.find(query)
                .project(baseProjection)
                .sort(baseSort)
                .skip((pagination.perPage * pagination.page) - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) {
                        return reject(err)
                    }
                    const count = await collection.countDocuments(query)
                    docs.forEach(doc => doc.desc = doc.desc.substring(0, substring))
                    return resolve({ documents: docs, count: count })
                })
        })
    }

    /**
   * Get documents created by a specific user
   * @param {*} user user email
   * @return {Promise}
   */
    this.getDocumentsByUser = async function (user) {
        const collection = db.collection('listing')
        const query = {}
        const projection = { pass: 0.0, geolocation: 0.0, /*d: 0.0, a: 0.0*/ }
        query.usr = user
        const tmp = await collection.find(query)
            .project(projection)
            .sort(baseSort)
            .toArray()
        tmp.forEach(l => {
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

        const collection = db.collection('users')
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
        const collection = db.collection('users')
        return new Promise(function (resolve, reject) {
            try {
                user = new User(elem)
                // delete user.password
                // TODO: remove pass again, but objectmodel restricts that :(
                collection.insertOne(user, function(err, res) {
                    if (err) reject(err)
                    resolve(res.acknowledged)
                })
            } catch (err) {
                reject(err)
            }
        })
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
    this.gwoogl = async function (phrase, exact, division, section, lang, pagination) {
        const daysBefore = 100
        const collection = db.collection('listing')
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
            collection.find(query, { score: { $meta: 'textScore' } })
                .collation(collation)
                .project(baseProjection)
                .sort({ score: { $meta: 'textScore' } })
                .skip((pagination.perPage * pagination.page) - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) {
                        return reject(err)
                    }
                    const count = await collection.countDocuments(query)
                    if(count > 3) {
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
    this.getDocumentsByTag = async function (tag, level, pagination) {
        const daysBefore = 100
        const collection = db.collection('listing')
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
            collection.find(query)
                .project(baseProjection)
                .sort(baseSort)
                .skip((pagination.perPage * pagination.page) - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) {
                        return reject(err)
                    }
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
    this.getDocumentsByDivision = async function (division, pagination) {
        const daysBefore = 100
        const collection = db.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        query.div = division
        return new Promise(function (resolve, reject) {
            collection.find(query)
                .project(baseProjection)
                .sort(baseSort)
                .skip((pagination.perPage * pagination.page) - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) {
                        return reject(err)
                    }
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
    this.getDocumentsByGeolocation = async function (latitude, longitude, section, pagination) {
        const daysBefore = 100
        const collection = db.collection('listing')
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        if (section) query.section = section
        query.geolocation = {
            $geoWithin: {
                $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], 10 / 3963.2] // 10 miles = 16.09344 kilometers
            }
        }
        return new Promise(function (resolve, reject) {
            collection.find(query)
                .project(baseProjection)
                .sort(baseSort)
                .skip((pagination.perPage * pagination.page) - pagination.perPage)
                .limit(pagination.perPage)
                .toArray(async function (err, docs) {
                    if (err) {
                        return reject(err)
                    }
                    const count = await collection.countDocuments(query)
                    return resolve({ documents: docs, count: count })
                })
        })
    }

    this.deactivateDocument = async function (password) {
        const collection = db.collection('listing')
        const query = JSON.parse(JSON.stringify(baseQuery))
        query.pass = password
        const newValues = { $set: { d: true } }
        const options = { upsert: false }
        return new Promise(function (resolve, reject) {
            collection.findOneAndUpdate(query, newValues, options, function (err, res) {
                if (err) reject(err)
                if (res.lastErrorObject.n === 0) {
                    reject(new Error('document to be deactivated not found'))
                }
                resolve(res._id)
            })
        })
    }

    this.approveDocument = async function (id) {
        const collection = db.collection('listing')
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = new ObjectId(id)
        query.a = false
        const newValues = { $set: { a: true } }
        const options = { upsert: false }
        return new Promise(function (resolve, reject) {
            collection.findOneAndUpdate(query, newValues, options, function (err, res) {
                if (err) reject(err)
                if (res.lastErrorObject.n === 0) {
                    reject(new Error('document to be approved not found'))
                }
                resolve(res._id)
            })
        })
    }

    this.reactivateDocument = async function (password) {
        const collection = db.collection('listing')
        const query = JSON.parse(JSON.stringify(baseQuery))
        query.pass = password
        query.d = true
        const newValues = { $set: { d: false } }
        const options = { upsert: false }
        return new Promise(function (resolve, reject) {
            collection.findOneAndUpdate(query, newValues, options, function (err, res) {
                if (err) reject(err)
                if (res.lastErrorObject.n === 0) {
                    reject(new Error('document to be reactivated not found'))
                }
                resolve(res._id)
            })
        })
    }

    this.autocomplete = async function (keyword) {
        const collection = db.collection('words')
        const keywRgx = new RegExp('^' + keyword, 'i')
        return await collection.find({ _id: keywRgx }).project({ _id: 1 }).toArray()
    }

    this.getDocumentsByKeyword = async function (keyword, pagination) {
        const collection = db.collection('words')
        return new Promise(function (resolve, reject) {
            collection.findOne({ _id: keyword }, function (err, result) {
                if (err) {
                    reject(err)
                }
                if (result) {
                    const objIds = result.docs
                    if (objIds.length == 0) {
                        return resolve({ documents: [], count: 0 })
                    }
                    db.collection('listing').find({ _id: { $in: objIds } })
                        .project(baseProjection)
                        .sort(baseSort)
                        .skip((pagination.perPage * pagination.page) - pagination.perPage)
                        .limit(pagination.perPage)
                        .toArray(
                            async function (err, docs) {
                                if (err) {
                                    reject(err)
                                }
                                const count = await collection.countDocuments({ _id: { $in: objIds } })
                                return resolve({ documents: docs, count: count })
                            })
                } else {
                    resolve({ documents: [], count: 0 })
                }
            })
        })
    }

    // { _id: { tags: 'qui', section: 'blogs' }, count: 11 }
    // { _id: { tags: 'voluptatem', section: 'skills' }, count: 8 }
    // { _id: { tags: 'rerum', section: 'skills' }, count: 8 }
    const reformat = (aa) => {
        let res = {}
        let sections = [...new Set(aa.map(a => a._id.section))]
        let section
        while ((section = sections.pop()) !== undefined) {
            res[section] = aa.filter(z => z._id.section === section)
                .map(l => { return { count: l.count, tag: l._id.tags } })
        }
        return res
    }

    class EphemeralData {
        constructor(ttl) {
            this.ttl = ttl;
            this.lastSeen = Infinity;
            this.data = undefined
        }
        reset() {
            this.lastSeen = Date.now()
        }
        isSame() {
            return (this.data && (Date.now() - this.lastSeen) < this.ttl)
        }
    }

    // 5 minutes
    let topTags = new EphemeralData(300000)
    this.topTags = async function () {
        if (topTags.isSame()) {
            return reformat(topTags.data)
        }
        topTags.reset()
        const collection = db.collection('listing')
        const pipeline = [
            { $unwind: "$tags" },
            // by section
            {
                $group: {
                    "_id": { tags: "$tags", section: "$section" },
                    "count": { "$sum": 1 }
                }
            },
            // { $group: { "_id": "$tags", "count": { "$sum": 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
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
        const collection = db.collection('listing')
        const pipeline = [
            // { $match: { section: section } },
            { $group: { _id: "$div", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]
        const tmp = await collection.aggregate(pipeline).toArray()
        topByDiv.data = tmp.map(a => { return { tag: a._id, count: a.count } })
        return topByDiv.data
    }

    let topByParentTag = new EphemeralData(300000)
    // 5 minutes
    this.topByParentTag = async function () {
        if (topByParentTag.isSame()) {
            return topByParentTag.data
        }
        topByParentTag.reset()
        const collection = db.collection('listing')
        const pipeline = [
            // { $match: { section: section } },
            { $group: { _id: "$parent", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]
        const tmp = await collection.aggregate(pipeline).toArray()
        topByParentTag.data = tmp.map(a => { return { tag: a._id, count: a.count } })
        return topByParentTag.data
    }

    let topByGranpaTag = new EphemeralData(300000)
    // 5 minutes
    this.topByGranpaTag = async function () {
        if (topByGranpaTag.isSame()) {
            return topByGranpaTag.data
        }
        topByGranpaTag.reset()
        const collection = db.collection('listing')
        const pipeline = [
            // { $match: { section: section } },
            { $group: { _id: "$granpa", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]
        const tmp = await collection.aggregate(pipeline).toArray()
        topByGranpaTag.data = tmp.map(a => { return { tag: a._id, count: a.count } })
        return topByGranpaTag.data
    }

    /**
    * Get documents for approval or general review
    * When admin doing approval, we only need not yet approved listings
    * When he/she is not, he/she is still doing moderation on all items
    * @param {*} elem a JSON representation of a Listing
    * @return {Promise}
    */
    this.getDocumentsForModeration = async function (approving) {
        const collection = db.collection('listing')
        const query = approving ? { a: false } : {}
        const projection = {
            pass: 0.0,
            geolocation: 0.0,
            // ...(!approving && {d: 0.0, a: 0.0,}),
            lat: 0.0,
            lng: 0.0,
            ara: 0.0,
            div: 0.0
        }
        // TODO: find a solution to limit number of docs not to block UI
        const limit = approving ? 0 : 200
        return new Promise(function (resolve, reject) {
            collection.find(query)
                .project(projection)
                .sort(baseSort)
                .limit(limit)
                .toArray(async function (err, docs) {
                    if (err) {
                        return reject(err)
                    }
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
    this.updateDocument = async function (elem) {
        const result = await db.collection('listing').updateOne(
            { _id: ObjectId(elem._id) },
            { $set: elem },
            { upsert: false }
        )
        return result
    }

    /**
    * Remove a document in DB
    * @param {*} id An ID of a Listing
    * @return {Promise}
    */
    this.removeDocument = async function (id) {
        const result = await db.collection('listing').deleteOne(
            { _id: ObjectId(id) },
        )
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
