/**
 * `UXBlabla` uses i18next for more user friendly messages
 * It maps messages (multilanguale) to routes in different contexts
 * @param {*} route abstracts the requested route/ressource
 * @param {*} kind abstracts the response route. An EJS view or an indication of the kind/context of response
 * @param {*} data is the additionnal data take into account
 * @param {*} req request object to derive localized messages from
 */
module.exports = function (data, route, kind, req) {
    const { section, subtitle } = data
    const sharedData = { section: section, subtitle: subtitle, returnObjects: true }
    const userFriendlyMsg = req.t(`${route}.${kind}`, sharedData)
    let errors = []
    if (req.validationError) {
        errors = req.validationError.validation.map(err => err.message)
        errors.push(userFriendlyMsg.error)
    }
    // When there are `errors` (generated in `pipline.js` for example)
    if (data.errors) {
        errors = [...errors, ...data.errors]
    }
    // When there is an `error` (generated in `common.json` namespace)
    if (userFriendlyMsg.error) {
        errors.push(userFriendlyMsg.error)
    }
    userFriendlyMsg.error = errors
    // console.log(req.t(`${route}.${kind}`, UXData))
    return Object.assign(
        userFriendlyMsg,
        data,
    )
}
/**
 * Examples
 * {post, get}('listings/^\/(donations|skills|blogs)/') => 'listings.donations'
 * post('listings/gwoogl') => 'listings.gwoogl' or 'listings.not found' or 'listings.SERVER_ERROR'
 * {post, get}('listings/id/:id/') => 'listing.id' or 'listing.not found' or 'listing.SERVER_ERROR'
 * get('listings/tags') => 'tags.tags'
 */