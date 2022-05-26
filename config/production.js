module.exports = {
    NODE_PORT: 8080,
    HEROKU: false,
    ERROR_STACK: false,
    PIPELINE_KEYWORDS_SECONDS: 86400, //seconds in a day
    // secret in env file
    DATABASE : '',
    APIHost: 'https://The Internet',
    COOKIE_NAME: 'classified-ads-login',
    PING_LIMITER: {
        max: 100,
        timeWindow: '1 minute'
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

