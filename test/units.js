import test from 'ava';
import { NLPEscape } from 'nlp-escape';
import { html } from '../libs/constraints/regex.js';
import { stringTransformer } from '../libs/services/pipeLine.js';

let text =
  "this is a <b>big</b> data text. But what is big data? <a>read more</a>." +
  "Then <i>vοΌ₯β‘π π½πΕβο½</i> Ε£δΉππ£ and finally ssn:987477475 ssn:987 47 7475 wow this is fucking working";
console.log(`Original input:\n ${text}\n`);

test('foo', t => {
  const tags = html.allowedTags.map(tag => `<${tag}>`).concat(html.allowedTags.map(tag => `</${tag}>`))
  const escaper = new NLPEscape(tags)
  text = new stringTransformer(text).sanitizeHTML().valueOf()
  console.log(`HTML validated:\n ${text}\n`);
  const clean = escaper.escape(text)
  console.log(`HTML validated escaped:\n ${clean}\n`);
  const transformed = new stringTransformer(clean).decancer().badWords().cleanSensitive().valueOf()
  let original = escaper.unescape(transformed);
  console.log(`\nRecovered results:\n ${original}`);

	t.pass();
});
