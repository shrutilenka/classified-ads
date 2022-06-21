import { createRequire } from 'module';
const require = createRequire(import.meta.url)

const decancer = require('decancer');
const noCancer = decancer('vＥⓡ𝔂 𝔽𝕌Ňℕｙ ţ乇𝕏𝓣');
console.log(noCancer); // 'very funny text'