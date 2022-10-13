import L from 'leaflet';
import { moveableMarker } from './helpers/marker/setup-marker.js';
import { country } from './state.js';

let map
let circle
let lastValid
const latLngs = []
const osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
const osmAttrib = 'Map data &copy; OpenStreetMap contributors'
let moveable
/**
 * create a listing's Map
 */
export function listingMap({ lat, lng, zoom, layerFactory }) {
    const coordinates = country.borders
    var container = L.DomUtil.get('listing-map')
    if (container != null) {
        container._leaflet_id = null
    }
    map = new L.Map('listing-map')
    map.name = 'listingMap'
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    map.addLayer(layerFactory(osmUrl, osmAttrib, isDarkMode))
    map.setView(new L.LatLng(lat, lng), zoom)
    // transform geojson coordinates into an array of L.LatLng
    for (let i = 0; i < coordinates.length; i++) {
        latLngs.push(new L.LatLng(coordinates[i][1], coordinates[i][0]))
    }
    L.mask(latLngs).addTo(map)
    // console.log(names);
    circle = L.circle([lat, lng], 6000).addTo(map)
    lastValid = [lat, lng]
    ;[moveable, lastValid] = moveableMarker(map, circle, coordinates)
    // Refresh tiles after some time
    // because it doesn't load properly at first
    setTimeout(() => {
        map.invalidateSize()
    }, 300)
    return map
}
