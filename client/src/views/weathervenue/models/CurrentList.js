// CurrentList is a class holder for 'data' object which is the server response,
// containing a list of features, weather, pollution. It should assure a safe instantiation and access
export default class CurrentList {
    constructor (data) {
      if (!this.isFeatures(data) || !this.isWeather(data)) {
        return { isValid: false }
      }
      this.currentList = data
      this.weather = data.weather
      this.pollution = data.pollution
      this.location = data.features[0].properties.name
      this.dailies = data.weather[0].daily
      this.coordinates = data.features[0].geometry.coordinates
      this.isValid = true
    }
  
    isFeatures (data) {
      return data && data.features && data.features.length
    }
  
    isWeather (data) {
      return data && data.weather && data.weather.length
    }
  }