import { state } from "../state.js"

/**
 * new HeatmapOverlay()
 * map getScale() on weather
 */
let heatmap
let heatMapData
let temp
const getScale = (min, max, value) => Math.floor((5 * (value - min)) / (max - min))
export const populateHeatMap = (day) => {
    if (!state.currentResponse.isValid) {
        return false
    }
    let temps = state.currentResponse.weather.map((a) => {
        return a.daily[day].temp.min
    })
    const tempsMax = Math.max(...temps)
    const tempsMin = Math.min(...temps)
    temps = temps.map((a) => {
        return getScale(tempsMin, tempsMax, a)
    })
    temp = []
    temp = state.currentResponse.weather.map((a, idx) => {
        return { location: new state.google.maps.LatLng(a.lat, a.lon), weight: temps[idx] }
    })
    heatMapData = new state.google.maps.MVCArray(temp)
    if (!heatmap) {
        heatmap = new state.google.maps.visualization.HeatmapLayer({
            data: heatMapData,
            radius: 150,
            opacity: 0.5,
        })
        heatmap.setMap(map)
    } else {
        heatmap.set('data', heatMapData)
        // heatmap.set('opacity', 0.5)
        // heatmap.set('radius', 150)
    }
    return true
}
