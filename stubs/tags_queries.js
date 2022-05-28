import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const splitBy = (sep) => (str) =>
    str.split(sep).map((x) => x.trim())
const splitLine = splitBy('-')
const splitCategories = splitBy('>')
const load = (lines) =>
    // put all lines into a "container"
    // we want to process all lines all the time as opposed to each line individually
    [lines]
        // separate id and categories
        // e.g ['3237', 'Animals & Pet Supplies > Live Animals']
        .map((lines) => lines.map(splitLine))
        // split categories and put id last
        // e.g. ['Animals & Pet Supplies', 'Live Animals', 3237]
        .map((lines) => lines.map(([id, cats]) => splitCategories(cats)))
        .pop()

const taxonomyPathEn = '../data/taxonomy/taxonomy-with-ids.en-US.txt'
const fileSyncEn = fs.readFileSync(path.join(__dirname, taxonomyPathEn)).toString()
const fileContentEn = fileSyncEn.replace(',', '_').split('\n').filter(Boolean)

const googleTagsEn = [...new Set(
    load(fileContentEn)
        .filter((arr) => arr.length == 3 && arr[2].length < 30), (x) => x.join('')
)].slice(1, 200)


function groupOneLevel(data, fstIdx, sndIdx) {
    const result = {}
    data.forEach(row => {
        if (!result[row[fstIdx]]) {
            result[row[fstIdx]] = new Set()
        }
        result[row[fstIdx]].add(row[sndIdx])
    })
    console.log(result)
    return result
}

var level1 = groupOneLevel(googleTagsEn, 0, 1)
var level2 = groupOneLevel(googleTagsEn, 1, 2)

function getKey(value, level) {
    for (const [key,values] of Object.entries(level)) {
        if (values.has(value)) {
            return key
        }
    }
}
var parent = getKey('Dresses', level2)
var granpa = getKey(parent, level1)
