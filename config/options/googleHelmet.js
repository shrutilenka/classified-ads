export default {
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    contentSecurityPolicy: {
        directives: {
            'default-src': ["'self'", 'cdn.jsdelivr.net', 'https://*.googleapis.com;'],
            'script-src': [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                'cdn.jsdelivr.net',
                'https://*.googleapis.com',
                'https://*.gstatic.com',
                '*.google.com',
                'https://*.ggpht.com',
                '*.googleusercontent.com;',
            ],
            'img-src': [
                "'self'",
                'https://*.googleapis.com',
                'https://*.gstatic.com',
                '*.google.com',
                '*.googleusercontent.com',
                "'data:;'",
            ],
            'frame-src': ['*.google.com;'],
            'connect-src': [
                "'self'",
                'https://*.googleapis.com',
                '*.google.com',
                'https://*.gstatic.com',
                "'data: blob:;'",
            ],
            'font-src': ['https://fonts.gstatic.com;'],
            'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
        },
    },
}
