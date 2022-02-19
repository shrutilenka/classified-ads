/* ++miner.js
    const fs = require('fs')
    const path = require('path')

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

    const taxonomyPathEn = '../../data/taxonomy/taxonomy-with-ids.en-US.txt'
    const fileSyncEn = fs.readFileSync(path.join(__dirname, taxonomyPathEn)).toString()
    const fileContentEn = fileSyncEn.replace(',', '_').split('\n').filter(Boolean)

    const googleTagsEn = [...new Set(
        load(fileContentEn)
            .filter((arr) => arr.length == 3 && arr[2].length < 30), (x) => x.join('')
    )].map(arr => arr[1]).slice(1, 200)
    console.log(googleTagsEn)
    refresh()
    googleTagsEn.forEach(search => {
        refreshTopK(search)    
    });

    for (let item of topk.values()) {
        console.log(
            `Item "${item.value}" is in position ${item.rank} with an estimated frequency of ${item.frequency}`
        )
    }
 */