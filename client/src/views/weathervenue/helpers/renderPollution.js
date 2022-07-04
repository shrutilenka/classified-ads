// Create and Update the HTML div card holding pollution information and scale for one city for today only
export const renderPollution = (pollution) => {
    const aqi = pollution.list[0].main.aqi
    const { co, no, no2 } = pollution.list[0].components
    const today = pollution.list[0].dt
    const card = new AqiCard(language, aqi, today, co, no, no2)
    LIS.id('forecast-items').insertAdjacentHTML('beforeend', card.html())
}
