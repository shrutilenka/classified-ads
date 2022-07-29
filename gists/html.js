import DOMPurify from 'isomorphic-dompurify'
// options http://api.html-tidy.org/tidy/tidylib_api_5.6.0/tidy_quickref.html
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const decancer = require('decancer')

const final = DOMPurify.sanitize('<div>vvgozei</div>')
console.log(final)

console.log('decancer')
const noCancer = decancer('vＥⓡ𝔂 𝔽𝕌Ňℕｙ ţ乇𝕏𝓣')
console.log(noCancer) // 'very funny text'
