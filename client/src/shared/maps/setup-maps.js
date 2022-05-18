import L from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster/src'
import { APIHost } from '../../consts'
import { LIS } from '../../helpers/lis'
import { delimitationsMap } from './create-maps/create-delimitations-map'
import { gameMap } from './create-maps/create-game-map'
import { geoSearchMap } from './create-maps/create-geo-search-map'
import { listingMap } from './create-maps/create-listing-map'
import { listingsMap } from './create-maps/create-listings-map'
import { tweakLeaflet } from './tweak-leaflet'
const __lat__ = window.__lat__
const __lng__ = window.__lng__
const __section__ = window.__section__

function updateCenter () {
  const lat = typeof __lat__ !== 'undefined' ? __lat__ : parseFloat(process.env.LATITUDE)
  const lng = typeof __lng__ !== 'undefined' ? __lng__ : parseFloat(process.env.LONGITUDE)
  // map 1 hidden inputs
  const latInput = LIS.id('lat')
  const lngInput = LIS.id('lng')
  // map 3 hidden inputs
  const latInput3 = LIS.id('lat3')
  const lngInput3 = LIS.id('lng3')

  if (latInput != null) {
    latInput.value = lat
    lngInput.value = lng
  }
  if (latInput3 != null) {
    latInput3.value = lat
    lngInput3.value = lng
  }
  return { lat: lat, lng: lng }
}

const zoom = 8
const addressPoints = window.__addressPoints__

export const setupMaps = () => {
  tweakLeaflet()
  const { lat, lng } = updateCenter()
  // Safe instantiate map container
  const layerFactory = function layerFactory (osmUrl, osmAttrib, darkMode) {
    const tilesOptions = {
      minZoom: 5,
      maxZoom: 10,
      attribution: osmAttrib
    }
    if (darkMode) {
      tilesOptions.className = 'tiles-colors'
    }
    const osm = new L.TileLayer(osmUrl, tilesOptions)
    return osm
  }
  const clusterFactory = function clusterFactory () {
    const markers = new MarkerClusterGroup()
    for (let i = 0; i < addressPoints.length; i++) {
      const a = addressPoints[i]
      const title = `<a href='${APIHost[process.env.NODE_ENV]}/listings/id/${a[3]}'>${a[2]}</a>`
      const marker = L.marker(new L.LatLng(a[0], a[1]), { title: title })
      marker.bindPopup(title)
      markers.addLayer(marker)
    }
    return markers
  }
  const maps = []
  let map
  // Index page map
  if (LIS.id('delimitations-map')) {
    map = delimitationsMap({ lat, lng, layerFactory, zoom })
    maps.push(map)
  }
  // Listing page map
  if (LIS.id('listing-map') && __section__ === 'donations') {
    map = listingMap({ lat, lng, layerFactory, zoom })
    maps.push(map)
  }
  // Geo search map
  if (LIS.id('geo-search-map')) {
    map = geoSearchMap({ lat, lng, layerFactory, clusterFactory, zoom })
    maps.push(map)
  }
  // Same as Geo search map, but without search marker and with more addressPoints
  if (LIS.id('listings-map')) {
    map = listingsMap({ lat, lng, layerFactory, clusterFactory, zoom })
    maps.push(map)
  }
  // Game map
  if (LIS.id('game-map')) {
    map = gameMap({ lat, lng, layerFactory, zoom })
    maps.push(map)
  }
  // TODO: handle invalidateSize in the same way for Bootstrap accordions !
  const details = document.querySelectorAll('details')
  details.forEach((a) => {
    a.addEventListener('toggle', function () {
      maps.forEach((map) => {
        setTimeout(() => {
          try {
            map.invalidateSize()
          } catch (error) {
            console.log(`Refreshing map: ${map.name}`)
          }
        }, 100)
      })
    })
  })
  LIS.elements('collapse').forEach((element) => {
    element.addEventListener('hidden.bs.collapse', (event) => {
      maps.forEach(map => {
        setTimeout(() => {
          try {
            map.invalidateSize()
          } catch (error) {
            console.log(`Refreshing map: ${map.name}`)
          }
        }, 100)
      })
    })
  })
}
