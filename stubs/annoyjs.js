// I WILL TRY TO CLEAN UP CODE !!!

const path = require('path')

const __filePath = path.join(__dirname, './wiki.multi.en.vec')
const filePath__ = path.join(__dirname, './wiki.multi.ar.vec')
const cachePath = path.join(__dirname, './cache.model')

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
    __lr = new LineByLineReader(__filePath),
    lr__ = new LineByLineReader(filePath__)

__lr.on('error', function (err) {
    console.log(err)
})
lr__.on('error', function (err) {
    console.log(err)
})

let __embedding = []
let embedding__ = []
let __word2id = {}
let word2id__ = {}
let i = 0
let j = 0
let nmax = 50000
let __id2word
let id2word__
let step = 0

__lr.on('line', function (line) {
    __lr.pause()
    let lineArray = line.trim().split(' ')
    let word = lineArray[0]
    const vector = lineArray.slice(1).map(Number)
    if (vector.length === VECTOR_LEN) {
        __word2id[word] = i++
        __embedding.push(vector)
    }
    if (i === nmax) {
        console.log('now done')
        __lr.close()
    }
    __lr.resume()
})

__lr.on('end', function () {
    console.log('source finished')
    __id2word = flip(__word2id)
    console.log('and then' + step)
    if (step++ === 1) {
        console.log('finished reading files')
        step = 0
        getNN('cat', __embedding, __word2id, embedding__, id2word__, 5)
    }
})

lr__.on('line', function (line) {
    lr__.pause()
    let lineArray = line.trim().split(' ')
    let word = lineArray[0]
    const vector = lineArray.slice(1).map(Number)
    if (vector.length === VECTOR_LEN) {
        word2id__[word] = j++
        embedding__.push(vector)
    }
    if (j === nmax) {
        console.log('now done')
        lr__.close()
    }
    lr__.resume()
})

lr__.on('end', function () {
    console.log('target finished')
    id2word__ = flip(word2id__)
    console.log('and then' + step)
    if (step++ === 1) {
        console.log('finished reading files')
        step = 0
        getNN('cat', __embedding, __word2id, embedding__, id2word__, 5)
    }
})

const Annoy = require('annoy.js').default;

// USING ANNOY TO QUERY K APPROXIMATE NEAREST NEIGHBORS

// 0. Define Annoy constants
const FOREST_SIZE = 10;
const MAX_LEAF_SIZE = 50;
const VECTOR_LEN = 300;

function buildAnnoy(embedding__) {
    console.log('building annoy from embedding')
    console.log('embedding is like')

    console.log(`with:${embedding__.length} elements`)
    // 1. Init Annoy with constants
    const annoy = new Annoy(FOREST_SIZE, VECTOR_LEN, MAX_LEAF_SIZE);
    console.log('starting loop')
    for (let i = 0; i < nmax; i += 1) {
        const vector = embedding__[i]
        const dp = {
            // Include a 'vector' property
            vector,
            // Add random data to the 'data' property
            data: i,
        };
        annoy.add(dp);
    }
    return annoy
}

function evaluate(annoy, vec, K = 3) {
    const knn = annoy.get(vec, K);
    return knn.map(res => res.data)
}

function getNN(word, __embedding, __word2id, embedding__, id2word__) {
    console.log(`Nearest neighbors of :${word}`)
    // console.log()
    // console.log(__word2id.slice(0,10))
    // console.log(__embedding.slice(0,1))
    // let vector = Float64Array.from(__embedding[__word2id[word]])
    const model = buildAnnoy(embedding__)
    console.log('simple input')
    console.log(word)
    const input = __embedding[__word2id[word]]
    // Query K Approximate Nearest Neighbors to a random point
    const indices = evaluate(model, input, 3)
    console.log(indices.map(idx => id2word__[idx]))
}