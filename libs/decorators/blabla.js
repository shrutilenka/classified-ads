const config = require('config')

const UXBlabla = require('../services/UX-blabla')
const { constraints } = require('../constraints/constraints')
const NODE_ENV = {
    api: -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]
const COOKIE_NAME = config.get('COOKIE_NAME')

/**
 * `blabla` is a reply decorator
 * (ie: It is a customization of `request.view`)
 * @param {*} context is like [data, route, kind]
 * Note: `this` is a Fastify object in the context of calling this
 * function inside a request handler so this.request is simply the request object
 */
function blabla(context) {
    // get prior user info somehow
    const user = {}
    // safe add cookies when not present, for app-light.js (testing case)
    this.request.raw['cookies'] = this.request.raw['cookies'] ? this.request.raw['cookies'] : {}
    user['nickname'] = this.request.params.username ? this.request.params.username : this.request.cookies[COOKIE_NAME] ? '🏠' : ''
    // Send JSON for Monkey-chaos env
    if (NODE_ENV == -1) {
        this.send(context[0])
    } else {
        let formData = {}
        // When user is entering data, Send back same data again 
        // to fill input forms (it helps when there was an error) 
        if(this.request.method === 'POST') {
            formData = JSON.parse(JSON.stringify(this.request.body))
            // TODO: remove passwords
            Object.assign(context[0], { formData })
        }
        Object.assign(context[0], { user })
        // UXBlabla uses i18next for more user friendly messages
        const userFriendlyMsg = UXBlabla(...context, this.request, this)
        const route = context[1]
        const routeC = constraints[process.env.NODE_ENV].GET[route]
        const UXConstraints = routeC ? { UXConstraints: routeC } : {}
        const data = { ...userFriendlyMsg, ...UXConstraints }
        this.view(`/templates/pages/${route}`, data)
    }
}

module.exports = blabla
