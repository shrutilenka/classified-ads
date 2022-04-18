const path = require('path')
const ProtoBufJs = require('protobufjs')

const absPath = path.join(__dirname, './protos/getlistingssince.proto');
const root = ProtoBufJs.loadSync(absPath)

const GetListingsSince = root.lookupType('MongoQueries.GetListingsSince')
const Listing = root.lookupType('MongoQueries.Listing')

function getListingsSince (QResult) {
    QResult.documents.forEach(
        (doc) => (doc._id = String(doc._id)),
    )
    var err = GetListingsSince.verify(QResult)
    if (err)
        throw Error(err)
    const getListingsSinceObj = GetListingsSince.create(QResult)
    const buffer = GetListingsSince.encode(getListingsSinceObj).finish()
    console.log(buffer)
}

module.exports = {getListingsSince}