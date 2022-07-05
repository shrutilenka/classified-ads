import { state } from "../../state.js"

// #getMarkers, #setMapOnAll, #clearMarkers, #showMarkers are helpers to refresh markers.
// Detach old features then attach new markers to map
export const getMarkers = () => {
    if (!state.currentResponse.isValid) {
        return
    }
    state.center = {
        lat: state.currentResponse.coordinates[1],
        lng: state.currentResponse.coordinates[0],
    }
    // const bounds = new state.google.maps.LatLngBounds()

    let idx = 0
    const COLORS = ['blue', 'purple', 'green', 'yellow', 'red']
    const getColor = (min, max, value) => COLORS[Math.floor((COLORS.length * (value - min)) / (max - min))]

    const maxTemp = Math.max(
        ...state.currentResponse.weather.map((item) => {
            return item.daily[0].temp.max
        }),
    )
    const minTemp = Math.min(
        ...state.currentResponse.weather.map((item) => {
            return item.daily[0].temp.min
        }),
    )
    state.map.data.forEach(function (feature) {
        // if (feature.getGeometry().getType() === 'Polygon') {
        //     feature.getGeometry().forEachLatLng(function(latlng) {
        //         bounds.extend(latlng);
        //     });
        // } else
        if (feature.getGeometry().getType() === 'Point') {
            const todayTempCeil = state.currentResponse.weather[idx].daily[0].temp.max
            const todayTempFloor = state.currentResponse.weather[idx++].daily[0].temp.min
            const todayTemp = (todayTempCeil + todayTempFloor) / 2
            const LatLng = feature.getGeometry().get()
            const marker = new state.google.maps.Marker({
                position: LatLng,
                map: map,
                animation: state.google.maps.Animation.DROP,
                title: feature.i ? feature.i.name : feature.name,
                iconSrc: `https://maps.google.com/mapfiles/ms/icons/${getColor(
                    minTemp,
                    maxTemp,
                    todayTemp,
                )}-dot.png`,
            })
            // console.log('minTemp', minTemp, 'maxTemp', maxTemp, 'todayTemp', todayTemp)
            marker.setIcon(
                `https://maps.google.com/mapfiles/ms/icons/${getColor(minTemp, maxTemp, todayTemp)}-dot.png`,
            )
            state.markers.push(marker)
            // remove previous markers from map.data
            state.map.data.remove(feature)
        }
    })
}

// Sets the map on all markers in the array.
const setMapOnAll = (map) => {
    state.markers.forEach((marker) => marker.setMap(map))
}

// Removes the markers from the map, but keeps them in the array.
export const clearMarkers = () => {
    state.markers.forEach((marker) => marker.setVisible(false))
    setMapOnAll(null)
    state.markers = []
}

// Shows any markers currently in the array.
export const showMarkers = () => {
    state.markers.forEach((marker) => marker.setVisible(true))
    setMapOnAll(state.map)
}
