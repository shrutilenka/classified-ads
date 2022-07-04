// Called once the user search for a city, look for weather cached data for today (local user time) for the city,
// If not found, create an AJAX request for it
/**
 * _showLoading(), _hideLoading()
 * _getWithExpiry(), _setWithExpiry()
 * "nearby/" is the main API in back-end
 * renderForecastDays()
 * initMap()
 */
function nearbyRequest(place) {
    _showLoading() // Block page while loading
    const requestObject = JSON.stringify({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        cityname: place.name,
        language: language,
    })
    fetch('nearby/' + requestObject, { localCache: true, cacheTTL: 5 })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            currObj = new CurrentList(data.data)
            LIS.id('location').innerHTML = currObj.location
            renderForecastDays(currObj.dailies)
            initMap()
            populateHeatMap(0)
            _hideLoading() // Unblock page
        })
}

// Same as nearbyRequest()
function nearbyTriggeredRequest(place) {
    _showLoading() // Block page while loading
    const requestObject = JSON.stringify({
        lat: place.lat,
        lng: place.lng,
        cityname: place.name,
        language: language,
    })
    fetch('nearby/' + requestObject, { localCache: true, cacheTTL: 5 })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            currObj = new CurrentList(data.data)
            LIS.id('location').innerHTML = currObj.location
            renderForecastDays(currObj.dailies)
            initMap()
            _hideLoading() // Unblock page
        })
}
