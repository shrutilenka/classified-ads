import path from 'path'
import ProtoBufJs from 'protobufjs'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const absPath = path.join(__dirname, './protos/getlistingssince.proto')
const root = ProtoBufJs.loadSync(absPath)

const GetListingsSince = root.lookupType('MongoQueries.GetListingsSince')
const Listing = root.lookupType('MongoQueries.Listing')

function getListingsSince() {
    this.getBuffer = (QResult) => {
        var err = GetListingsSince.verify(QResult)
        if (err) throw Error(err)
        const getListingsSinceObj = GetListingsSince.create(QResult)
        const buffer = GetListingsSince.encode(getListingsSinceObj).finish()
        return buffer
    }

    this.decodeBuffer = (buffer) => {
        var decodedMessage = GetListingsSince.decode(buffer)
        return decodedMessage.toJSON()
    }
}

function getListingById() {
    this.getBuffer = (QResult) => {
        var err = Listing.verify(QResult)
        if (err) throw Error(err)
        const listingObj = Listing.create(QResult)
        const buffer = Listing.encode(listingObj).finish()
        return buffer
    }

    this.decodeBuffer = (buffer) => {
        var decodedMessage = Listing.decode(buffer)
        return decodedMessage.toJSON()
    }
}

export { getListingsSince, getListingById }

