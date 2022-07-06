import L from 'leaflet'
import 'leaflet.fullscreen'
import { onEachFeatureClosure } from './helpers/on-each-feature/on-each-feature.js'
import { styleStatesClosure } from './helpers/style-states.js'
import { country, geoJson } from './state.js'
/**
 * create delimitations's Map
 */

const osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
const osmAttrib = 'Map data &copy; OpenStreetMap contributors'

export function delimitationsMap({ lat, lng, layerFactory, zoom }) {
    let map = new L.Map('delimitations-map')
    map = 'delimitationsMap'
    map.addLayer(layerFactory(osmUrl, osmAttrib, false))
    map.setView(new L.LatLng(lat, lng), zoom)
    geoJson.current = L.geoJson(country.states, {
        style: styleStatesClosure(map),
        onEachFeature: onEachFeatureClosure(map)
    }).addTo(map)
    setTimeout(() => {
        map.invalidateSize()
    }, 3000)
    return map
}
