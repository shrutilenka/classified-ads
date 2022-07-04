// #getMarkers, #setMapOnAll, #clearMarkers, #showMarkers are helpers to refresh markers.
// Detach old features then attach new markers to map
export const getMarkers = () => {
    if (!currObj.isValid) {
        return
    }
    center = {
        lat: currObj.coordinates[1],
        lng: currObj.coordinates[0],
    }
    // const bounds = new google.maps.LatLngBounds()

    let idx = 0
    const COLORS = ['blue', 'purple', 'green', 'yellow', 'red']
    const getColor = (min, max, value) => COLORS[Math.floor((COLORS.length * (value - min)) / (max - min))]

    const maxTemp = Math.max(
        ...currObj.weather.map((item) => {
            return item.daily[0].temp.max
        }),
    )
    const minTemp = Math.min(
        ...currObj.weather.map((item) => {
            return item.daily[0].temp.min
        }),
    )
    map.data.forEach(function (feature) {
        // if (feature.getGeometry().getType() === 'Polygon') {
        //     feature.getGeometry().forEachLatLng(function(latlng) {
        //         bounds.extend(latlng);
        //     });
        // } else
        if (feature.getGeometry().getType() === 'Point') {
            const todayTempCeil = currObj.weather[idx].daily[0].temp.max
            const todayTempFloor = currObj.weather[idx++].daily[0].temp.min
            const todayTemp = (todayTempCeil + todayTempFloor) / 2
            const LatLng = feature.getGeometry().get()
            const marker = new google.maps.Marker({
                position: LatLng,
                map: map,
                animation: google.maps.Animation.DROP,
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
            markers.push(marker)
            // remove previous markers from map.data
            map.data.remove(feature)
        }
    })
}

// Sets the map on all markers in the array.
const setMapOnAll = (map) => {
    markers.forEach((marker) => marker.setMap(map))
}

// Removes the markers from the map, but keeps them in the array.
export const clearMarkers = () => {
    markers.forEach((marker) => marker.setVisible(false))
    setMapOnAll(null)
    markers = []
}

// Shows any markers currently in the array.
export const showMarkers = () => {
    markers.forEach((marker) => marker.setVisible(true))
    setMapOnAll(map)
}
