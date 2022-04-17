const adminPass = process.env.ADMIN_PASS
const adminEmail = process.env.ADMIN_EMAIL
module.exports = {
    NODE_PORT: 8080,
    HEROKU: true,
    ERROR_STACK: false,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    // secret in env file
    DATABASE : '',
    APIHost: 'https://classified-ads-bacloud14.herokuapp.com/',
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

