import { LIS } from "../../../helpers/lis.js"
import CurrentList from "../models/CurrentList.js"
import { state } from "../state.js"
import { initMap } from "../weathervenue.js"
import override from "./overrideFetch.js"
// import { populateHeatMap } from "./populateHeatMap.js"
import { renderForecastDays } from "./renderForecastDays.js"
import { ops } from "./routines.js"


override(fetch)

 export const nearbyRequest = (place) => {
    ops.showLoading() // Block page while loading
    const requestObject = JSON.stringify({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        cityname: place.name,
        language: state.language,
    })
    fetch('wv/nearby/' + requestObject, { localCache: true, cacheTTL: 5 })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            state.currentResponse = new CurrentList(data.data)
            LIS.id('location').innerHTML = state.currentResponse.location
            renderForecastDays(state.currentResponse.dailies)
            initMap(false)
            // populateHeatMap(0)
            ops.hideLoading() // Unblock page
        })
}

// Same as nearbyRequest()
export const nearbyTriggeredRequest = (place) => {
    ops.showLoading() // Block page while loading
    const requestObject = JSON.stringify({
        lat: place.lat,
        lng: place.lng,
        cityname: place.name,
        language: state.language,
    })
    fetch('wv/nearby/' + requestObject, { localCache: true, cacheTTL: 5 })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            console.log(data)
            state.currentResponse = new CurrentList(data.data)
            LIS.id('location').innerHTML = state.currentResponse.location
            renderForecastDays(state.currentResponse.dailies)
            initMap(true)
            ops.hideLoading() // Unblock page
        })
}
