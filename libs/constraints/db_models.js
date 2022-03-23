// TODO: catch errors on use of these models (in mongo.js and in routes)
const { BasicModel, ObjectModel, ArrayModel } = require("objectmodel")
const { ObjectId } = require('fastify-mongodb')

var URL = "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?"
const Coordinate = new BasicModel(Number)

const Listing = new ObjectModel({
    title: String,
    tags: ArrayModel(String),
    desc: String,
    section: ['donations', 'skills', 'blogs'],
    d: Boolean,
    a: Boolean,
    usr: String,
    // TODO: add front end constraints
    // lang: ['ar', 'fr', 'en'], //check
    // img: new RegExp(URL),
    div: String,
    // tagsLang: ['ar', 'fr', 'en'], //check
});

const Donation = Listing.extend({
    section: 'donations',
    lat: Number,
    lng: Number,
    geolocation: {
        type: 'Point',
        coordinates: ArrayModel(Coordinate).extend()
            .assert(a => a.length === 2, "should have two coordinates"),
    },
}).assert(o => o.lat === o.geolocation.coordinates[1] && o.lng === o.geolocation.coordinates[0], "should have two coordinates | point mismatch")
// .assert(o => o.lang === o.tagsLang, "language mismatch")

const Skill = Listing.extend({
    section: 'skills',
    undraw: String
})

const Blog = Listing

const Comment = new ObjectModel({
    from: String,
    to: String,
    sent: Date,
    thread: String,
    message: String
}).assert(c => c.from !== c.to, "comment to someone else")
    .assert(c => ObjectId.isValid(c.thread), "thread Id is not a valid Mongo Id")


const User = new ObjectModel({
    username: String,
    pass: String,
    password: String,
    role: ['admin', 'regular']
}).assert(u => u.username !== u.pass, "username and password must differ")
    .assert(u => u.pass.length < 8, "password is too weak")       

module.exports = { Donation, Skill, Blog, Comment, User }