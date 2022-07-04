import CurrentList from "../models/CurrentList"
import override from "./overrideFetch"
import { populateHeatMap } from "./populateHeatMap"
import { renderForecastDays } from "./renderForecastDays"
import { ops } from "./routines"
override(fetch)

 export const nearbyRequest = (place) => {
    ops.showLoading() // Block page while loading
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
export const nearbyTriggeredRequest = (place) => {
    ops.showLoading() // Block page while loading
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
