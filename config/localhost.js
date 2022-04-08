const adminPass = process.env.ADMIN_PASS
const adminEmail = process.env.ADMIN_EMAIL

module.exports = {
    features: {
        a: true,
        b: false,
    },
    NODE_PORT: 3000,
    HEROKU: false,
    ERROR_STACK: true,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    DATABASE : 'mongodb://localhost:27017/listings_db',
    APIHost: 'http://localhost:3000',
    COOKIE_NAME: 'classified-ads-login',
    SMTP: {
        pool: true,
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // use TLS
        auth: {
            user: adminEmail,
            pass: adminPass
        }
    },
    PING_LIMITER: {
        max: 100,
        timeWindow: '1 minute'
    },
    TAG_SIZE: 35
}

