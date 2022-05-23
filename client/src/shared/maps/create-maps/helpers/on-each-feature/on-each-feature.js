/**
 * on Each Feature
 * @param {*} feature
 * @param {*} layer
 */
import { highlightFeature } from './helpers/highlight-feature'
import { resetHighlight } from './helpers/reset-highlight'
import { zoomThenRedirect } from './helpers/zoom-then-redirect'

export function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomThenRedirect,
    })
}
