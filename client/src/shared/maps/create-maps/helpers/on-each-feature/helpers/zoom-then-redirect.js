/**
 * zoom To Feature
 * @param {*} e
 */
export function zoomThenRedirectClosure(map) {
    return function zoomThenRedirect(e) {
        map.fitBounds(e.target.getBounds())
        const division = e.target.feature.properties.name
        window.location.href = `/division/${division}` //${APIHost[process.env.NODE_ENV]}
    }
}
