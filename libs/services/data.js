// Reads data from disk into memory
const config = require('config')
const fs = require('fs')
const path = require('path')
const parse = require('csv').parse

const give = {}
const TAG_SIZE = config.get('TAG_SIZE')
const artsPath = path.join(__dirname, '../../data/raw/arts/')
give.SVGs = fs
    .readdirSync(artsPath, (err, files) => files.filter((e) => path.extname(e).toLowerCase() === '.svg'))
    .map((p) => path.join(__dirname, '../../data/raw/arts/' + p))
    .map((p) => fs.readFileSync(p, 'utf-8'))

const taxonomyPathEn = '../../data/taxonomy/taxonomy-with-ids.en-US.txt'
const fileSyncEn = fs.readFileSync(path.join(__dirname, taxonomyPathEn)).toString()
const fileContentEn = fileSyncEn.replace(',', '_').split('\n').filter(Boolean)

const taxonomyPathAr = '../../data/taxonomy/taxonomy-with-ids.ar-SA.txt'
const fileSyncAr = fs.readFileSync(path.join(__dirname, taxonomyPathAr)).toString()
const fileContentAr = fileSyncAr.replace(',', '_').split('\n').filter(Boolean)

const taxonomyPathFr = '../../data/taxonomy/taxonomy-with-ids.fr-FR.txt'
const fileSyncFr = fs.readFileSync(path.join(__dirname, taxonomyPathFr)).toString()
const fileContentFr = fileSyncFr.replace(',', '_').split('\n').filter(Boolean)

const splitBy = (sep) => (str) => str.split(sep).map((x) => x.trim())
const splitLine = splitBy('-')
const splitCategories = splitBy('>')

const load = (lines) =>
    // put all lines into a "container"
    // we want to process all lines all the time as opposed to each line individually
    [lines]
        // separate id and categories
        // e.g ['3237', 'Animals & Pet Supplies > Live Animals']
        .map((lines) => lines.map(splitLine))
        // split categories and put id last
        // e.g. ['Animals & Pet Supplies', 'Live Animals', 3237]
        .map((lines) => lines.map(([id, cats]) => splitCategories(cats)))
        .pop()

give.googleTagsEn = [
    ...new Set(
        load(fileContentEn).filter((arr) => arr.length == 3 && arr[2].length < TAG_SIZE),
        (x) => x.join(''),
    ),
]
give.googleTagsEnLite = give.googleTagsEn.map((elem) => elem[2])

give.googleTagsAr = [
    ...new Set(
        load(fileContentAr).filter((arr) => arr.length == 3 && arr[2].length < TAG_SIZE),
        (x) => x.join(''),
    ),
]
give.googleTagsArLite = give.googleTagsAr.map((elem) => elem[2])

give.googleTagsFr = [
    ...new Set(
        load(fileContentFr).filter((arr) => arr.length == 3 && arr[2].length < TAG_SIZE),
        (x) => x.join(''),
    ),
]
give.googleTagsFrLite = give.googleTagsFr.map((elem) => elem[2])

give.ESCOTagsFr = []
give.ESCOTagsEn = []
give.ESCOTagsAr = []
const getTags = (path_, arr) =>
    fs
        .createReadStream(path.join(__dirname, path_))
        .pipe(parse({ columns: true }))
        .on('data', function (row) {
            const preferredLabel = row.preferredLabel
            const masculine = preferredLabel.split('/')[0]
            const feminine = preferredLabel.split('/')[1]
            arr.push({ masculine: masculine, feminine: feminine })
        })
getTags('../../data/taxonomy/occupations_fr.csv', give.ESCOTagsFr)
getTags('../../data/taxonomy/occupations_ar.csv', give.ESCOTagsAr)
getTags('../../data/taxonomy/occupations_en.csv', give.ESCOTagsEn)

// CPTALL DATA

/** broadMatch to omit
 * 02000000  Police et justice
 * 03000000 Désastres et accidents
 * 04000000 Economie et finance
 * 07000000 Santé
 * 09000000 Travail
 * 11000000 Politique
 * 12000000 Religion
 * 13000000 Science
 * 14000000 Société (concepts)
 * 16000000 Conflit, guerre et paix
 * 17000000 météo
 *
 */
const toKeep = ['01000000', '05000000', '06000000', '08000000', '10000000', '15000000']
const toKeep_ = (s) => toKeep.some((mediatopic) => s.indexOf(mediatopic) >= 0)
give.cptallTagsEn = require('../../data/taxonomy/cptall-en-US.json')
    .conceptSet.filter((o) => toKeep_(o.uri) || (o.broader && toKeep_(o.broader.join(''))))
    .map((o) => o.prefLabel['en-US'])
give.cptallTagsFr = require('../../data/taxonomy/cptall-fr.json')
    .conceptSet.filter((o) => toKeep_(o.uri) || (o.broader && toKeep_(o.broader.join(''))))
    .map((o) => o.prefLabel['fr'])
give.cptallTagsAr = require('../../data/taxonomy/cptall-ar.json')
    .conceptSet.filter((o) => toKeep_(o.uri) || (o.broader && toKeep_(o.broader.join(''))))
    .map((o) => o.prefLabel['ar'])

// const pipeline = chain([
//     fs.createReadStream(path.join(__dirname, taxonomyPathEn)),
//     pick.withParser({ filter: 'conceptSet' }),
//     streamValues(),
//     ignore({ filter: /\b_meta\b/i }),
//     (data) => {
//         const values = data.value
//         let stacked = []
//         values.forEach((val) => {
//             const { prefLabel, definition } = val
//             stacked.push({ prefLabel, definition })
//         })
//         return stacked
//     },
// ])

// let counter = 0
// pipeline.on('data', (data) => {
//     ++counter
//     console.log(data)
// })

// pipeline.on('end', () => console.log(`The media data has ${counter} types.`))

// const handler = {
//     get(target, property) {
//     // fastify.log.info(`Raw data ${property} loaded`)
//         return target[property];
//     }
// }
// Wrapping give object breaks some IDR links but,,,
// module.exports.give = new Proxy(give, handler);
module.exports = { give }
