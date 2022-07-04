import { state } from "../state.js"

// sets default geolocation for center based on originating page: {index.html, index_ar.html}
export const refreshCenter = () => {
    const params = _getScriptParams(['lang', 'centerLocation'])
    language = params[0]
    const centerLocation = params[1]
    switch (centerLocation) {
      case 'algiers':
        center = { lat: 36.75, lng: 3.05 }
        break
      case 'paris':
        center = { lat: 48.85, lng: 2.35 }
        break
      case 'london':
        center = { lat: 51.50, lng: 0.12 }
        break
      default:
        break
    }
    // When initMap is called for a second time, choose the earlier center not to move the map center away in the globe
    if (state.currentResponse.isValid) {
      center = {
        lat: state.currentResponse.coordinates[1],
        lng: state.currentResponse.coordinates[0]
      }
    }
  }