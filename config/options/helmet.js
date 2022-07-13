import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const toBeReplaced = '42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com'
export default () => {
    // TODO: remove "'unsafe-eval'" again. It is left for client side EJS rendering
    return {
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'same-site' },
        contentSecurityPolicy: {
            directives: {
                ...require('@fastify/helmet').contentSecurityPolicy.getDefaultDirectives(),
                'default-src': [
                    "'self'",
                    "'unsafe-eval'",
                    'fonts.googleapis.com',
                    'www.googleapis.com',
                    'app.zingsoft.com',
                    'raw.githubusercontent.com',
                    toBeReplaced,
                ],
                'style-src': [
                    "'self'",
                    "'unsafe-inline'",
                    'unpkg.com',
                    'cdn.jsdelivr.net',
                    'fonts.googleapis.com',
                    'use.fontawesome.com',
                    'maxcdn.bootstrapcdn.com',
                    'cdn.datatables.net',
                ],
                'script-src': [
                    "'self'",
                    "'unsafe-eval'",
                    'unpkg.com',
                    'http://188.165.209.196:9091',
                    'cdn.jsdelivr.net',
                    'cdn.zinggrid.com',
                    'cdnjs.cloudflare.com',
                    'cdn.datatables.net',
                    "'unsafe-inline'",
                ], // "localhost:3002" Ackee tracker test
                'img-src': [
                    "'self'",
                    'data:',
                    '*.tile.osm.org',
                    'unpkg.com',
                    'live.staticflickr.com',
                    'storage.googleapis.com',
                    'cdn.datatables.net',
                    'icongr.am',
                    toBeReplaced,
                ],
                'font-src': [
                    "'self'",
                    'fonts.googleapis.com',
                    'fonts.gstatic.com',
                    'use.fontawesome.com',
                    'maxcdn.bootstrapcdn.com',
                ],
            },
        },
        // TODO: revise policies
        global: true,
    }
}
