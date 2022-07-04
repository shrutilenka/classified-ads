/**
 * new HeatmapOverlay()
 * map getScale() on weather
 */
let heatmap
let heatMapData
let temp
const getScale = (min, max, value) => Math.floor((5 * (value - min)) / (max - min))
export const populateHeatMap = (day) => {
    if (!currObj.isValid) {
        return false
    }
    let temps = currObj.weather.map((a) => {
        return a.daily[day].temp.min
    })
    const tempsMax = Math.max(...temps)
    const tempsMin = Math.min(...temps)
    temps = temps.map((a) => {
        return getScale(tempsMin, tempsMax, a)
    })
    temp = []
    temp = currObj.weather.map((a, idx) => {
        return { location: new google.maps.LatLng(a.lat, a.lon), weight: temps[idx] }
    })
    heatMapData = new google.maps.MVCArray(temp)
    if (!heatmap) {
        heatmap = new google.maps.visualization.HeatmapLayer({
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
