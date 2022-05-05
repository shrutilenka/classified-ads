const path = require('path')

const enFilePath = path.join(__dirname, './wiki.multi.en.vec')
// const arFilePath = path.join(__dirname, './wiki.multi.ar.vec')
// const frFilePath = path.join(__dirname, './wiki.multi.fr.vec')

const Annoy = require('annoy.js').default;

// USING ANNOY TO QUERY K APPROXIMATE NEAREST NEIGHBORS

// 0. Define Annoy constants
const FOREST_SIZE = 10;
const MAX_LEAF_SIZE = 50;
const VECTOR_LEN = 300;


if (typeof String.prototype.trim === 'undefined') {
    String.prototype.trim = function () {
        return String(this).replace(/^\s+|\s+$/g, '')
    }
}
function flip(obj) {
    return Object.keys(obj).reduce((ret, key) => {
        ret[obj[key]] = key
        return ret
    }, {})
}

const LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(enFilePath)

lr.on('error', function (err) {
    console.log(err)
})

let embedding = []
let word2id = {}
let id2word
let i = 0
let nmax = 50000
let step = 0
const isWordValid = (word) => (word.indexOf('/') < 0 && word.length >= 3) || true
lr.on('line', function (line) {
    lr.pause()
    let lineArray = line.trim().split(' ')
    let word = lineArray[0]
    if(isWordValid(word)) {
        const vector = lineArray.slice(1).map(Number)
        if (vector.length === VECTOR_LEN) {
            word2id[word] = i++
            embedding.push(vector)
        }
    }
    if (i === nmax) {
        console.log('now done')
        lr.close()
    }
    lr.resume()
})

lr.on('end', function () {
    console.log('source finished')
    id2word = flip(word2id)
    console.log('and then' + step)
    if (step++ === 1) {
        console.log('finished reading files')
        step = 0
        buildAnnoy(embedding)
    }
})



function buildAnnoy(embedding) {
    console.log('building annoy from embedding')
    console.log('embedding is like')
    console.log(`with:${embedding.length} elements`)
    // 1. Init Annoy with constants
    const annoy = new Annoy(FOREST_SIZE, VECTOR_LEN, MAX_LEAF_SIZE);
    console.log('starting loop')
    for (let i = 0; i < nmax; i += 1) {
        const vector = embedding[i]
        const dp = {
            // Include a 'vector' property
            vector,
            // Add random data to the 'data' property
            data: i,
        };
        annoy.add(dp);
    }
    
    // 1. Serialize to json
    const asJson = annoy.toJson();


}


// // 2. Deserialize back to an Annoy instance
// const asJsonStr = JSON.stringify(asJson);
// const rebuiltTree = new Annoy(FOREST_SIZE, VECTOR_LEN, MAX_LEAF_SIZE);
// console.time('Rebuilt Annoy fromJson');
// rebuiltTree.fromJson(asJsonStr);
// console.timeEnd('Rebuilt Annoy fromJson');

// // 3. Get KNN from rebuilt Annoy
// console.time('Rebuilt Annoy KNN');
// const rebuiltKnn = annoy.get(p, K);
// console.timeEnd('Rebuilt Annoy KNN');