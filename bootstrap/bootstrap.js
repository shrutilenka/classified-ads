import { faker as fakerAr } from '@faker-js/faker/locale/ar'
import { faker as fakerEn } from '@faker-js/faker/locale/en'
import { faker as fakerFr } from '@faker-js/faker/locale/fr'
import { config as dotenv } from 'dotenv'
import fs from 'fs'
import jsf from 'json-schema-faker'
import { MongoClient } from 'mongodb'
import path from 'path'
import request from 'request'
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler'
import { fileURLToPath } from 'url'
import { getStateNames } from '../data/geo/geoJSONEncoder.js'
import { refreshTopK } from '../libs/services/miner.js'
/*********************************************************************************************** */
// REGISTER REGULAR JOBS
import scripts from '../libs/services/mongo-jobs.js'
import { schema } from './schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv()

var jsf_en, jsf_fr, jsf_ar
jsf_en = jsf_fr = jsf_ar = jsf

jsf_en.extend('faker', () => fakerEn)
jsf_fr.extend('faker', () => fakerFr)
jsf_ar.extend('faker', () => fakerAr)

/*********************************************************************************************** */
// FAKE DEVELOPMENT ENVIRONMENTS DATA
// ONLY FOR CURRENT CONFIGURATION OF CLASSIFIED-ADS (THREE SECTION, THREE LANGUAGES ...)
const states = {
    en: getStateNames('en'),
    fr: getStateNames('fr'),
    ar: getStateNames('ar'),
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
const langs = ['en', 'ar', 'fr', 'fr', 'fr', 'fr']
const langsFaker = {
    en: { jsf: jsf_en, words: (n) => getWords(english, n) },
    fr: { jsf: jsf_fr, words: (n) => getWords(french, n) },
    ar: { jsf: jsf_ar, words: (n) => getWords(arabic, n) },
}
const sections = ['donations', 'skills', 'blogs', 'events', 'hobbies']

let items = []

// https://github.com/sandstrom/country-bounding-boxes/blob/master/bounding-boxes.json
// Approximate algeria bounding box:
// DZA 	Algeria 	18.968147 	37.2962055 	-8.668908 	11.997337
// const minLng = -8.668908
// const maxLng = 11.997337
// const minLat = 18.968147
// const maxLat = 37.2962055

// Approximate france bounding box: 41.2632185 	51.268318 	-5.4534286 	9.8678344
const minLng = -5.4534286
const maxLng = 9.8678344
const minLat = 41.2632185
const maxLat = 51.268318
/** */
function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1
}

function fakeItems(docsCount) {
    for (let i = 0; i < docsCount; i++) {
        const randomLang = langs[Math.floor(Math.random() * langs.length)]
        const item = langsFaker[randomLang].jsf.generate(schema)
        item.tagsLang = item.lang = randomLang
        item.title = langsFaker[randomLang].words(5 + Math.floor(Math.random() * 10)) //.slice(0, 100)
        item.desc = langsFaker[randomLang].words(10 + Math.floor(Math.random() * 30)) //.slice(5000)
        item.cdesc = item.desc
        item.tags = [langsFaker[randomLang].words(1), langsFaker[randomLang].words(1), langsFaker[randomLang].words(1)]
        item.div = states[randomLang][Math.floor(Math.random() * states[randomLang].length)]
        item.section = sections[Math.floor(Math.random() * sections.length)]
        item.offer = Math.random() < 0.5
        item.lat = getRandomInRange(minLat, maxLat, 3)
        item.lng = getRandomInRange(minLng, maxLng, 3)
        item.geolocation = {
            type: 'Point',
            coordinates: [item.lng, item.lat],
        }
        let email
        if (i < 10) {
            email = process.env.ADMIN_EMAIL
            item.d = false
            item.a = true
        }
        if (i < 20 && i >= 10) {
            email = process.env.ADMIN_EMAIL2
            item.d = false
            item.a = true
        }
        item.usr = email || item.usr
        items.push(item)
    }
}

/*********************************************************************************************** */
// OPERATION TO SAFELY BOOTSTRAP ENVIRONMENTS
// PRESENCE OF DATABASES, COLLECTIONS, SETTING INDEXES
const ops = {}
ops.checkEnvironmentData = async function checkEnvironmentData(url) {
    // console.log({ level: 'info', message: 'Checking environment data' })
    const client = await MongoClient.connect(url)
    // Use the admin database for the operation
    if (!client) throw new Error(`Check if MongoDB server is up`)
    let adminDb = client.db().admin()
    // List all the available databases
    const dbs = await adminDb.listDatabases()
    const databases = dbs.databases.map((n) => n.name)
    const dbName = 'listings_db'
    const checkDBs = databases.indexOf(dbName) >= 0
    if (!checkDBs) {
        throw new Error('Not all databases are present.')
    }
    const db = client.db(dbName)
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((n) => n.name)
    // console.log(`discovered collections ${JSON.stringify(collectionNames)}`)
    const checkColls =
        collectionNames.indexOf('words') >= 0 &&
        collectionNames.indexOf('listing') >= 0 &&
        collectionNames.indexOf('users') >= 0 &&
        collectionNames.indexOf('userstemp') >= 0 &&
        collectionNames.indexOf('comment') >= 0
    if (!checkColls) {
        throw new Error('Not all collections are present.')
    }
    // client.close()
    // console.log({ level: 'info', message: 'Environment data seem to be fine' })
}

ops.createIndexes = async function createIndexes(db) {
    const listingCollection = db.collection('listing')
    await listingCollection.dropIndexes()
    await listingCollection.createIndex({ title: 'text', cdesc: 'text' }, { weights: { title: 3, cdesc: 1 } })
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
    await tmpUsersCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 10, unique: true })
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
// TODO: remove 'production' not to confuse
const docsCount = {
    api: 500,
    localhost: 10000,
    production: 10000,
}[process.env.NODE_ENV]
ops.seedDevelopmentData = async function seedDevelopmentData(db) {
    fakeItems(docsCount)
    const options = { ordered: true }
    const collection = db.collection('listing')
    return await collection.insertMany(items, options)
}

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
    const fileSyncEn = fs.readFileSync(path.join(__dirname, taxonomyPathEn)).toString()
    const fileContentEn = fileSyncEn.replace(',', '_').split('\n').filter(Boolean)

    const googleTagsEn = [
        ...new Set(
            load(fileContentEn).filter((arr) => arr.length == 3 && arr[2].length < 30),
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
// const logRequest = (response, app) => {
//     app.log.info('status code: ', response.statusCode)
//     app.log.info('body: ', response.body)
// }
ops.fastifyInjects = async function fastifyInjects(app) {
    console.log('Injecting Fastify requests')
    // Fastify inject doesn't work anymore for some reason !
    // let response = await app.inject({
    //     method: 'POST',
    //     url: '/signup',
    //     remoteAddress: '0.0.0.0',
    //     payload: {
    //     username: process.env.ADMIN_EMAIL2,
    //     password: process.env.ADMIN_PASS,
    //     },
    // })
    // logRequest(response, app)
    // response = await app.inject({
    //     method: 'POST',
    //     url: '/signup',
    //     remoteAddress: '0.0.0.0',
    //     payload: {
    //         username: process.env.ADMIN_EMAIL2,
    //         password: process.env.ADMIN_PASS,
    //     },
    // })
    // logRequest(response, app)
    const post = (email, password) =>
        request(
            {
                method: 'POST',
                url: 'http://0.0.0.0:' + app.server.address().port + '/signup',
                form: {
                    username: email,
                    password: password,
                    firstName: email,
                    secondName: email
                },
            },
            (err, response, body) => {
                if (err) console.error(err)
                console.log(response.statusCode)
                if (process.env.NODE_ENV === -1) console.log(JSON.parse(body))
            },
        )
    post(process.env.ADMIN_EMAIL, process.env.ADMIN_PASS)
    post(process.env.ADMIN_EMAIL2, process.env.ADMIN_PASS)
}

ops.registerPipelines = function registerPipelines(db, scheduler, seconds) {
    const QInstance = new scripts(db)
    const task = new AsyncTask(
        'Refreshing top words across all listings',
        async () => {
            try {
                const result_1 = await QInstance.refreshKeywords()
            } catch (err) {
                console.log(err)
            }
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

export default ops
