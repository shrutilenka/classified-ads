/* eslint-disable max-len */
// Renderer just maps messages (multilanguale) to routes in different contexts 
// TODO: move all title, message, ... here
// TODO: lets clean up routes using this coupled with i18next
// TODO: revise translations /data/locals
const messages = {
    donations: 'Share or look for used items nextdoor',
    skills: 'Share skills',
    blogs: 'Creative passions, hobbies and passtimes!'
}
/**
 * No variables should be derived from data to fill
 * title, intro, context, success, because these must be predefined
 * in a nice UX
 * @param {*} route abstracts the requested route/ressource
 * @param {*} kind abstracts the response route. An EJS view or an indication of the kind/context of response
 * @param {*} data is the additionnal data to render
 * @param {*} req request object to derive localized messages from
 * @param {*} res response object to deliver messages
 * Examples
 * {post, get}('listings/^\/(donations|skills|blogs)/') => 'listings|donations'
 * post('listings/gwoogl') => 'listings|gwoogl' or 'listings|not found' or 'listings|server error'
 * {post, get}('listings/id/:id/') => 'listing|id' or 'listing|not found' or 'listing|server error'
 * get('listings/tags') => 'tags|tags'
 */
module.exports = function (data, route, kind) {
    // No variables should be derived from data to fill
    // title, intro, context, success, because these must be predefined
    // in a nice UX
    // console.log(JSON.stringify(data) + '\n' + route + '\n' + kind)
    // logger.log({ level: 'info', message: JSON.stringify(data) + '\n' + kind + '\n' + route })
    switch (route + "|" + kind) {
    case "listings|listings":
        return (Object.assign({
            title: 'Classified-ads',
            intro: 'Classified advertising brought to the web',
            context: 'listings',
            success: 'Hello there :)',
        }, data))
    case "listings|donations":
        return (Object.assign({
            title: `Classified-ads -- ${data.section}`,
            intro: messages[data.section],
            context: 'listings',
            success: 'Yep we got some donations :)',
        }, data))
    case "listings|skills":
        return (Object.assign({
            title: `Classified-ads -- ${data.section}`,
            intro: messages[data.section],
            context: 'listings',
            success: 'Yep we got some skills :)',
        }, data))
    case "listings|blogs":
        return (Object.assign({
            title: `Classified-ads -- ${data.section}`,
            intro: messages[data.section],
            context: 'listings',
            success: 'Yep we got some blogs :)',
        }, data))
    case "index|listings":
        return (Object.assign({
            title: 'Classified-ads',
            intro: 'Classified advertising brought to the web',
            context: 'listings',
            success: 'Hello there :)',
        }, data))
    case "index|tags":
        return (Object.assign({
            title: 'Classified-ads',
            intro: 'Classified advertising brought to the web',
            context: 'listings',
            success: 'Hello there :)',
        }, data))
    case "index|division":
        return (Object.assign({
            title: 'Classified-ads',
            intro: 'Classified advertising brought to the web',
            context: 'listings',
            success: 'Hello there :)',
        }, data))
    case "index|keyword":
        return (Object.assign({
            title: 'Classified-ads',
            intro: 'Classified advertising brought to the web',
            context: 'listings',
            success: 'Hello there :)',
        }, data))
    case "tags|tags":
        return (Object.assign({
            title: 'Classified-ads -- Collection of tags',
            success: 'Yep we got tags cooked :)'
        }, data))
    case "listing|id":
        return (Object.assign({
            title: 'Classified-ads -- One listing',
            success: 'Yep we got the listing :)'
        }, data))
    case "listing|not found":
        return (Object.assign({
            title: 'Classified-ads',
            message: 'No listing found, it can be deactivated or not approved yet :(',
            error: 'Listing not found'
        }, data))
    case "listings|gwoogl":
        return (Object.assign({
            title: 'Classified-ads -- search results',
            intro: 'Classified advertising brought to the web',
            context: 'gwoogl',
            success: 'Yep, we got results for your search :)'
        }, data))
    case "listings|geolocation":
        return (Object.assign({
            title: 'Classified-ads -- geolocated results',
            intro: 'Classified advertising brought to the web',
            context: 'geolocation',
            success: 'Yep, we got results for your search :)'
        }, data))
        // Success x)
    case "listing|donations":
        return (Object.assign({
            title: `Classified-ads -- ${data.section}`,
            success: 'Success. Here is the password whenever you want to deactivate the listing :)',
            error: 'Image will be loaded shortly!'
        }, data))
    case "listing|skills":
        return (Object.assign({
            title: `Classified-ads -- ${data.section}`,
            success: 'Success. Here is the password whenever you want to deactivate the listing :)',
            error: 'Image will be loaded shortly!'
        }, data))
    case "listing|blogs":
        return (Object.assign({
            title: `Classified-ads -- ${data.section}`,
            success: 'Success. Here is the password whenever you want to deactivate the listing :)',
            error: 'Image will be loaded shortly!'
        }, data))
        // Unsuccess ;(
    case "listing|server error":
        return (Object.assign({
            title: 'Classified-ads',
            message: 'Oops, an internal error accured :(',
            error: 'Oops, an internal error accured :('
        }, data))
    case "listing|contact":
        return (Object.assign({
            title: 'Classified-ads',
            message: 'Email successfully sent to publisher, he may repond to you.',
            success: 'Email successfully sent to publisher'
        }, data))
    }

}