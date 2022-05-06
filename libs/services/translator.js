const assert = require('assert')
const Annoy = require('annoy')
const path = require('path')

let models = {
    en: {
        // embedding: undefined,
        index: undefined,
        id2word: undefined,
        word2id: undefined,
    },
    fr: {
        // embedding: undefined,
        index: undefined,
        id2word: undefined,
        word2id: undefined,
    },
    ar: {
        // embedding: undefined,
        index: undefined,
        id2word: undefined,
        word2id: undefined,
    },
}

const VECTOR_LEN = 300
/** @param { Array } languages*/
module.exports = function (languages) {
    assert(
        languages.every((lang) => ['en', 'ar', 'fr'].indexOf(lang) > -1),
        'language not supported',
    )
    // LOAD MODELS ONCE ! THEY ARE HUGE !
    languages.forEach((language) => {
        if (!models[language].index) {
            models[language].index = new Annoy(VECTOR_LEN, 'Angular')
            const cachePath = path.join(
                __dirname,
                `../models/annoy.${language}.vec`,
            )
            models[language].index.load(cachePath)
            models[language].id2word = require(`../../data/models/id2word.${language}.json`)
            models[language].word2id = flip(models[language].id2word)
        }
    })

    this.translate = async function (word, from, to, count) {
        if (word.length < 3) return undefined
        const wordid = models[from].word2id[word]
        const vector = models[from].index.getItem(wordid)
        var neighbors = models[to].index.getNNsByVector(vector, count, -1, false)
        return neighbors.map(idx => models[to].id2word[idx])
    }
}

function flip(obj) {
    return Object.keys(obj).reduce((ret, key) => {
        ret[obj[key]] = key
        return ret
    }, {})
}
