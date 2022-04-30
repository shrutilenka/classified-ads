
const path = require('path')

const __filePath = path.join(__dirname,'./wiki.multi.en.vec')
const filePath__ = path.join(__dirname,'./wiki.multi.ar.vec')
const cachePath = path.join(__dirname,'./cache.model')

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '')
    }
}
function flip(obj) {
    return Object.keys(obj).reduce((ret, key) => {
        ret[obj[key]] = key;
        return ret;
    }, {});
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
let nmax = 1000
let __id2word
let  id2word__
let step = 0

__lr.on('line', function (line) {
    __lr.pause()
    let lineArray = line.trim().split(' ')
    let word = lineArray[0]
    const vector = lineArray.slice(1).map(parseFloat) //Float64Array.from(lineArray.slice(1))
    if(vector.length === 300) {
        __word2id[word] = i++
        __embedding.push(vector)
    }
    if(i === nmax) {
        console.log('now done')
        __lr.close()
    }
    __lr.resume()
})

__lr.on('end', function () {
    console.log('source finished')
    __id2word = flip(__word2id)
    console.log('and then'+step)
    if((step++) === 1) {
        console.log('finished reading files')
        step = 0
        getNN('tolerable', __embedding, __word2id, embedding__, id2word__, 5)
    }
})

lr__.on('line', function (line) {
    lr__.pause()
    let lineArray = line.trim().split(' ')
    let word = lineArray[0]
    const vector = lineArray.slice(1).map(parseFloat) //Float64Array.from(lineArray.slice(1))
    if(vector.length === 300) {
        word2id__[word] = j++
        embedding__.push(vector)
    }
    if(j === nmax) {
        console.log('now done')
        lr__.close()
    }
    lr__.resume()
})

lr__.on('end', function () {
    console.log('target finished')
    id2word__ = flip(word2id__)
    console.log('and then'+step)
    if((step++) === 1) {
        console.log('finished reading files')
        step = 0
        getNN('tolerable', __embedding, __word2id, embedding__, id2word__, 5)
    }
})


let annoy
function buildAnnoy(embedding__){
    console.log('building annoy from embedding')
    console.log('embedding is like')
    console.log(embedding__[0])
    console.log(`with:${embedding__.length} elements`)
    if(annoy) return
    annoy = new Annoy(10, 'Angular');
    for (let i = 0; i < nmax; i += 1) {
        annoy.addItem(i, embedding__[i])
    }
    annoy.build(10)
    annoy.save(cachePath)
    console.log('annoy built easily')
}

let sum = []
function read() {
    var annoyIndex2 = new Annoy(10, 'Angular');
    if (annoyIndex2.load(cachePath)) {
        var v1 = annoyIndex2.getItem(0);
        var v2 = annoyIndex2.getItem(1);
        console.log('Gotten vectors:', v1, v2);

        for (var i = 0; i < v1.length; ++i) {
            sum.push(v1[i] + v2[i]);
        }
        
        var neighbors = annoyIndex2.getNNsByVector(sum, 10, -1, false);
        console.log('Nearest neighbors to sum', neighbors);

        var neighborsAndDistances = annoyIndex2.getNNsByVector(sum, 10, -1, true);
        console.log('Nearest neighbors to sum with distances', neighborsAndDistances);
    }
}

function getNN(word, __embedding, __word2id, embedding__, id2word__, K=5) {
    console.log(`Nearest neighbors of :${word}`)
    // console.log(__embedding[__word2id[word]])
    // console.log(__word2id.slice(0,10))
    // console.log(__embedding.slice(0,1))
    // let vector = Float64Array.from(__embedding[__word2id[word]])
    buildAnnoy(embedding__)
    read()
}


var Annoy = require('annoy');const { cp } = require('fs')

