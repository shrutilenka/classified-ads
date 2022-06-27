// sudo npm install -g protobufjs
// sudo pbjs
// pbjs -t proto  getListingsSince.json > getlistingssince_.proto
// var pbjs = require("protobufjs/cli/pbjs");
// pbjs.main([ "--target", "proto3", "getListingsSince.json" ], function(err, output) {
//     if (err)
//         throw err;
//     // do something with output
//     console.log(output)
// });

const ProtoBufJs = require('protobufjs')
const root = ProtoBufJs.loadSync('./getlistingssince.proto')

const GetListingsSince = root.lookupType('MongoQueries.GetListingsSince')
const Listing = root.lookupType('MongoQueries.Listing')
const getListingsSinceObj = GetListingsSince.create()
let i
for (i = 0; i < 1; i++) {
    const listingObj = Listing.create()
    listingObj._id = 'Front end peak' + i
    listingObj.title = 'Peter Sauce is fatter than technology' + i
    listingObj.tags = ['@@', '@@@']
    listingObj.desc = 'Peter Sauce is fatter than technology' + i
    listingObj.cdesc = 'Peter Sauce is fatter than technology' + i
    listingObj.lat = 'Peter Sauce is fatter than technology' + i
    listingObj.lng = 'Peter Sauce is fatter than technology' + i
    listingObj.section = 'Peter Sauce is fatter than technology' + i
    listingObj.usr = 'Peter Sauce is fatter than technology' + i
    listingObj.lang = 'Peter Sauce is fatter than technology' + i
    listingObj.tagsLang = 'Peter Sauce is fatter than technology' + i
    listingObj.img = 'Peter Sauce is fatter than technology' + i
    listingObj.div = 'Peter Sauce is fatter than technology' + i
    getListingsSinceObj.documents.push(listingObj)
}
getListingsSinceObj.count = i
const buffer = GetListingsSince.encode(getListingsSinceObj).finish()

console.log(buffer)
// console.log(buffer.toString());

try {
    var decodedMessage = GetListingsSince.decode(buffer);
    console.log(decodedMessage.toJSON())
} catch (e) {
    console.log(e)
}

// console.log(JSON.parse(buffer.toString()));