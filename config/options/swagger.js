import config from '../../configuration.js';

export default {
    routePrefix: '/documentation',
    exposeRoute: true,
    swagger: {
        info: {
            title: 'Classified-ads API',
            description: 'Check the API, any help or bug fix is really appreciated! <a href="github.com/bacloud23/classified-ads/issues">Open an issue or follow with a pull request</a>',
            version: '1.0.0'
        },
        externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here'
        },
        host: `localhost:${process.env.PORT || config('NODE_PORT')}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
}