import test from 'ava';
import { NLPEscape } from 'nlp-escape';
import { html } from '../libs/constraints/regex.js';
import { stringTransformer } from '../libs/services/pipeLine.js';

let text =
  "this is a <b>big</b> data text. But what is big data? <a>read more</a>." +
  "Then <i>vＥⓡ𝔂 𝔽𝕌Ňℕｙ</i> ţ乇𝕏𝓣 and finally ssn:987477475 ssn:987 47 7475 wow this is working";
console.log(`Original input:\n ${text}\n`);

test('foo', t => {
    const escaper = new NLPEscape(html.allowedTags)
    text = new stringTransformer(text).sanitizeHTML().valueOf()
    console.log(`HTML validated:\n ${text}\n`);
    const clean = escaper.escape(text)
    console.log(`HTML validated escaped:\n ${clean}\n`);
    const transformed = new stringTransformer(clean).decancer().badWords().cleanSensitive().valueOf()
    let original = escaper.unescape(transformed);
    console.log(`\nRecovered results:\n ${original}`);

	t.pass();
});

// test("Escape keeps natural language intact", (t) => {
//     stripped = text.replace(/<[^>]*>?/gm, '')
//     text = await tidyP(text, opt)
// });
