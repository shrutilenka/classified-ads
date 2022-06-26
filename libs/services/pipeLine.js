import Ajv from 'ajv'
import { createRequire } from 'module'
import sanitizeHtml from 'sanitize-html'
import nlp from 'wink-nlp-utils'
import { getBorders } from '../../data/geo/geoJSONEncoder.js'
import constraints from '../constraints/constraints.js'
import { html, reb, rew } from '../constraints/regex.js'
import { give } from './data.js'

const require = createRequire(import.meta.url)
const decancer = require('decancer')
const naughtyWords = require('naughty-words')
const badWords = naughtyWords.ar.concat(naughtyWords.fr).concat(naughtyWords.en)
const Filter = require('bad-words'),
    filter = new Filter()
filter.addWords(...badWords)

const coordinates = getBorders()
const localize = {
    en: require('ajv-i18n/localize/en'),
    'en-US': require('ajv-i18n/localize/en'),
    ar: require('ajv-i18n/localize/ar'),
    fr: require('ajv-i18n/localize/fr'),
}
///////////////////////////////////THESE ARE HELPERS, FUNCTIONS THAT I CALL INSIDE THE PIPELINE//////////////////////////////////////////////////////////////
function sanitize(str) {
    const search1 = 'h1'
    const replacer1 = new RegExp(search1, 'g')
    const search2 = 'h2'
    const replacer2 = new RegExp(search2, 'g')
    str = str.replace(replacer1, 'h3').replace(replacer2, 'h4')
    return sanitizeHtml(str, {
        allowedTags: html.allowedTags,
        allowedAttributes: {
            span: ['style'],
            a: ['href', 'name', 'target'],
        },
        allowedStyles: {
            '*': {
                // Match HEX and RGB
                color: html.allowedColors,
                'text-align': [/^left$/, /^right$/, /^center$/],
                // Match any number with px, em, or %
                'font-size': [/^\d+(?:px|em|%)$/],
            },
            span: {
                'font-size': [/^\d+rem$/],
                'background-color': [/^pink$/],
            },
        },
    })
}

function cleanSensitive(blob, maxLen) {
    if (maxLen === 0) {
        return ''
    }
    if (maxLen < 9) {
        return blob
    }
    if (blob.length > 9) {
        const whitelisted = []
        for (const regexW in rew) {
            if (Object.prototype.hasOwnProperty.call(rew, regexW)) {
                blob = blob.replace(
                    rew[regexW],
                    function (match, index) {
                        this.push({ i: index, m: match })
                        return ''
                    }.bind(whitelisted),
                )
            }
        }
        const maskStr = (match) => new Array(match.length + 1).join('X')
        for (const regexB in reb) {
            if (Object.prototype.hasOwnProperty.call(reb, regexB)) {
                blob = blob.replace(reb[regexB], maskStr)
            }
        }
        whitelisted.forEach((w) => {
            blob = blob.slice(0, w.i) + w.m + blob.slice(w.i)
        })
    }
    if (maxLen && blob.length >= this.maxLen) {
        blob = blob.substr(0, this.maxLen - 1)
    }
    return blob
}

// Chain wrapper for Strings
function stringTransformer(s) {
    let internal = String(s)
    let flag = false
    this.decancer = function () {
        internal = decancer(internal)
        return this
    }
    this.badWords = function () {
        internal = filter.clean(internal)
        return this
    }
    this.sanitizeHTML = function () {
        internal = sanitize(internal)
        return this
    }
    this.cleanSensitive = function () {
        internal = cleanSensitive(internal)
        return this
    }
    this.valueOf = function () {
        return nlp.string.removeExtraSpaces(internal)
    }
}
// derive parent tag from an array of arrays
function groupOneLevel(data, fstIdx, sndIdx) {
    const result = {}
    data.forEach((row) => {
        if (!result[row[fstIdx]]) {
            result[row[fstIdx]] = new Set()
        }
        result[row[fstIdx]].add(row[sndIdx])
    })
    return result
}

function getKey(value, level) {
    for (const [key, values] of Object.entries(level)) {
        if (values.has(value)) {
            return key
        }
    }
}

function getAscendants(keyword, lang, section) {
    var parent, granpa
    try {
        if (section === 'donations') {
            const parent = getKey(keyword, donLeveled[lang].level2)
            const granpa = getKey(parent, donLeveled[lang].level1)
            return [parent, granpa]
        }
        if (section === 'hobbies') {
            ;[parent = granpa] = getKey(keyword, allTags.hobbies[lang])
            return [parent, granpa]
        }
    } catch (error) {
        ;[parent = granpa] = keyword
        return [parent, granpa]
    }
    // TODO: other sections
    ;[parent = granpa] = keyword
    return [parent, granpa]
}

const { googleTagsEnLite, googleTagsFrLite, googleTagsArLite } = give
const allTags = {
    donations: {
        en: googleTagsEnLite,
        fr: googleTagsFrLite,
        ar: googleTagsArLite,
    },
    hobbies: {
        en: require('../../data/taxonomy/hobbies_en.json'),
        fr: require('../../data/taxonomy/hobbies_fr.json'),
        ar: require('../../data/taxonomy/hobbies_ar.json'),
    },
}

const { googleTagsEn, googleTagsFr, googleTagsAr } = give
const donLeveled = { en: {}, fr: {}, ar: {} }
donLeveled.en['level1'] = groupOneLevel(googleTagsEn, 0, 1)
donLeveled.en['level2'] = groupOneLevel(googleTagsEn, 1, 2)
donLeveled.fr['level1'] = groupOneLevel(googleTagsFr, 0, 1)
donLeveled.fr['level2'] = groupOneLevel(googleTagsFr, 1, 2)
donLeveled.ar['level1'] = groupOneLevel(googleTagsAr, 0, 1)
donLeveled.ar['level2'] = groupOneLevel(googleTagsAr, 1, 2)

// Example getting parent of 'Dresses'
// var parent = getKey('Dresses', googleTagsEnLevel2)
// var granpa = getKey(parent, googleTagsEnLevel1)

///////////////////////////////////THIS IS THE ACTUAL PIPELINE//////////////////////////////////////////////////////////////////////////////////////////////
function PipeLine(data) {
    this.data = data
}
///////////////////////////////////SIMPLE BOOLEAN HELPER////////////////////////////////////////////////////////////////////////////////////////////////////
const and = (x, y) => x && y
const or = (x, y) => x || y
const assign = (fn, obj, solution) => (obj.value = fn(obj.value, solution))
function ChainBool(solution, op) {
    this.value = op === 'or' ? assign(or, this, solution) : assign(and, this, solution)
}
PipeLine.prototype = {
    value: true,
    error: {},
    // Expects this.data to be a point
    isPointInsidePolygon: function (vs, op) {
        const predicate = (vs) => {
            const x = this.data.lat
            const y = this.data.lng
            let inside = false
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                const xi = vs[i][1]
                const yi = vs[i][0]
                const xj = vs[j][1]
                const yj = vs[j][0]
                const intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
                if (intersect) inside = !inside
            }
            return inside
        }
        const solution = predicate(vs)
        ChainBool.call(this, solution, op)
        return this
    },
    // Expects this.data to be body.tags
    isTagsValid: function (op) {
        const predicate = () => {
            try {
                let tags = JSON.parse(this.data.tags)
                this.data.tags = tags.map((a) => a.value)
                return true
            } catch (error) {
                this.error['isTagsValid'] = error.message
                return false
            }
        }
        ChainBool.call(this, predicate(), op)
        return this
    },
    // Expects this.data to be body
    mapInputValues: function (inputs) {
        const keyValues = Object.keys(this.data).map((key) => {
            if (inputs.indexOf(key) > -1) {
                const isTrue = this.data[key] == 'on' ? true : false
                return [key, isTrue]
            } else {
                return [key, this.data[key]]
            }
        })
        const dictionary = Object.fromEntries(keyValues)
        inputs.forEach((key) => {
            dictionary[key] = dictionary[key] ? dictionary[key] : false
        })
        Object.keys(this.data).forEach((key) => {
            this.data[key] = dictionary[key]
        })
        return this
    },
    // Expects this.data to be body
    isValidBetween: function (schema, op) {
        const predicate = (schema) => {
            if (schema.called) {
                return true
            }
            const validate = ajv.compile(schema.def.valueOf())
            const valid = validate(this.data)
            if (!valid) this.error['validation'] = validate.errors
            return this.error === null
        }
        const solution = predicate(schema)
        ChainBool.call(this, solution, op)
        return this
    },
    // Expects this.data to be body having body.undraw
    undrawSplit: function () {
        ;[this.data.undraw, this.data.color] = this.data.undraw.split('#')
        return this
    },
    // Expects this.data to be body having body.undraw.color
    undrawPostValidate: function () {
        this.data.undraw = this.data.undraw + '#' + this.data.color
        delete this.data.color
        delete this.data.illu_q
        delete this.data.img_radio
        return this
    },
    // Expects this.data to be body having body.tags
    // only if for the first tag !!!
    deriveTagsParents: function (section) {
        if (section !== 'donations' && section !== 'hobbies') {
            // TODO: no real hierarchy now
            var parent, granpa
            parent = granpa = this.data.tags[0]
            return this
        }
        // console.log(`this.data.tags[0] ${this.data.tags[0]}`)
        const english = allTags[section]['en'].indexOf(this.data.tags[0]) > -1
        const french = english ? false : allTags[section]['fr'].indexOf(this.data.tags[0]) > -1
        const arabic = english ? false : french ? false : allTags[section]['ar'].indexOf(this.data.tags[0]) > -1
        // console.log(`english ${english}`)
        try {
            if (!english && !french && !arabic) throw new Error('Tags should be chosen from list')
            var parent, granpa
            if (english) {
                ;[parent, granpa] = getAscendants(this.data.tags[0], 'en', section)
            }
            if (french) {
                ;[parent, granpa] = getAscendants(this.data.tags[0], 'fr', section)
            }
            if (arabic) {
                ;[parent, granpa] = getAscendants(this.data.tags[0], 'ar', section)
            }
            this.data.parent = parent
            this.data.granpa = granpa
        } catch (error) {
            this.error['deriveTagsParents'] = error.message
        }
        return this
    },
    evaluate: function () {
        return { isTrue: this.value, data: this.data, error: this.error }
    },
}
const ajv = new Ajv({ allErrors: true, coerceTypes: 'number' })
function validationPipeLine(req) {
    const { body, method } = req
    const section = body.section
    const { upload, geolocation, illustrations, schema } = constraints[process.env.NODE_ENV][method][section]
    const singletonSchema = schema()

    ///////////////////////////////////THIS IS CONSTRUCTION OF THE PIPELINE (MAIN LIKE)//////////////////////////////////////////////////////////////////////
    const geoPipeline = new PipeLine({ lat: body.lat, lng: body.lng })
    const bodyPipeline = new PipeLine(body)
    const bodyPipeline2 = new PipeLine(body)
    const bodyPipeline3 = new PipeLine(body)
    const geoValid = !geolocation ? true : geoPipeline.isPointInsidePolygon(coordinates).evaluate().isTrue
    const undrawValid = !illustrations
        ? true
        : bodyPipeline.undrawSplit().isValidBetween(singletonSchema).undrawPostValidate().isTrue
    const tagsValid = !body.tags ? true : bodyPipeline2.isTagsValid().deriveTagsParents(section).evaluate().isTrue
    // value mapping is to deal with HTML input types, like the weird behavior of Checkboxes (https://stackoverflow.com/q/11424037/1951298)
    // Other value mappings (for the whole app are in ../decorators/valueMapping.js)
    if (['skills', 'blogs', 'donations'].indexOf(section) > -1) bodyPipeline3.mapInputValues(['offer'])
    ///////////////////////////////////THE REST IS REFORMATING OF RESULTS////////////////////////////////////////////////////////////////////////////////////
    // Final validation according to schema / if not yet validated
    const validate = ajv.compile(singletonSchema.def.valueOf())
    const valid = singletonSchema.called ? true : validate(body)

    let errors = []
    if (!valid) {
        localize[(req.i18n && req.i18n.language) || req.cookies.locale || 'en'](validate.errors)
        errors = validate.errors.map((err) => `${err.dataPath.substring(1)} - ${err.message}`)
    }
    if (geoPipeline.error) {
        let friendlyErrors = Object.entries(geoPipeline.error).map(([key, value]) => errors.push(`${key}: ${value}`))
        errors = errors.concat(friendlyErrors)
    }

    if (bodyPipeline.error) {
        let friendlyErrors = Object.entries(bodyPipeline.error).map(([key, value]) => errors.push(`${key}: ${value}`))
        errors = errors.concat(friendlyErrors)
    }

    return { errors, tagsValid, geoValid, undrawValid }
}

export { validationPipeLine, stringTransformer }
