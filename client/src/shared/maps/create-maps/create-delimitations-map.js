// import L from 'leaflet';
import 'leaflet.fullscreen'
import screenfull from 'screenfull'
import { onEachFeatureClosure } from './helpers/on-each-feature/on-each-feature.js'
import { styleStatesClosure } from './helpers/style-states.js'
import { country, geoJson } from './state.js'
window.screenfull = screenfull
/**
 * create delimitations's Map
 */

const osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
const osmAttrib = 'Map data &copy; OpenStreetMap contributors'

export function delimitationsMap({ lat, lng, layerFactory, zoom }) {
    var container = L.DomUtil.get('delimitations-map')
    if (container != null) {
        container._leaflet_id = null
    }
    let map = new L.Map('delimitations-map')
    map.name = 'delimitationsMap'
    map.addLayer(layerFactory(osmUrl, osmAttrib, false))
    map.setView(new L.LatLng(lat, lng), zoom)
    geoJson.current = L.geoJson(country.states, {
        style: styleStatesClosure(map),
        onEachFeature: onEachFeatureClosure(map),
    }).addTo(map)
    setTimeout(() => {
        map.invalidateSize()
    }, 300)
    return map
}
