module.exports = {
    NODE_PORT: 8080,
    HEROKU: false,
    ERROR_STACK: false,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    // secret in env file
    DATABASE : '',
    APIHost: 'https://The Internet',
    COOKIE_NAME: 'classified-ads-login',
    SMTP: {
        
    },
    PING_LIMITER: {
        max: 100,
        timeWindow: '1 minute'
    },
    TAG_SIZE: 35
}

