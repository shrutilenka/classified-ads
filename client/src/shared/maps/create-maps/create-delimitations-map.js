import L from 'leaflet'
import 'leaflet.fullscreen'
import states from '../../../data/states.json'
import { onEachFeature } from './helpers/on-each-feature/on-each-feature.js'
import { styleStatesClosure } from './helpers/style-states.js'
import { geoJson, map } from './state.js'
/**
 * create delimitations's Map
 */

const osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
const osmAttrib = 'Map data &copy; OpenStreetMap contributors'

export function delimitationsMap({ lat, lng, layerFactory, zoom }) {
    map.current = new L.Map('delimitations-map')
    map.name = 'delimitationsMap'
    map.current.addLayer(layerFactory(osmUrl, osmAttrib, false))
    map.current.setView(new L.LatLng(lat, lng), zoom)
    geoJson.current = L.geoJson(states, {
        style: styleStatesClosure(map),
        onEachFeature,
    }).addTo(map.current)
    setTimeout(() => {
        map.current.invalidateSize()
    }, 3000)
    return map
}
