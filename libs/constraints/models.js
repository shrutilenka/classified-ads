// TODO: catch errors on use of these models (in mongo.js and in routes)
import { ObjectId } from '@fastify/mongodb'
import { ArrayModel, BasicModel, ObjectModel } from 'objectmodel'

var URL =
    '^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?'
const Coordinate = new BasicModel(Number)

const Listing = new ObjectModel({
    title: String,
    tags: ArrayModel(String),
    parent: String,
    granpa: String,
    desc: String,
    cdesc: String,
    section: ['donations', 'skills', 'blogs', 'events', 'hobbies'],
    d: Boolean,
    a: Boolean,
    usr: String,
    // TODO: add front end constraints
    lang: ['ar', 'fr', 'en', 'und'], //check
    // img: new RegExp(URL),
    
    // tagsLang: ['ar', 'fr', 'en'], //check
})

const Donation = Listing.extend({
    section: 'donations',
    lat: Number,
    lng: Number,
    offer: [Boolean],
    img: new RegExp(URL),
    thum: new RegExp(URL),
    geolocation: {
        type: 'Point',
        coordinates: ArrayModel(Coordinate)
            .extend()
            .assert((a) => a.length === 2, 'should have two coordinates'),
    },
    div: String,
}).assert(
    (o) => o.lat === o.geolocation.coordinates[1] && o.lng === o.geolocation.coordinates[0],
    'should have two coordinates | point mismatch',
)
// .assert(o => o.lang === o.tagsLang, "language mismatch")

const Event = Listing.extend({
    section: 'events',
    lat: Number,
    lng: Number,
    geolocation: {
        type: 'Point',
        coordinates: ArrayModel(Coordinate)
            .extend()
            .assert((a) => a.length === 2, 'should have two coordinates'),
    },
    div: String,
    from: Date,
    to: Date,
})
    .assert(
        (o) => o.lat === o.geolocation.coordinates[1] && o.lng === o.geolocation.coordinates[0],
        'should have two coordinates | point mismatch',
    )
    .assert((o) => o.to.getTime() > Date.now(), 'The end of event must be in future')
    .assert((o) => o.to.getTime() >= o.from.getTime(), "End of event must be greater than it's start")

const Skill = Listing.extend({
    section: 'skills',
    undraw: String,
    color: String,
    offer: [Boolean],
})

const Blog = Listing
const Hobby = Listing

const Comment = new ObjectModel({
    from: String,
    to: String,
    sent: Date,
    thread: String,
    threadId: String,
    message: String,
})
    .assert((c) => c.from !== c.to, 'comment to someone else')
    .assert((c) => ObjectId.isValid(c.threadId), 'thread Id is not a valid Mongo Id')

const User = new ObjectModel({
    username: String,
    password: [String],
    firstName: String,
    secondName: String,
    passhash: String,
    isVerified: Boolean,
    role: ['admin', 'regular'],
})
    .assert((u) => typeof u.password == 'undefined' || u.username !== u.password, 'username and password must differ')
    .assert((u) => typeof u.password == 'undefined' || u.password.length >= 8, 'password is too weak')

// TODO: assert only when password exists !

export { Donation, Skill, Blog, Event, Hobby, Comment, User, }
