const fs = require('fs')
const path = require('path')

var jsf_en, jsf_fr, jsf_ar
jsf_en = jsf_fr = jsf_ar = require('json-schema-faker')

jsf_en.extend('faker', () => require('@faker-js/faker/locale/en'))
jsf_fr.extend('faker', () => require('@faker-js/faker/locale/fr'))
jsf_ar.extend('faker', () => require('@faker-js/faker/locale/ar'))

const { MongoClient } = require('mongodb')
const { schema } = require('../config/options/bootstrap')
const { SimpleIntervalJob, AsyncTask } = require('toad-scheduler')
const geoJSONEncoder = require('../data/geo/geoJSONEncoder')

/*********************************************************************************************** */
// FAKE DEVELOPMENT ENVIRONMENTS DATA
// ONLY FOR CURRENT CONFIGURATION OF CLASSIFIED-ADS (THREE SECTION, THREE LANGUAGES ...)
const states = {
    en: geoJSONEncoder.getStateNames('en'),
    fr: geoJSONEncoder.getStateNames('fr'),
    ar: geoJSONEncoder.getStateNames('ar'),
}
const readDictionary = (lang) =>
    fs
        .readFileSync(path.resolve(__dirname, `../data/raw/${lang}.txt`))
        .toString()
        .split('\n')
const french = readDictionary('fr')
const arabic = readDictionary('ar')
const english = readDictionary('en')

const getWords = (dic, n) => {
    const word = () => dic[Math.floor(Math.random() * dic.length)]
    let res = ''
    for (let i = 0; i < n; i++) res += ` ${word()}`
    return res.substring(1)
}
const langs = ['en', 'ar', 'fr']
const langsFaker = {
    en: { jsf: jsf_en, words: (n) => getWords(english, n) },
    fr: { jsf: jsf_fr, words: (n) => getWords(french, n) },
    ar: { jsf: jsf_ar, words: (n) => getWords(arabic, n) },
}
const sections = ['donations', 'skills', 'blogs', 'events']

const items = []
// Approximate algeria bounding box:
const minLng = -0.19775390625
const maxLng = 7.492675781249999
const minLat = 29.630771207229
const maxLat = 35.782170703266075
// -7.646484,20.138470,11.469727,36.826875
// Approximate USA bounding box:
// const minLng = -124.0500001
// const maxLng = -67.100001
// const minLat = 30.7800001
// const maxLat = 47.9000001
/** */
function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1
}

for (let i = 0; i < 10000; i++) {
    let email
    if (i < 10) {
        email = 'bacloud14@gmail.com'
    }
    if (i < 20 && i > 10) {
        email = 'sracer2016@yahoo.com'
    }
    const randomLang = langs[Math.floor(Math.random() * langs.length)]
    const item = langsFaker[randomLang].jsf.generate(schema)
    item.tagsLang = item.lang = randomLang
    item.title = langsFaker[randomLang].words(
        5 + Math.floor(Math.random() * 10),
    )
    item.desc = langsFaker[randomLang].words(
        10 + Math.floor(Math.random() * 30),
    )
    item.tags = [
        langsFaker[randomLang].words(1),
        langsFaker[randomLang].words(1),
        langsFaker[randomLang].words(1),
    ]
    item.img = 'https://live.staticflickr.com/3938/15615468856_92275201d5_b.jpg'
    item.div =
        states[randomLang][
            Math.floor(Math.random() * states[randomLang].length)
        ]
    item.section = sections[Math.floor(Math.random() * sections.length)]
    item.offer = Math.random() < 0.5
    item.lat = getRandomInRange(minLat, maxLat, 3)
    item.lng = getRandomInRange(minLng, maxLng, 3)
    item.geolocation = {
        type: 'Point',
        coordinates: [item.lng, item.lat],
    }
    item.usr = email || item.usr
    items.push(item)
}

/*********************************************************************************************** */
// OPERATION TO SAFELY BOOTSRAT ENVIRONMENTS
// PRESENCE OF DATABASES, COLLECTIONS, SETTING INDEXES
const ops = {}
ops.checkEnvironmentData = async function checkEnvironmentData(url) {
    // console.log({ level: 'info', message: 'Checking environment data' })
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, async function (err, client) {
            // Use the admin database for the operation
            if (!client) reject(new Error(`Check if MongoDB server is up`))
            let adminDb = client.db().admin()
            // List all the available databases
            adminDb.listDatabases(async function (err, dbs) {
                const databases = dbs.databases.map((n) => n.name)
                const dbName =
                    process.env.NODE_ENV === 'development'
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
                        const check =
                            collectionNames.indexOf('words') >= 0 &&
                            collectionNames.indexOf('listing') >= 0 &&
                            collectionNames.indexOf('users') >= 0 &&
                            collectionNames.indexOf('userstemp') >= 0 &&
                            collectionNames.indexOf('comment') >= 0
                        if (!check) {
                            reject(
                                new Error('Not all collections are present.'),
                            )
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

ops.createIndexes = async function createIndexes(db) {
    const listingCollection = db.collection('listing')
    await listingCollection.createIndex(
        { title: 'text', desc: 'text' },
        { weights: { title: 3, desc: 1 } },
    )
    // doesn't support indexing one key based on value
    // await listingCollection.createIndex(
    //     { lang: 'fr' },
    //     { collation: { locale: 'fr' } },
    // )
    // await listingCollection.createIndex(
    //     { lang: 'en' },
    //     { collation: { locale: 'en' } },
    // )
    // await listingCollection.createIndex(
    //     { lang: 'ar' },
    //     { collation: { locale: 'ar' } },
    // )
    await listingCollection.createIndex({ tags: 1 })
    await listingCollection.createIndex({ div: 1 })
    await listingCollection.createIndex({ geolocation: '2dsphere' })
    const commentCollection = db.collection('comment')
    await commentCollection.createIndex({ to: 1, from: 1, sent: 1 })
    const usersCollection = db.collection('users')
    const tmpUsersCollection = db.collection('userstemp')
    await usersCollection.createIndex({ username: 1 }, { unique: true })
    await tmpUsersCollection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 60 * 10, unique: true },
    )
    // TODO: change a standalone mongodb to a replica set
    // // open a Change Stream on the "listings" collection
    // let changeStream = listingCollection.watch()
    // // set up a listener when change events are emitted
    // changeStream.on("change", next => {
    //     // process any change event
    //     console.log("received a change to the collection: \t", next)
    // })
}

/*********************************************************************************************** */
// SEED DEVELOPMENT FAKE DATA
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

const { refreshTopK, topk } = require('../libs/services/miner')
ops.famousSearches = function famousSearches() {
    const splitBy = (sep) => (str) => str.split(sep).map((x) => x.trim())
    const splitLine = splitBy('-')
    const splitCategories = splitBy('>')
    const load = (lines) =>
        [lines]
            .map((lines) => lines.map(splitLine))
            .map((lines) => lines.map(([id, cats]) => splitCategories(cats)))
            .pop()

    const taxonomyPathEn = '../data/taxonomy/taxonomy-with-ids.en-US.txt'
    const fileSyncEn = fs
        .readFileSync(path.join(__dirname, taxonomyPathEn))
        .toString()
    const fileContentEn = fileSyncEn
        .replace(',', '_')
        .split('\n')
        .filter(Boolean)

    const googleTagsEn = [
        ...new Set(
            load(fileContentEn).filter(
                (arr) => arr.length == 3 && arr[2].length < 30,
            ),
            (x) => x.join(''),
        ),
    ]
        .map((arr) => arr[1])
        .slice(1, 200)
    googleTagsEn.forEach((search) => {
        refreshTopK(search)
    })
    // for (let item of topk.values()) {
    //     console.log(
    //         `Item "${item.value}" is in position ${item.rank} with an estimated frequency of ${item.frequency}`
    //     )
    // }
}
// INJECT ENDPOINTS TO TEST EVERYTHING IS FINE AND REGISTER NEW USERS
const logRequest = (response, app) => {
    app.log.info('status code: ', response.statusCode)
    app.log.info('body: ', response.body)
}
ops.fastifyInjects = async function fastifyInjects(app) {
    let response = await app.inject({
        method: 'POST',
        url: '/signup',
        payload: {
            username: 'bacloud14@gmail.com',
            password: 'blablabla111SSS.',
        },
    })
    logRequest(response, app)
    response = await app.inject({
        method: 'POST',
        url: '/signup',
        payload: {
            username: 'sracer2016@yahoo.com',
            password: 'blablabla111SSS.',
        },
    })
    logRequest(response, app)
}

/*********************************************************************************************** */
// REGISTER REGULAR JOBS
const scripts = require('../libs/services/mongo-jobs')
ops.registerPipelines = function registerPipelines(db, scheduler, seconds) {
    const QInstance = new scripts(db)
    const task = new AsyncTask(
        'Refereshing top words accross all listings',
        () => {
            return QInstance.refreshKeywords()
                .then((result) => {
                    // result is an empty cursor
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        (err) => {
            console.log(err)
        },
    )
    const job = new SimpleIntervalJob(
        {
            seconds: seconds,
        },
        task,
    )
    scheduler.addSimpleIntervalJob(job)
}

module.exports.ops = ops
