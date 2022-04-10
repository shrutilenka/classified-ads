require('dotenv').config()
const config = require('config')

const renderer = require('../services/renderer')
const { constraints } = require('../constraints/constraints')
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]
const COOKIE_NAME = config.get('COOKIE_NAME')

function blabla(context) {
    // get priore user info somehow
    const user = {}
    // safe add cookies when not present, for app-light.js (testing case)
    this.request.raw['cookies'] = this.request.raw['cookies'] ? this.request.raw['cookies'] : {}
    user['nickname'] = this.request.params.username ? this.request.params.username : this.request.cookies[COOKIE_NAME] ? '🏠' : ''
    if (NODE_ENV == -1) {
        this.send(context[0])
    } else {
        let formData = {}
        if(this.request.method === 'POST') {
            formData = JSON.parse(JSON.stringify(this.request.body))
            // TODO: remove passwords
            Object.assign(context[0], { formData })
        }
        Object.assign(context[0], { user })
        const userFriendlyMsg = renderer(...context, this.request)
        const route = context[1]
        const routeC = constraints[process.env.NODE_ENV].GET[route]
        const UXConstraints = routeC ? { UXConstraints: routeC } : {}
        const data = { ...userFriendlyMsg, ...UXConstraints }
        this.view(`/templates/pages/${route}`, data)
    }
}

module.exports = blabla
