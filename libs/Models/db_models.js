const { BasicModel, ObjectModel, ArrayModel } = require("objectmodel")

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
    lang: ['ar', 'fr', 'en'], //check
    img: new RegExp(URL),
    div: String,
    tagsLang: ['ar', 'fr', 'en'], //check
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
    .assert(o => o.lang === o.tagsLang, "language mismatch")

const Skill = Listing.extend({
    section: 'skills',
    undraw: String
})

const Blog = Listing


module.exports = { Donation, Skill, Blog}