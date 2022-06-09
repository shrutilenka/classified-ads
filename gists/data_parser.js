import fs from "fs";
import path from "path";
// import { chain } from "stream-chain";
// import { ignore } from "stream-json/filters/Ignore";
// import pick from "stream-json/filters/Pick";
// import { streamValues } from "stream-json/streamers/StreamValues";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const taxonomyPathEn = '../data/taxonomy/hobbies_en.txt'
const buffer = fs.readFileSync(path.join(__dirname, taxonomyPathEn))
const fileContent = buffer.toString();
const splits = fileContent.split('\r\n\r\n')
const result = {}
splits.forEach(split => {
    const elem = split.split('\r\n')
    const head = elem.pop()
    result[head] = elem
});
console.log(result)
// const taxonomyPathEn = '../data/taxonomy/cptall-en-US.json'

// const pipeline = chain([
//     fs.createReadStream(path.join(__dirname, taxonomyPathEn)),
//     pick.withParser({ filter: 'conceptSet' }),
//     streamValues(),
//     ignore({ filter: /\b_meta\b/i }),
//     (data) => {
//         const values = data.value
//         let stacked = []
//         values.forEach((val) => {
//             const { prefLabel, definition } = val
//             stacked.push({ prefLabel, definition })
//         })
//         return stacked
//         // return value && value.department === 'accounting' ? data : null;
//     },
// ])

// let counter = 0
// pipeline.on('data', (data) => {
//     ++counter
//     console.log(data)
// })

// pipeline.on('end', () => console.log(`The media data has ${counter} types.`))
