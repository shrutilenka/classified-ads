const routine =
    `function (text) {
    const stopwords = ['the', 'this', 'and', 'or', 'id']
    text = text.replace(new RegExp('\\b(' + stopwords.join('|') + ')\\b', 'g'), '')
    text = text.replace(/[;,.]/g, ' ')
    return text.toLowerCase()
}`
// If the pipeline includes the $out operator, aggregate() returns an empty cursor.
// TODO: conf
// db: 'listings_db',
// coll: 'tmp'
const agg = [
    {
        "$match": {
            "a": true,
            "d": false
        }
    }, {
        "$project": {
            "title": 1,
            "desc": 1
        }
    }, {
        "$replaceWith": {
            "_id": "$_id",
            "text": {
                "$concat": [
                    "$title",
                    " ",
                    "$desc"
                ]
            }
        }
    }, {
        "$addFields": {
            "cleaned": {
                "$function": {
                    "body": routine,
                    "args": [
                        "$text"
                    ],
                    "lang": "js"
                }
            }
        }
    }, {
        "$replaceWith": {
            "_id": "$_id",
            "text": {
                "$trim": {
                    "input": "$cleaned"
                }
            }
        }
    }, {
        "$project": {
            "words": {
                "$split": [
                    "$text",
                    " "
                ]
            },
            "qt": {
                "$const": 1
            }
        }
    }, {
        "$unwind": {
            "path": "$words",
            "includeArrayIndex": "id",
            "preserveNullAndEmptyArrays": true
        }
    }, {
        "$group": {
            "_id": "$words",
            "docs": {
                "$addToSet": "$_id"
            },
            "weight": {
                "$sum": "$qt"
            }
        }
    }, {
        "$sort": {
            "weight": -1
        }
    }, {
        "$limit": 100
    }, {
        "$out": {
            "db": "listings_db",
            "coll": "words"
        }
    }
]
// Closure for db instance only
module.exports = function (db) {
    /**
   * Runs the aggregation pipeline
   * @return {Promise}
   */
    this.refreshKeywords = async function () {
        const collection = db.collection('listing')
        // .toArray() to trigger the aggregation
        // it returns an empty curson so it's fine
        return await collection.aggregate(agg).toArray()
    }
}
