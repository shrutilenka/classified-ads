import { createRequire } from 'module'
import config from '../../configuration.js'
import constraints from '../constraints/constraints.js'
const require = createRequire(import.meta.url)
const ajvLocalize = {
    en: require('ajv-i18n/localize/en'),
    'en-US': require('ajv-i18n/localize/en'),
    ar: require('ajv-i18n/localize/ar'),
    fr: require('ajv-i18n/localize/fr'),
}

const NODE_ENV = {
    api: -1,
    localhost: 0,
    production: 1,
}[process.env.NODE_ENV]
const COOKIE_NAME = config('COOKIE_NAME')

/**
 * `blabla` is a reply decorator ie: It is a customization of `request.view`
 * @param {*} context is like [data, route, kind] where data holds
 * a lot of values to be sent to user
 * Note: `this` is a Fastify object in the context of calling this
 * It's a function inside a request handler so this.request is simply the request object
 */
export default function blabla(context) {
    // get prior user info somehow
    const user = {}
    // safe add cookies object when not present, for debugging purposes
    // this.request.raw['cookies'] = this.request.raw['cookies'] ? this.request.raw['cookies'] : {}

    user['nickname'] = this.request.params.username
        ? this.request.params.username
        : this.request.cookies[COOKIE_NAME]
        ? '🏠'
        : ''
    let formData = {}
    // When user is entering data, Send back same data again
    // to fill input forms (it helps when there was an error)
    if (this.request.method === 'POST') {
        formData = JSON.parse(JSON.stringify(this.request.body))
        // Removing password keys
        for (var key in formData) {
            if (formData.hasOwnProperty(key)) {
                if (key.indexOf('pass') > -1) delete formData[key]
            }
        }
        Object.assign(context[0], { formData })
    }
    Object.assign(context[0], { user })
    // localize uses i18next for more user friendly messages
    let userFriendlyMsg = {}
    try {
        userFriendlyMsg = localize(...context, this.request, this)
    } catch (err) {
        this.request.log.error(`blabla/localize: ${err.message}`)
    }

    const route = context[1]
    const routeC = constraints[process.env.NODE_ENV].GET[route]
    const UXConstraints = routeC ? { UXConstraints: routeC } : {}
    const final = { ...userFriendlyMsg, ...UXConstraints }
    // Send JSON for API env
    if (NODE_ENV == -1) {
        this.send(context[0])
    } else {
        // console.log(final)
        this.view(`/pages/${route}`, final)
    }
}
const appName = config('APP_NAME')
/**
 * `localize` uses i18next for more user friendly messages
 * It maps messages (multilingual) to routes in different contexts
 * @param {*} route abstracts the requested route/resource
 * @param {*} kind abstracts the response route. An EJS view or an indication of the kind/context of response
 * @param {*} data is the additional data take into account
 * @param {*} req request object to derive localized messages from
 * @param {*} reply reply object to derive flash messages from
 */
function localize(data, route, kind, req, reply) {
    const { section, subtitle } = data
    const sharedData = {
        section: section,
        subtitle: subtitle,
        app_name: appName,
        returnObjects: true,
    }
    // TODO: handle errors here !!!!
    // a translation could easily be missing !!!!
    const announcements = req.t(`announcements`, { returnObjects: true, app_name: appName })
    data['announcements'] = announcements
    const userFriendlyMsg = req.t(`${route}.${kind}`, sharedData)

    if (NODE_ENV < 1)
        Object.keys(userFriendlyMsg).forEach((key) => {
            if (key !== 'success' && key !== 'error') userFriendlyMsg[key] = `[${userFriendlyMsg[key]}]`
        })
    // the following get's back flashed success or failure messages
    // added in the current request lifecycle (here for ex in `pipeline#validationPipeLine`)
    if (!userFriendlyMsg['success'] && reply.flash('success').length) {
        userFriendlyMsg['success'] = reply.flash('success')[0]
    }
    if (!userFriendlyMsg['error'] && reply.flash('error').length) {
        userFriendlyMsg['error'] = reply.flash('error')[0]
    }

    // Internationalize and reformat (flattening) of AJV validation errors to send to client
    let errors = []
    if (req.validationError && req.validationError.validation) {
        const lang = ['en', 'en-US', 'fr', 'ar'].indexOf(req.locale) > -1 ? req.locale : 'en'
        ajvLocalize[lang](req.validationError.validation)
        errors = req.validationError.validation.map((err) => `"${err.instancePath || '****'}" ${err.message}`)
        // errors.push(userFriendlyMsg.error)
    }
    // When there are `errors` (generated in `pipeline#validationPipeLine` for example)
    if (data.errors) {
        errors = [...errors, ...data.errors]
    }
    // When there is an `error` (generated in `common.json` namespace)

    if (userFriendlyMsg.error) errors.push(userFriendlyMsg.error)
    else userFriendlyMsg.error = []

    if (errors.length > 0) userFriendlyMsg.error = errors
    userFriendlyMsg['meta'] = userFriendlyMsg['intro'] ? userFriendlyMsg['intro'] : ''
    return Object.assign(userFriendlyMsg, data)
}
/**
 * Examples
 * {post, get}('listings/^\/(donations|skills|blogs)/') => 'listings.donations'
 * post('listings/gwoogl') => 'listings.gwoogl' or 'listings.not found' or 'listings.SERVER_ERROR'
 * {post, get}('listings/id/:id/') => 'listing.id' or 'listing.not found' or 'listing.SERVER_ERROR'
 * get('listings/tags') => 'tags.tags'
 */
