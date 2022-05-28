/* eslint-disable max-len */

const allowedTags = [
    'a',
    'b',
    'i',
    'u',
    'strike',
    'ul',
    'li',
    'ol',
    'pre',
    'h3',
    'h4',
    'blockquote',
    'hr',
    'span',
    'code',
    'p',
]
const allowedColors = [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
const html = { allowedTags, allowedColors }

// regexp blacklist
// List of things to censor
// helpful: http://www.richardsramblings.com/regex/credit-card-numbers/
// helpful: https://codepen.io/gpeu/pen/eEdvmO
/* eslint-disable max-len */
const reb = {
    electron: /\b(4026|417500|4405|4508|4844|4913|4917)[ -./\\]?\d{4}[ -./\\]?\d{4}\d{3,4}\b/g,
    maestro:
        /\b(?:5[0678]\d\d|6304|6390|67\d\d)[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?(?:\d{4})?[ -./\\]?(?:\d{1,3})?\b/g,
    dankort: /\b(5019)[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{4}\b/g,
    instaPayment: /\b(637|638|639)[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{1}\b/g,
    visa: /\b4\d{3}[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{1,4}\b/g,
    mastercard: /\b5[1-5]\d{2}[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{4}\b/g,
    amex: /\b3[47]\d{2}[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{3}\b/g,
    diners: /\b3(?:0[0-5]|[68]\d)\d{1}[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{2}\b/g,
    discover: /\b6(?:011|5\d{2}|22[19]|4[56789]\d{1})[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{4}\b/g,
    jcb: /\b(?:2131|1800|35\d[28-89])[ -./\\]?\d{4}[ -./\\]?\d{4}[ -./\\]?\d{4}\b/g,
    ssn: /\b\d{3}[ -./\\]?\d{2}[ -./\\]?\d{4}\b/g,
}

const rew = {
    phone: /\b(?:(?:\(\d{3}\)?)|(?:\d{3}))[ -./\\]?\d{3}[ -./\\]?\d{4}\b/g,
}

export { html, reb, rew }
