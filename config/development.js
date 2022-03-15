module.exports = {
    features: {
        a: true,
        b: false,
    },
    NODE_PORT: 8080,
    HEROKU: true,
    ERROR_STACK: false,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    // secret in env file
    DATABASE : '',
    APIHost: 'https://classified-ads-bacloud14.herokuapp.com/',
    COOKIE_NAME: 'classified-ads-login',
    OUTLOOK: {
    // Office 365 server
        MAIL_SERVER: 'smtp.office365.com',
        // secure SMTP
        SMTP_PORT: '587',
        TLS: { ciphers: 'SSLv3' }
    },
    PING_LIMITER: {
        max: 100,
        timeWindow: '1 minute'
    },
    TAG_SIZE: 35
}

