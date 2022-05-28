const assert = require('assert')

let Annoy
try {
    Annoy = require('annoy')
}
catch (e) {
    console.log('oh no no annoy module. I hope this is not production environment')
}

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

const transTable = {
    en: ['fr', 'ar'],
    fr: ['en', 'ar'],
    ar: ['fr', 'en'],
}
const VECTOR_LEN = 300
/** @param { Array } languages*/
module.exports = function (languages) {
    assert(
        languages.every((lang) => ['en', 'ar', 'fr'].indexOf(lang) > -1),
        'language not supported',
    )
    // LOAD MODELS ONCE ! THEY ARE HUGE !
    // Do not load models when Annoy is not instantiated (for test environments)
    if(!Annoy) {
        languages.forEach((language) => {
            if (!models[language].word2id) {
                models[language].id2word = require(`../../data/models/id2word.${language}.json`)
                models[language].word2id = flip(models[language].id2word)
            }
        })

        this.translate = function (word, from, count) {
            const to = transTable[from][0]
            const to_ = transTable[from][1]
            const result = {}
            result[to] = [word, word, word]
            result[to_] = [word, word, word]
            return result
        }

        this.getWordLang = function (word) {
            if (models.en.word2id[word]) return 'en'
            if (models.ar.word2id[word]) return 'ar'
            if (models.fr.word2id[word]) return 'fr'
            return 'und'
        }
        return
    }

    // LOAD MODELS ONCE ! THEY ARE HUGE !
    languages.forEach((language) => {
        if (!models[language].index) {
            models[language].index = new Annoy(VECTOR_LEN, 'Angular')
            const cachePath = path.join(__dirname, `../../data/models/annoy.${language}.vec`)
            models[language].index.load(cachePath)
            models[language].id2word = require(`../../data/models/id2word.${language}.json`)
            models[language].word2id = flip(models[language].id2word)
        }
    })

    this.translate = function (word, from, count) {
        if (from === 'und' || word.length < 3) return {}
        const to = transTable[from][0]
        const to_ = transTable[from][1]
        const wordId = models[from].word2id[word]
        const vector = models[from].index.getItem(wordId)
        let indices = []
        let indices_ = []
        let neighbors = models[to].index.getNNsByVector(vector, count, -1, true)
        let neighbors_ = models[to_].index.getNNsByVector(vector, count, -1, true)
        neighbors.distances.forEach((distance, idx) => {
            if (distance > 0.9) indices.push(neighbors.neighbors[idx])
        })
        neighbors_.distances.forEach((distance, idx) => {
            if (distance > 0.9) indices_.push(neighbors_.neighbors[idx])
        })

        const result = {}
        result[to] = indices.map((idx) => models[to].id2word[idx])
        result[to_] = indices_.map((idx) => models[to_].id2word[idx])
        return result
    }

    this.getWordLang = function (word) {
        if (models.en.word2id[word]) return 'en'
        if (models.ar.word2id[word]) return 'ar'
        if (models.fr.word2id[word]) return 'fr'
        return 'und'
    }
}

function flip(obj) {
    return Object.keys(obj).reduce((ret, key) => {
        ret[obj[key]] = key
        return ret
    }, {})
}
