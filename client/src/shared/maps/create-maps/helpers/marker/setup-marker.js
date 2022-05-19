import { getStateNames } from '../../../../../helpers/get-state-names'
import { LIS } from '../../../../../helpers/lis'
import { isMarkerInsidePolygon } from './is-marker-inside-polygon'
const states = require('../../../../../data/states.json')
const MobileDetect = require('mobile-detect')
const polygon = states.features.map((a) => a.geometry.coordinates[0])
/**
 * Attach one marker to map with constraints (marker is draggble but cannot go out of )
 * Based on __borders and __states (country borders and Wilayas delimitations)
 * @param {map} map
 * @param {marker} marker
 * @param coordinates
 * @return {(marker|*[])[]} Just a reference
 */
export function moveableMarker(map, marker, coordinates) {
  const names = getStateNames()
  const md = new MobileDetect(window.navigator.userAgent)
  let lastValid = []
  /**
   * blablabla (0_o)
   * @param {@@} evt
   */
  function trackCursor(evt) {
    marker.setLatLng(evt.latlng)
  }

  marker.on('mousedown', (event) => {
    map.dragging.disable()
    if (md.mobile()) {
      const { lat: circleStartingLat, lng: circleStartingLng } = marker._latlng
      const { lat: mouseStartingLat, lng: mouseStartingLng } = event.latlng
      map.on('mousemove', event => {
        const { lat: mouseNewLat, lng: mouseNewLng } = event.latlng
        const latDifference = mouseStartingLat - mouseNewLat
        const lngDifference = mouseStartingLng - mouseNewLng

        const center_ = [circleStartingLat - latDifference, circleStartingLng - lngDifference]
        marker.setLatLng(center_)
      })
      return
    }

    map.on('mousemove', trackCursor)
  })
  // First run of the map, find division based on marker
  // which is centered anyway
  if (map.name === 'geoSearchMap' || map.name === 'listingMap') {
    const where = polygon.findIndex((coo) =>
      isMarkerInsidePolygon(marker, coo)
    )
    if (LIS.id('div'))
      LIS.id('div').value = names[where]
  }
  marker.on('mouseup', () => {
    map.dragging.enable()
    map.off('mousemove', trackCursor)
    const where = polygon.findIndex((coo) =>
      isMarkerInsidePolygon(marker, coo)
    )
    if (isMarkerInsidePolygon(marker, coordinates)) {
      const center = marker.getBounds().getCenter()
      if (map.name === 'listingMap') {
        LIS.id('lat').value = center.lat
        LIS.id('lng').value = center.lng
        LIS.id('div').value = names[where]
      } else if (map.name === 'geoSearchMap') {
        LIS.id('lat3').value = center.lat
        LIS.id('lng3').value = center.lng
      }
      lastValid = [center.lat, center.lng]
    } else {
      marker.setLatLng(lastValid)
    }
  })

  return [marker, lastValid]
}
