const { chain } = require('stream-chain')

const pick = require('stream-json/filters/Pick')
const { streamValues } = require('stream-json/streamers/StreamValues')

const { ignore } = require('stream-json/filters/Ignore')
const fs = require('fs')
const path = require('path')

const taxonomyPathEn = '../data/taxonomy/cptall-en-US.json'

const pipeline = chain([
    fs.createReadStream(path.join(__dirname, taxonomyPathEn)),
    pick.withParser({ filter: 'conceptSet' }),
    streamValues(),
    ignore({ filter: /\b_meta\b/i }),
    (data) => {
        const values = data.value
        let stacked = []
        values.forEach((val) => {
            const { prefLabel, definition } = val
            stacked.push({ prefLabel, definition })
        })
        return stacked
        // return value && value.department === 'accounting' ? data : null;
    },
])

let counter = 0
pipeline.on('data', (data) => {
    ++counter
    console.log(data)
})

pipeline.on('end', () => console.log(`The media data has ${counter} types.`))
