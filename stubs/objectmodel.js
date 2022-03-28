const { BasicModel, ObjectModel, ArrayModel } = require("objectmodel")

// {
//     "_id": {
//         "$oid": "623827637ede15d63ac92105"
//     },
//     "title": "reprehenderit sunt ullamco ut eiusmod",
//     "tags": ["laboris"],
//     "desc": "temporetullamco incididunt exercitation do",
//     "lat": 31.313,
//     "lng": 7.098,
//     "section": "donations",
//     "pass": "sint eu",
//     "d": true,
//     "a": true,
//     "usr": "user2@mail.com",
//     "ara": false,
//     "img": "https://live.staticflickr.com/3938/15615468856_92275201d5_b.jpg",
//     "div": "Guelma",
//     "tagsLang": "arabic",
//     "geolocation": {
//         "type": "Point",
//         "coordinates": [7.098, 31.313]
//     }
// }
var URL = "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?";
const Coordinate = new BasicModel(Number);

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

const listing = new Listing({
    "title": "reprehenderit sunt ullamco ut eiusmod",
    "tags": ["laboris"],
    "desc": "temporetullamco incididunt exercitation do",
    "section": "donations",
    "pass": "sint eu",
    "d": true,
    "a": true,
    "usr": "user2@mail.com",
    "lang": "en", //check
    "img": "https://live.staticflickr.com/3938/15615468856_92275201d5_b.jpg",
    "div": "Guelma",
    "tagsLang": "ar", //check
});

const donation = new Donation({
    "title": "reprehenderit sunt ullamco ut eiusmod",
    "tags": ["laboris"],
    "desc": "temporetullamco incididunt exercitation do",
    "lat": 31.313,
    "lng": 7.098,
    "section": "donations",
    "pass": "sint eu",
    "d": true,
    "a": true,
    "usr": "user2@mail.com",
    "lang": "en",
    "img": "https://live.staticflickr.com/3938/15615468856_92275201d5_b.jpg",
    "div": "Guelma",
    "tagsLang": "en",
    "geolocation": {
        "type": "Point",
        "coordinates": [7.098, 31.313]
    }
})

const User = new ObjectModel({
    username: String,
    pass: String,
    password: String,
    role: ['admin', 'regular']
}).assert(u => u.username !== u.pass, "username and password must differ")
    .assert(u => u.pass.length >= 8, "password is too weak")       

const user =  {
  username: 'user2@mail.com',
  pass: 'blablabla111SSS.',
  password: '$2a$10$vLvHw0FcvTnjxj5FIXuemeRzEO3jlJrN59L.8OmX4ZwFbEuIT2LOK',
  role: 'regular'
}

const instance = new User(user)
console.log(instance)