const adminPass = process.env.ADMIN_PASS
const adminEmail = process.env.ADMIN_EMAIL
module.exports = {
    NODE_PORT: 3000,
    HEROKU: false,
    ERROR_STACK: false,
    PIPELINE_KEYWORDS_SECONDS: 60 * 5, // 5 minutes
    DATABASE: 'mongodb://localhost:27017/listings_db',
    APIHost: 'http://localhost:3000',
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
}
