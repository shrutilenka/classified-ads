const adminPass = process.env.ADMIN_PASS
const adminEmail = process.env.ADMIN_EMAIL

module.exports = {
    features: {
        a: true,
        b: false,
    },
    NODE_PORT: 3000,
    HEROKU: false,
    ERROR_STACK: false,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    DATABASE : 'mongodb://localhost:27017/listings_db',
    APIHost: 'http://localhost:3000',
    COOKIE_NAME: 'classified-ads-login',
    SMTP: {
        host: '0.0.0.0',
        port: 1025
    },
    PING_LIMITER: {
        max: 100,
        timeWindow: '1 minute'
    },
    TAG_SIZE: 35
}

