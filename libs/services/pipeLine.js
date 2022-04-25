const geoEncoder = require('../../data/geo/geoJSONEncoder')
const { constraints } = require('../constraints/constraints')
const { html, reb, rew } = require('../constraints/regex')
const sanitizeHtml = require('sanitize-html')
const nlp = require('wink-nlp-utils');
const coordinates = geoEncoder.getBorders()
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
            a: ['href', 'name', 'target']
        },
        allowedStyles: {
            '*': {
                // Match HEX and RGB
                color: html.allowerColors,
                'text-align': [/^left$/, /^right$/, /^center$/],
                // Match any number with px, em, or %
                'font-size': [/^\d+(?:px|em|%)$/]
            },
            span: {
                'font-size': [/^\d+rem$/],
                'background-color': [/^pink$/]
            }
        }
    })
}

function cleanSensitive(blob, maxlen) {
    if (maxlen === 0) {
        return ''
    }
    if (maxlen < 9) {
        return blob
    }
    if (blob.length > 9) {
        const whitelisted = []
        for (const regexw in rew) {
            if (Object.prototype.hasOwnProperty.call(rew, regexw)) {
                blob = blob.replace(
                    rew[regexw],
                    function (match, index) {
                        this.push({ i: index, m: match })
                        return ''
                    }.bind(whitelisted)
                )
            }
        }
        const maskStr = (match) => new Array(match.length + 1).join('X')
        for (const regexb in reb) {
            if (Object.prototype.hasOwnProperty.call(reb, regexb)) {
                blob = blob.replace(reb[regexb], maskStr)
            }
        }
        whitelisted.forEach((w) => {
            blob = blob.slice(0, w.i) + w.m + blob.slice(w.i)
        })
    }
    if (maxlen && blob.length >= this.maxlen) {
        blob = blob.substr(0, this.maxlen - 1)
    }
    return blob
}


// Chain wrapper for Strings
function stringTransformer(s) {
    var internal = String(s)
    // this.checkHTML = function () {
    //     internal = sanitize(s)
    //     return this
    // }
    this.sanitizeHTML = function () {
        internal = sanitize(s)
        return this
    }
    this.cleanSensitive = function () {
        internal = cleanSensitive(s)
        return this
    }
    this.valueOf = function () {
        return nlp.string.removeExtraSpaces(internal)
    }
}
// derive parent tag from an array of arrays
function groupOneLevel(data, fstIdx, sndIdx) {
    const result = {}
    data.forEach(row => {
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

function getAscendants(keyword, lang) {
    const parent = getKey(keyword, leveled[lang].level2)
    const granpa = getKey(parent, leveled[lang].level1)
    return [parent, granpa]
}
// TODO: could be much cleaner
const give = require('./data').give
const { googleTagsEn, googleTagsFr, googleTagsAr } = give
const { googleTagsEnLite, googleTagsFrLite, googleTagsArLite } = give
const leveled = { 'en': {}, 'fr': {}, 'ar': {} }
leveled.en['level1'] = groupOneLevel(googleTagsEn, 0, 1)
leveled.en['level2'] = groupOneLevel(googleTagsEn, 1, 2)
leveled.fr['level1'] = groupOneLevel(googleTagsFr, 0, 1)
leveled.fr['level2'] = groupOneLevel(googleTagsFr, 1, 2)
leveled.ar['level1'] = groupOneLevel(googleTagsAr, 0, 1)
leveled.ar['level2'] = groupOneLevel(googleTagsAr, 1, 2)
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
const assign = (fn, obj, solution) => obj.value = fn(obj.value, solution)
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
                const intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
                if (intersect) inside = !inside
            }
            return inside
        }
        const solution = predicate(vs)
        ChainBool.call(this, solution, op)
        return this
    },
    // Example: Expects this.data to be body.tags
    isTagsValid: function (op) {
        const predicate = () => {
            try {
                let tags = JSON.parse(this.data.tags)
                this.data.tags = tags.map(a => a.value)
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
    isValideBetween: function (schema, op) {
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
        [this.data.undraw, this.data.color] = this.data.undraw.split('#')
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
    deriveTagsParents: function () {
        const english = googleTagsEnLite.indexOf(this.data.tags[0]) > -1
        const french = english ? false : googleTagsFrLite.indexOf(this.data.tags[0]) > -1
        const arabic = english ? false : french ? false : googleTagsArLite.indexOf(this.data.tags[0]) > -1
        try {
            if (!english && !french && !arabic)
                throw new Error('Tags should be choosen from list')
            var parent, granpa
            if (english) {
                [parent, granpa] = getAscendants(this.data.tags[0], 'en')
            }
            if (french) {
                [parent, granpa] = getAscendants(this.data.tags[0], 'fr')
            }
            if (arabic) {
                [parent, granpa] = getAscendants(this.data.tags[0], 'ar')
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
    }
}
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, coerceTypes: 'number' })
function validationPipeLine(req) {
    const { body } = req
    const section = body.section
    const method = req.method
    const {
        upload,
        geolocation,
        illustrations,
        schema
    } = constraints[process.env.NODE_ENV][method][section]
    const singletonSchema = schema()
    ///////////////////////////////////THIS IS CONSTRUCTION OF THE PIPELINE (MAIN LIKE)//////////////////////////////////////////////////////////////////////
    const geoPipeline = new PipeLine({ lat: body.lat, lng: body.lng })
    const bodyPipeline = new PipeLine(body)
    const bodyPipeline2 = new PipeLine(body)
    const geoValid = !geolocation ? true : geoPipeline.isPointInsidePolygon(coordinates).evaluate().isTrue
    const undrawValid = !illustrations ? true : bodyPipeline.undrawSplit().isValideBetween(singletonSchema).undrawPostValidate().isTrue
    const tagsValid = !body.tags ? true : bodyPipeline2.isTagsValid().deriveTagsParents().evaluate().isTrue

    ///////////////////////////////////THE REST IS REFORMATING OF RESULTS////////////////////////////////////////////////////////////////////////////////////
    // Final validation according to schema / if not yet validated
    const validate = ajv.compile(singletonSchema.def.valueOf())
    const valid = singletonSchema.called ? true : validate(body)
    let errors = []
    if (!valid) {
        localize[(req.i18n && req.i18n.language) || req.cookies.locale || 'en'](validate.errors)
        errors = validate.errors.map(err => `${err.dataPath.substring(1)} - ${err.message}`)
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

module.exports = { validationPipeLine, stringTransformer }
