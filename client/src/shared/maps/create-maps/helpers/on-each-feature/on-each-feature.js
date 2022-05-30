/**
 * on Each Feature
 * @param {*} feature
 * @param {*} layer
 */
import { highlightFeature } from './helpers/highlight-feature.js'
import { resetHighlight } from './helpers/reset-highlight.js'
import { zoomThenRedirect } from './helpers/zoom-then-redirect.js'

export function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomThenRedirect,
    })
}
