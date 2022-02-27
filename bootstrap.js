const jsf = require('json-schema-faker')
const { MongoClient } = require('mongodb')
const { schema } = require('./config/options/bootstrap')
const { SimpleIntervalJob, AsyncTask } = require('toad-scheduler')
const geoJSONEncoder = require('./data/geo/geoJSONEncoder')

const states = geoJSONEncoder.getStateNames('en')

const langs = ['english', 'arabic', 'french']
const sections = ['donations', 'skills', 'blogs']

// jsf.extend('faker', () => require('faker'))
const items = []
// Approximate algeria bounding box:
const minLng = -0.19775390625
const maxLng = 7.492675781249999
const minLat = 29.630771207229
const maxLat = 35.782170703266075

// Approximate USA bounding box:
// const minLng = -124.0500001
// const maxLng = -67.100001
// const minLat = 30.7800001
// const maxLat = 47.9000001
/** */
function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1
}

for (let i = 0; i < 200; i++) {
    let email
    if (i < 10) {
        email = 'user2@mail.com'
    }
    if (i < 20 && i > 10) {
        email = 'user@mail.com'
    }
    const item = jsf.generate(schema)
    item.img = 'https://live.staticflickr.com/3938/15615468856_92275201d5_b.jpg'
    item.div = states[Math.floor(Math.random() * states.length)]
    item.tagsLang = langs[Math.floor(Math.random() * langs.length)]
    item.section = sections[Math.floor(Math.random() * sections.length)]
    item.lat = getRandomInRange(minLat, maxLat, 3)
    item.lng = getRandomInRange(minLng, maxLng, 3)
    item.geolocation = {
        type: 'Point',
        coordinates: [item.lng, item.lat]
    }
    item.usr = email ? email : item.usr
    items.push(item)
}

const ops = {}

ops.checkEnvironmentData = async function checkEnvironmentData(url) {
    // console.log({ level: 'info', message: 'Checking environment data' })
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, async function (err, client) {
            // Use the admin database for the operation
            if (!client) reject(new Error(`Check if MongoDB server is up`))
            let adminDb = await client.db('local').admin()
            // List all the available databases
            adminDb.listDatabases(async function (err, dbs) {
                const databases = dbs.databases.map((n) => n.name)
                const dbName = process.env.NODE_ENV === 'development'
                    ? 'listings_db_dev'
                    : 'listings_db'
                const check = databases.indexOf(dbName) >= 0
                if (!check) {
                    reject(new Error('Not all databases are present.'))
                }
                await client.connect(async function (err) {
                    const db = client.db(dbName)
                    db.listCollections().toArray(function (err, collections) {
                        const collectionNames = collections.map((n) => n.name)
                        const check = (
                            collectionNames.indexOf('words') >= 0 &&
                            collectionNames.indexOf('listing') >= 0 &&
                            collectionNames.indexOf('comment') >= 0
                        )
                        if (!check) {
                            reject(new Error('Not all collections are present.'))
                        }
                    })
                })
                client.close()
                // console.log({ level: 'info', message: 'Environment data seem to be fine' })
                resolve()
            })
        })
    })
}



ops.seedDevelopmenetData = async function seedDevelopmenetData(db) {
    const options = { ordered: true }
    const collection = db.collection('listing')
    return new Promise(function (resolve, reject) {
        collection.insertMany(items, options, async function (err, reply) {
            // fastify.log.info('Inserted seed data into the collection')
            if (err) {
                return reject(err)
            }
            // const mails = await ops.seedMailHogData(db)
            // await ops.seedCommunity(mails.emails)
            return resolve(reply)
        })
    })
}

const logRequest = (response, app) => {
    app.log.info('status code: ', response.statusCode)
    app.log.info('body: ', response.body)
}
ops.fastifyInjects = async function fastifyInjects(app) {
    let response = await app.inject({
        method: 'POST',
        url: '/signup',
        payload: {
            username: "user2@mail.com",
            password: "blablabla111SSS."
        }
    })
    logRequest(response, app)
    response = await app.inject({
        method: 'POST',
        url: '/signup',
        payload: {
            username: "user@mail.com",
            password: "blablabla111SSS."
        }
    })
    logRequest(response, app)
    response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
            username: "user@mail.com",
            password: "blablabla111SSS."
        }
    })
    logRequest(response, app)
}

ops.createIndexes = async function createIndexes(db) {
    const listingCollection = db.collection('listing')
    await listingCollection.createIndex(
        { title: 'text', desc: 'text' },
        { weights: { title: 3, desc: 1 } }
    )
    await listingCollection.createIndex({ tags: 1 })
    await listingCollection.createIndex({ div: 1 })
    await listingCollection.createIndex({ geolocation: '2dsphere' })
    const userCollection = db.collection('user')
    await userCollection.createIndex({ to: 1, sent: 1 })
}
const scripts = require('./libs/services/mongoScripts')
ops.registerPipelines = function registerPipelines(db, scheduler, seconds) {
    const QInstance = new scripts(db)
    const task = new AsyncTask(
        'simple task',
        () => {
            return QInstance.refreshKeywords().then((result) => {
                // result is an empty cursor
            }).catch((err) => {
                console.log(err)
            })
        },
        (err) => {
            console.log(err)
        }
    )
    const job = new SimpleIntervalJob({
        seconds: seconds,
    }, task)
    scheduler.addSimpleIntervalJob(job)
}

const fs = require('fs')
const path = require('path')
const { refreshTopK, topk } = require('./libs/services/miner')
ops.famousSearches = function famousSearches() {
    const splitBy = (sep) => (str) =>
        str.split(sep).map((x) => x.trim())
    const splitLine = splitBy('-')
    const splitCategories = splitBy('>')
    const load = (lines) =>
        [lines]
            .map((lines) => lines.map(splitLine))
            .map((lines) => lines.map(([id, cats]) => splitCategories(cats)))
            .pop()

    const taxonomyPathEn = './data/taxonomy/taxonomy-with-ids.en-US.txt'
    const fileSyncEn = fs.readFileSync(path.join(__dirname, taxonomyPathEn)).toString()
    const fileContentEn = fileSyncEn.replace(',', '_').split('\n').filter(Boolean)

    const googleTagsEn = [...new Set(
        load(fileContentEn)
            .filter((arr) => arr.length == 3 && arr[2].length < 30), (x) => x.join('')
    )].map(arr => arr[1]).slice(1, 200)
    googleTagsEn.forEach(search => {
        refreshTopK(search)
    });
    // for (let item of topk.values()) {
    //     console.log(
    //         `Item "${item.value}" is in position ${item.rank} with an estimated frequency of ${item.frequency}`
    //     )
    // }
}

module.exports.ops = ops