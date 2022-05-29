import { MongoClient } from "mongodb";
// Connection URI
const uri =
    "mongodb://localhost:27017";
// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        // Establish and verify connection
        const db = client.db('listings_db_dev')
        const collection = db.collection('listing')
        const list = await collection.find({}).limit(2).toArray()
        console.log(list)

        const pipeline = [
            { $match: { section: "blogs" } },
            { $group: { _id: "$div", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ];
        const aggCursor = collection.aggregate(pipeline);
        for await (const doc of aggCursor) {
            console.log(doc);
        }
        // { _id: 'Tindouf', count: 8 }
        // { _id: 'Tebessa', count: 7 }
        // { _id: 'Ouargla', count: 6 }
        // { _id: 'Adrar', count: 6 }
        // { _id: 'Khenchla', count: 5 }
        // { _id: 'Skikda', count: 5 }
        // { _id: 'Chlef', count: 4 }
        // { _id: 'Boumerdes', count: 4 }
        // { _id: 'El Oued', count: 4 }
        // { _id: 'Tipaza', count: 4 }
        console.log("==========================================");
        const pipeline2 = [
            { $unwind: "$tags" },
            // by section
            { $group: { "_id": { tags: "$tags", section: "$section" }, "count": { "$sum": 1 } } },
            // { $group: { "_id": "$tags", "count": { "$sum": 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]
        const aggCursor2 = collection.aggregate(pipeline2);
        for await (const doc of aggCursor2) {
            console.log(doc);
        }
        // { _id: { tags: 'qui', section: 'blogs' }, count: 11 }
        // { _id: { tags: 'voluptatem', section: 'skills' }, count: 8 }
        // { _id: { tags: 'rerum', section: 'skills' }, count: 8 }
        // { _id: { tags: 'vel', section: 'blogs' }, count: 6 }
        // { _id: { tags: 'voluptatem', section: 'donations' }, count: 6 }
        // { _id: { tags: 'qui', section: 'donations' }, count: 6 }
        // { _id: { tags: 'labore', section: 'blogs' }, count: 6 }
        // { _id: { tags: 'voluptatem', section: 'blogs' }, count: 6 }
        // { _id: { tags: 'et_et', section: 'skills' }, count: 6 }
        // { _id: { tags: 'eum', section: 'blogs' }, count: 6 }
        // { _id: { tags: 'voluptas', section: 'blogs' }, count: 6 }
        // { _id: { tags: 'sed', section: 'skills' }, count: 5 }
        // { _id: { tags: 'est', section: 'skills' }, count: 5 }
        // { _id: { tags: 'non', section: 'skills' }, count: 5 }
        // { _id: { tags: 'aut', section: 'blogs' }, count: 5 }
        // { _id: { tags: 'rerum', section: 'donations' }, count: 5 }
        // { _id: { tags: 'quo', section: 'donations' }, count: 5 }
        // { _id: { tags: 'et^et', section: 'skills' }, count: 5 }
        // { _id: { tags: 'est', section: 'blogs' }, count: 5 }
        // { _id: { tags: 'est', section: 'donations' }, count: 5 }
        console.log("==========================================");

        console.log("Connected successfully to server");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);