import { map } from '../../../state.js'
/**
 * zoom To Feature
 * @param {*} e
 */
export function zoomThenRedirect(e) {
    map.current.fitBounds(e.target.getBounds())
    const division = e.target.feature.properties.name
    window.location.href = `/division/${division}` //${APIHost[process.env.NODE_ENV]}
}
