import validator from 'email-validator';

// Credit
// Source: https://stackoverflow.com/a/19303725/1951298
// Author: Antti Kissaniemi
function random(seed) {
    var x = Math.sin(seed++) * 10000
    return Math.floor((x - Math.floor(x)) * 100)
}
// Credit
// Source: https://stackoverflow.com/a/12646864/1951298
// Author: Laurens Holst
function shuffle(array, seed) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(seed * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
}

/**
 *
 * @param {Number} seed random seed for reproducibility and privacy
 * @param {Number} length length of the additional digits
 * @param {Boolean} fixed whether 'baseDomains' will evolve. If true, username will be shorter !
 * @param {Array<String>} baseDomains
 */
function Email2Username(seed, length, fixed = false, baseDomains) {
    if (typeof length !== 'undefined') {
        if (typeof length !== 'number' || !Number.isInteger(length) || length < 3)
            throw Error("'length' must be a natural number greater or equal to 3. We advice an *even* of length >= 4")
        else if (
            typeof baseDomains === 'undefined' ||
            !Array.isArray(baseDomains) ||
            typeof baseDomains[0] !== 'string'
        )
            throw Error("When using 'length', 'baseDomains' must be a defined array of domains of type String")
    } else {
        console.warn(
            "Without length, 'username' would be very long and may not be user friendly.\n" +
                "'baseDomains' is optional in this case. This is fine and advised for mapping in backend",
        )
    }
    if (typeof seed !== 'number') throw Error("'seed' must be a number")
    this.fixed = fixed
    this.length = length * 2
    this.baseDomains = baseDomains
    this.seed = random(seed)
    this.shuffleSeed = 1 / this.seed
    if (!fixed) {
        // Domain allowed characters: letters, numbers, dashes, one period
        this.alphabet = '.-0123456789abcdefghijklmnopqrstuvwxyz'.split('')
    } else {
        this.alphabet = baseDomains
    }
    shuffle(this.alphabet, this.shuffleSeed)

    /**
     * "'Email2Username#toUsername' takes an email and returns a username"
     * @param  {String} email
     * @return {String}
     */
    this.toUsername = (email) => {
        let secretDomain
        if (!validator.validate(email)) {
            throw Error('email is invalid')
        }
        ;[this.email, this.domain] = email.split('@').map((part) => part.split(''))
        // this.domainF = this.domain.slice()
        // shuffle(this.domain, this.shuffleSeed)
        if (this.fixed) {
            // Get the direct fixed index
            secretDomain = this.alphabet.indexOf(this.domain)
            if (secretDomain === -1) throw Error("Domain not found in 'baseDomains'")
        } else {
            // Translate a domain to its characters mapping (one char to a two digits string)
            secretDomain = this.domain.map((char) => {
                const index = this.alphabet.indexOf(char)
                if (index < 10)
                    // Turn one digit to two (1 -> 01)
                    return '0' + index
                return '' + index
            })
            console.log(this.domain)
            console.log(secretDomain)
            secretDomain = secretDomain.slice(0, this.length || 9999).join('')
        }
        
        // We use section sign as a separator as it is not allowed in an email
        const separator = '§'
        // Because alphabet is of length 38, each character is mapped to a number of two digits (characters)
        return this.email.join('') + separator + secretDomain
    }

    /**
     * "Email2Username#toEmail" can theoretically recover the email if 'length' has not been provided at first
     * But if 'length' is provided, we cannot recover for instance the email from 'user455645',
     * thus, with the help of 'baseDomains' we can recover the original email.
     * @param  {String} username
     * @param {Array<String>} baseDomains override initial `baseDomains` in case it evolves
     * @return {String}
     */
    this.toEmail = (username, baseDomains) => {
        if (baseDomains) this.baseDomains = baseDomains
        let domain
        const separator = '§'
        let [username_, secretDomain] = username.split(separator)
        if (this.fixed) {
            return username_ + '@' + this.baseDomains[Number(secretDomain)]
        }
        // recover original domain
        if (!this.length) {
            secretDomain = secretDomain.match(/.{1,2}/g).map(Number)
            domain = secretDomain
                .map((code) => {
                    return this.alphabet[code]
                })
                .join('')
            return username_ + '@' + domain
        }
        secretDomain = secretDomain
            .slice(0, this.length)
            .match(/.{1,2}/g)
            .map(Number)
        // split by two
        domain = secretDomain
            .map((code) => {
                return this.alphabet[code]
            })
            .join('')
        let possibleDomains = this.baseDomains
            .map((dom) => {
                return {
                    score: dom.indexOf(domain) > -1 && 1 / (dom.length - domain.length),
                    domain: dom,
                }
            })
            .filter((scored) => scored.score)
            .sort((scored) => scored.score)
        if (possibleDomains.length) return username_ + '@' + possibleDomains[0].domain
        else return username_ + '@' + domain
    }
}

let lib = new Email2Username(3)
let secret = lib.toUsername('bacloud14@gmail.com')
console.log(secret)
let result = lib.toEmail(secret)
console.log(result)
