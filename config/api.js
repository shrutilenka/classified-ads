module.exports = {
    NODE_PORT: 3000,
    HEROKU: false,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    DATABASE : 'mongodb://localhost:27017/listings_db',
    APIHost: 'http://localhost:3000',
    COOKIE_NAME: 'classified-ads-login',
    SMTP_MAILHOG: {
        host: '0.0.0.0',
        port: 1025,
        from: 'no-reply@example.com',
    },
    TAG_SIZE: 35
}