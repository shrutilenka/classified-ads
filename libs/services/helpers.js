const fs = require('fs')
const Multer = require('fastify-multer')
const ops = {}
const crypto = {}

// Initiate Multer Object (a middleware for handling multipart/form-data),
// when env is not api env
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

/**
 * Super simple encryption utilities
 * Inspired by https://gist.github.com/sukima/5613286
 * Properly handles UTF-8 strings
 * Use these functions at your own risk: xor encryption provides only acceptable
 * security when the key is random and longer than the message
 * If looking for more reliable security use: https://tweetnacl.js.org/
 *
 * Use passwordDerivedKey function in this file to generate a key from a password, or to generate a random key
 */
// Super simple XOR encrypt function
crypto.encrypt = function encrypt(key, plaintext) {
    let cyphertext = [];
    // Convert to hex to properly handle UTF8
    plaintext = Array.from(plaintext).map(function(c) {
        if(c.charCodeAt(0) < 128) return c.charCodeAt(0).toString(16).padStart(2, '0');
        else return encodeURIComponent(c).replace(/\%/g,'').toLowerCase();
    }).join('');
    // Convert each hex to decimal
    plaintext = plaintext.match(/.{1,2}/g).map(x => parseInt(x, 16));
    // Perform xor operation
    for (let i = 0; i < plaintext.length; i++) {
        cyphertext.push(plaintext[i] ^ key.charCodeAt(Math.floor(i % key.length)));
    }
    // Convert to hex
    cyphertext = cyphertext.map(function(x) {
        return x.toString(16).padStart(2, '0');
    });
    return cyphertext.join('');
}

// Super simple XOR decrypt function
crypto.decrypt = function decrypt(key, cyphertext) {
    try {
        cyphertext = cyphertext.match(/.{1,2}/g).map(x => parseInt(x, 16));
        let plaintext = [];
        for (let i = 0; i < cyphertext.length; i++) {
            plaintext.push((cyphertext[i] ^ key.charCodeAt(Math.floor(i % key.length))).toString(16).padStart(2, '0'));
        }
        return decodeURIComponent('%' + plaintext.join('').match(/.{1,2}/g).join('%'));
    }
    catch(e) {
        return false;
    }
}

// Super simple password to 256-bit key function
crypto.passwordDerivedKey = function passwordDerivedKey(password, salt, iterations, len) {
    if(!password) password = randomStr();
    if(!salt) salt = '80ymb4oZ';
    if(!iterations) iterations = 8;
    if(!len) len = 256;
    len = Math.ceil(len / 8);
    var key = '';

    while(key.length < len) {
        var i = 0;
        var intSalt = salt;
        var intKey = '';
        while(i < iterations) {
            intKey = hash(password + intSalt);
            var newSalt = '';
            for(let j = 0; j < intSalt.length; j++) {
                newSalt += (intSalt.charCodeAt(j) ^ intKey.charCodeAt(Math.floor(j % intKey.length))).toString(36);
            }
            intSalt = newSalt;
            i++;
        }
        key += intKey;
    }
    return key.substring(0, len);
}

// Generates a random string of the specificed length
function randomStr(len) {
    var str = parseInt(Math.random()*10e16).toString(36);
    if(typeof len == 'undefined') return str;
    else {
        while(str.length < len) {
            str += parseInt(Math.random()*10e16).toString(36);
        }
        return str.substring(str.length - len);
    }
}

// Super simple hash function
function hash(str) {
    for(var i = 0, h = 4641154056; i < str.length; i++) h = Math.imul(h + str.charCodeAt(i) | 0, 2654435761);
    h = (h ^ h >>> 17) >>> 0;
    return h.toString(36);
}
module.exports = { ops, crypto, EphemeralData }
