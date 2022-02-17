module.exports = {
    features: {
        a: true,
        b: false,
    },
    NODE_PORT: 3000,
    ERROR_STACK: true,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    DATABASE : 'mongodb://localhost:27017/listings_db',
    APIHost: 'http://localhost:3000',
    COOKIE_NAME: 'classified-ads-login',
    OUTLOOK: {
    // Office 365 server
        MAIL_SERVER: 'smtp.office365.com',
        // secure SMTP
        SMTP_PORT: '587',
        TLS: { ciphers: 'SSLv3' }
    },
    PING_LIMITER: {},
    TAG_SIZE: 35
}

