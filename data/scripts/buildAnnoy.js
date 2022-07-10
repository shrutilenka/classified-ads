// To be run on demand. Language by language
// ex: run node buildAnnoy.js en

// READ EMBEDDINGS

import Annoy from "annoy";
import fs from "fs";
import { createRequire } from 'module';
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url)

process.argv.shift()
process.argv.shift()
const enFilePath = path.join(__dirname, `../wiki.multi.${process.argv[0]}.vec`)
const enCachePath = path.join(__dirname, `../models/annoy.${process.argv[0]}.vec`)
const enid2wordPath = path.join(__dirname, `../models/id2word.${process.argv[0]}.json`)


function flip(obj) {
    return Object.keys(obj).reduce((ret, key) => {
        ret[obj[key]] = key
        return ret
    }, {})
}

const VECTOR_LEN = 300
let NMAX = 50000

const LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(enFilePath)

lr.on('error', function (err) {
    console.log(err)
})

let embedding = []
let word2id = {}
let id2word
let i = 0

const trim = (s) => s.replace(/^\s+|\s+$/g, '')
// TODO: remove latin words in Arabic embedding !!!
const isWordValid = (word) =>
    (word.indexOf('/') < 0 && word.length >= 3)
const downcast = (num) => Number(Number(num).toFixed(6))

lr.on('line', function (line) {
    lr.pause()
    let lineArray = trim(line).split(' ')
    let word = lineArray[0]
    if (isWordValid(word)) {
        const vector = lineArray
            .slice(1)
            .map(downcast)
        if (vector.length === VECTOR_LEN) {
            word2id[word] = i++
            embedding.push(vector)
        }
    }
    if (i === NMAX) {
        lr.close()
    }
    lr.resume()
})

lr.on('end', function () {
    console.log('source finished')
    id2word = flip(word2id)
    var annoy = new Annoy(VECTOR_LEN, 'Angular')
    for (let i = 0; i < NMAX; i += 1) {
        annoy.addItem(i, embedding[i])
    }
    annoy.build()
    annoy.save(enCachePath)
    let id2wordJson = JSON.stringify(id2word)
    fs.writeFileSync(enid2wordPath, id2wordJson)
})