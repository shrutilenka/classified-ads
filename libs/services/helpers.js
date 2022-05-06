require('dotenv').config()
const fs = require('fs')
const Multer = require('fastify-multer')

const ops = {}

// Initiate Multer Object (a middleware for handling multipart/form-data),
// when env is not monkey chaos
ops.cloudMulter = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024, // no larger than 3mb.
    },
    // Makes req.file undefined in request if not a valid image file.
    fileFilter: (req, file, cb) => {
        // console.log('fileFilter')
        // console.log(req.body)
        if (
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/jpeg'
        ) {
            cb(null, true)
        } else {
            req.error = 'Only .png, .jpg and .jpeg allowed'
            cb(
                null,
                false,
                new Error('Only .png, .jpg and .jpeg format allowed!'),
            )
        }
    },
}).single('avatar')

ops.localMulter = Multer({ dest: 'uploads/' }).single('avatar')

const Dictionary = require('./dictionary')
const dictionary = new Dictionary(['en', 'ar', 'fr'])
const LanguageDetection = require('@smodin/fast-text-language-detection')
const lid = new LanguageDetection()
ops.getLanguage = async (text) => {
    const language = await lid.predict(text, 3)
    if (
        language[0].prob > 0.5 &&
        ['en', 'ar', 'fr'].indexOf(language[0].lang) > -1
    )
        return language[0].lang
    else if (text.indexOf(' ') < 0) return dictionary.getWordLang(text)
    else return 'und'
}

/**
 * Hash https://werxltd.com/wp/2010/05/13/
 * javascript-implementation-of-javas-string-hashcode-method/
 * @param {String} s
 * @return {String}
 */
ops.hashCode = function hashCode(s) {
    let hash = 0
    let i
    let chr
    if (s.length === 0) return hash
    for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
    }
    return hash
}

ops.readJSON = function readJSON(path) {
    const rawdata = fs.readFileSync(path)
    const data = JSON.parse(rawdata)
    return data
}

class EphemeralData {
    constructor(ttl) {
        this.ttl = ttl
        this.lastSeen = Infinity
        this.data = undefined
    }
    reset() {
        this.lastSeen = Date.now()
    }
    isSame() {
        return this.data && Date.now() - this.lastSeen < this.ttl
    }
}

/**
 * Generate initials from an email string
 * Like "sracer2024@yahoo.com" => "S2"
 * @param {String} email
 * @return {String}
 */
ops.initials = function initials(email) {
    email =
        email
            .split('@')[0]
            .replace(/[0-9]/g, '')
            .split(/[.\-_]/) || []
    if (email.length == 1) {
        return email[0].slice(0, 2).toUpperCase()
    }
    email = ((email.shift()[0] || '') + (email.pop()[0] || '')).toUpperCase()
    return email
}

module.exports = { ops, EphemeralData }
