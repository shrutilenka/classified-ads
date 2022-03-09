const geoEncoder = require('../../data/geo/geoJSONEncoder')
const { constraints } = require('../constraints/constraints')
const { html, reb, rew } = require('../constraints/regex')
const sanitizeHtml = require('sanitize-html')
const nlp = require('wink-nlp-utils');

const coordinates = geoEncoder.getBorders()

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
    this.sanitize = function () {
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
    for (const [key,values] of Object.entries(level)) {
        if (values.has(value)) {
            return key
        }
    }
}
const { give } = require('./data').give
const googleTagsEn = give.googleTagsEn
// // example getting parent of 'dresses'
// var level1 = groupOneLevel(googleTagsEn, 0, 1)
// var level2 = groupOneLevel(googleTagsEn, 1, 2)
// var parent = getKey('Dresses', level2)
// var granpa = getKey(parent, level1)

function PipeLine(data) {
    this.data = data
}
const and = (x, y) => x && y
const or = (x, y) => x || y
const assign = (fn, obj, solution) => obj.value = fn(obj.value, solution)

PipeLine.prototype = {
    value: true,
    error: {},
    // Expects this.data to be a point
    isPointInsidePolygon: function (vs, op) {
        const predicate = (point, vs) => {
            const x = point.lat
            const y = point.lng
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
        const solution = predicate(this.data, vs)
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Example: Expects this.data to be String
    isLongerThan: function (len, op) {
        const solution = this.data.length > len
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Example: Expects this.data to be body.tags
    isTagsValid: function (op) {
        let solution = true
        try {
            let tags = JSON.parse(this.data.tags)
            this.data.tags = tags.map(a => a.value)
        } catch (error) {
            this.error['isTagsValid'] = error.message
            solution = false
        }
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Expects this.data to be body
    validateBetween: function (schema, op) {
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
        this.value = op === 'or' ? assign(or, this, solution)
            : assign(and, this, solution)
        return this
    },
    // Expects this.data to be body having body.undraw
    undrawSplit: function () {
        [this.data.undraw, this.data.color] = this.data.undraw.split('#')
        return this
    },
    // Expects this.data to be body having body.undraw.color
    postValidate: function () {
        this.data.undraw = this.data.undraw + '#' + this.data.color
        delete this.data.color
        delete this.data.illu_q
        delete this.data.img_radio
        return this
    },
    // Expects this.data to be body having body.tags
    deriveTagsCategories: function () {
        // [this.data.undraw, this.data.color] = this.data.undraw.split('#')
        return this
    },
    evaluate: function () {
        return { isTrue: this.value, data: this.data, error: this.error }
    }
}
const Ajv = require('ajv')
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
    const geoPipeline = new PipeLine({ lat: body.lat, lng: body.lng })
    const bodyPipeline = new PipeLine(body)
    const geoValid = !geolocation ? true : geoPipeline.isPointInsidePolygon(coordinates).evaluate().isTrue
    const undrawValid = !illustrations ? true : bodyPipeline.undrawSplit().validateBetween(singletonSchema).postValidate()
    const tagsValid = !body.tags ? true : bodyPipeline.isTagsValid().evaluate().isTrue
    // TODO: start with section donations at least
    // const tagsCatgories = !body.tags ? true : bodyPipeline.deriveTagsCategories().evaluate()
    // Final validation according to schema / if not yet validated
    const validate = ajv.compile(singletonSchema.def.valueOf())
    const valid = singletonSchema.called ? true : validate(body)
    let error = {}
    if (!valid) error['validation'] = validate.errors
    // stack other errors. Object.assign is safe.
    Object.assign(error, geoPipeline.error)
    Object.assign(error, bodyPipeline.error)
    return { error, tagsValid, geoValid, undrawValid }
}

module.exports = { validationPipeLine, stringTransformer }
