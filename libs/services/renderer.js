/* eslint-disable max-len */
// Renderer just maps messages (multilanguale) to routes in different contexts

/**
 * No variables should be derived from data to fill
 * title, intro, success, because these must be predefined
 * in a nice UX
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
    // No variables should be derived from data to fill
    // title, intro, success, because these must be predefined
    // in a nice UX.
    // console.log(JSON.stringify(data) + '\n' + route + '\n' + kind)
    const { section, subtitle } = data
    const UXData = { section: section, subtitle: subtitle, returnObjects: true }
    console.log(req.t(`${route}.${kind}`, UXData))

    return Object.assign(
        req.t(`${route}.${kind}`, UXData),
        data,
    )

    // const uniq = route + "|" + kind

    // switch (uniq) {
    // case "listings|listings":
    //     return (Object.assign({
    //         title: 'Classified-ads -- all listings',
    //         intro:  req.t(`${uniq}.intro`),
    //         success: 'We got listings from all sections :)',
    //     }, data))
    // case "listings|donations":
    //     return (Object.assign({
    //         title: `Classified-ads -- ${data.section}`,
    //         intro: messages[data.section],
    //         success: 'Yep we got some donations :)',
    //     }, data))
    // case "listings|skills":
    //     return (Object.assign({
    //         title: `Classified-ads -- ${data.section}`,
    //         intro: messages[data.section],
    //         success: 'Yep we got some skills :)',
    //     }, data))
    // case "listings|blogs":
    //     return (Object.assign({
    //         title: `Classified-ads -- ${data.section}`,
    //         intro: messages[data.section],
    //         success: 'Yep we got some blogs :)',
    //     }, data))
    // case "index|listings":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         intro: 'Classified advertising brought to the web',
    //         success: 'Hello there :)',
    //     }, data))
    // case "index|tags":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         intro: 'Classified advertising brought to the web',
    //         success: 'Hello there :)',
    //     }, data))
    // case "index|division":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         intro: 'Classified advertising brought to the web',
    //         success: 'Hello there :)',
    //     }, data))
    // case "index|keyword":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         intro: 'Classified advertising brought to the web',
    //         success: 'Hello there :)',
    //     }, data))
    // case "tags|tags":
    //     return (Object.assign({
    //         title: 'Classified-ads -- Collection of tags',
    //         success: 'Yep we got tags cooked :)'
    //     }, data))
    // case "listing|id":
    //     return (Object.assign({
    //         title: 'Classified-ads -- One listing',
    //         success: 'Yep we got the listing :)'
    //     }, data))
    // case "message|not found":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         error: 'No listing found, it can be deactivated or not approved yet :('
    //     }, data))
    // case "listings|gwoogl":
    //     return (Object.assign({
    //         title: 'Classified-ads -- search results',
    //         intro: 'Classified advertising brought to the web',
    //         success: 'Yep, we got results for your search :)'
    //     }, data))
    // case "listings|geolocation":
    //     return (Object.assign({
    //         title: 'Classified-ads -- geolocated results',
    //         intro: 'Classified advertising brought to the web',
    //         success: 'Yep, we got results for your search :)'
    //     }, data))
    //     // Success x)
    // case "listing|donations":
    //     return (Object.assign({
    //         title: `Classified-ads -- ${data.section}`,
    //         success: 'Success. Here is the password whenever you want to deactivate the listing :)',
    //         error: 'Image will be loaded shortly!'
    //     }, data))
    // case "listing|skills":
    //     return (Object.assign({
    //         title: `Classified-ads -- ${data.section}`,
    //         success: 'Success. Here is the password whenever you want to deactivate the listing :)',
    //         error: 'Image will be loaded shortly!'
    //     }, data))
    // case "listing|blogs":
    //     return (Object.assign({
    //         title: `Classified-ads -- ${data.section}`,
    //         success: 'Success. Here is the password whenever you want to deactivate the listing :)',
    //         error: 'Image will be loaded shortly!'
    //     }, data))
    //     // Unsuccess ;(
    // case "message|server error":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         error: 'Oops, an internal error accured :('
    //     }, data))
    // case "listing|contact":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         success: 'Email successfully sent to publisher'
    //     }, data))
    // case "message|contact":
    //     return (Object.assign({
    //         title: 'Classified-ads',
    //         success: 'Email successfully sent to publisher'
    //     }, data))
    // }
}
