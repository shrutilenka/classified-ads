// Renderer just maps messages (multilanguale) to routes in different contexts
// It customizes i18n translations for an perfect UX  

/**
 * @param {*} route abstracts the requested route/ressource
 * @param {*} kind abstracts the response route. An EJS view or an indication of the kind/context of response
 * @param {*} data is the additionnal data to render
 * @param {*} req request object to derive localized messages from
 * Examples
 * {post, get}('listings/^\/(donations|skills|blogs)/') => 'listings.donations'
 * post('listings/gwoogl') => 'listings.gwoogl' or 'listings.not found' or 'listings.server error'
 * {post, get}('listings/id/:id/') => 'listing.id' or 'listing.not found' or 'listing.server error'
 * get('listings/tags') => 'tags.tags'
 */
module.exports = function (data, route, kind, req) {
    const { section, subtitle } = data
    const UXData = { section: section, subtitle: subtitle, returnObjects: true }
    // console.log(req.t(`${route}.${kind}`, UXData))
    return Object.assign(
        req.t(`${route}.${kind}`, UXData),
        data,
    )
}
