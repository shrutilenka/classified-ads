import { weekdaysLangs } from "../models/translations.js"
import { state } from "../state.js"


// Create and Update the HTML list of div cards holding a list of weather information for one city in a week
// Fill __currentSpokenForecast with a transcript for Weather forecast
// hueColors: calculated background color based on the current temperature and all weather average
let lastIcon
let todayWeather
export const renderForecastDays = (dailies) => {
    // console.log("renderForecastDays");
    // console.log(JSON.stringify(dailies));
    dailies.sort(function (first, second) {
        return second.dt - first.dt
    })
    const weekdayNames = weekdaysLangs(state.language)
    lastIcon = `url(https://openweathermap.org/img/wn/${
        dailies[dailies.length - 1].weather[0].icon || 'na'
    }.png)`
    const choiceTheme =
        localStorage.getItem('themeSwitch') !== null && localStorage.getItem('themeSwitch') === 'true'
    if (choiceTheme) {
        document.body.style.backgroundImage = lastIcon
        document.documentElement.style.backgroundImage = lastIcon
    }
    LIS.id('forecast-items').innerHTML = ''
    const maxTemp = Math.max(
        ...dailies.map((item) => {
            return item.temp.max
        }),
    )
    const minTemp = Math.min(
        ...dailies.map((item) => {
            return item.temp.min
        }),
    )
    dailies.forEach(function (period, co) {
        const card = new TemperatureCard(state.language, period, maxTemp, minTemp, currentMarked, co)
        LIS.id('forecast-items').insertAdjacentHTML('afterbegin', card.html())
    })
    window.todayWeather = dailies[0].weather[0].description
    // const minMaxBtn = '<div class="text-center"><button type="button" class="btn btn-light" id="minmax" onclick="minMax()"><i class="bi bi-thermometer"></i><i class="bi bi-thermometer-high"></i></button></div>'
    // LIS.id('forecast-items').insertAdjacentHTML('beforebegin', minMaxBtn)

    dailies.reverse()
    let __currentSpokenForecast = 'Now, let’s see what the weather is like in ' + __currentSpokenCity + ': '
    dailies.forEach(function (period, key) {
        const toPrecision = (x) => Number.parseFloat(x).toPrecision(1)
        const d = new Date(0)
        d.setUTCSeconds(period.dt)
        const dayName = weekdayNames[d.getDay()] // new Date(period.dateTimeISO).getDay()
        const maxTempF = period.temp.max || 'N/A'
        const minTempF = period.temp.min || 'N/A'
        const description = period.weather[0].description || 'N/A'
        // transcript
        let chain = ''
        switch (key) {
            case 0:
                chain = 'Today is '
                break
            case 1:
                chain = 'Tomorrow is '
                break
            default:
                chain = dailies.length - 1 === key ? 'Finally, on ' : 'On '
                break
        }
        __currentSpokenForecast += `${chain} ${dayName}, ${d
            .toDateString()
            .slice(4, 10)}, it feels like ${description} with a maximum temperature of ${toPrecision(
            maxTempF,
        )}°C and a minimum of ${toPrecision(minTempF)}°. `
    })
}
