const adminPass = process.env.ADMIN_PASS
const adminEmail = process.env.ADMIN_EMAIL
module.exports = {
    NODE_PORT: 3000, // TODO: 8080 http port
    HEROKU: false,
    ERROR_STACK: false,
    PIPELINE_KEYWORDS_SECONDS: 86400, // 86400 seconds in a day
    DATABASE: 'mongodb://localhost:27017/listings_db_dev',
    APIHost: 'http://localhost:3000', // TODO: replace with 'https://domain.com/' for instance
    COOKIE_NAME: 'classified-ads-login',
    SMTP_MAILHOG: {
        host: '0.0.0.0',
        port: 1025,
        from: 'no-reply@example.com',
    },
    SMTP_OUTLOOK: {
        host: 'smtp.office365.com',
        from: 'no-reply@classified-ads.com',
        port: 587,
        tls: { ciphers: 'SSLv3' },
        secure: false,
        auth: {
            user: adminPass,
            pass: adminEmail,
        },
    },
    PING_LIMITER: {
        max: 100,
        timeWindow: '1 minute',
    },
    TAG_SIZE: 35,
    IMG: {
        // no larger than 3mb.
        size: 3 * 1024 * 1024,
    },
    IMG_THUMB: {
        url: 'https://via.placeholder.com/200x170.png?text=No image',
        // TODO: revise best resolutions
        height: 170,
        width: 200,
    }
}
