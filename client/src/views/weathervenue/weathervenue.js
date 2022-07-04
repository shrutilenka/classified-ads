import { Loader } from "@googlemaps/js-api-loader"
import { LIS } from "../../helpers/lis"
// ONLY EXECUTE THE WHOLE SCRIPT ON index PAGES!!
// LIS.id('date') is a test to assure that 'GMap.js' is called only in index page. Because it is also included in all other pages with no need in 'after_body.ejs'
const today = new Date().toDateString()
LIS.id('date').innerHTML = today

// Global variables
// 'js_variables.js' ==> 'GMap.js'
// _myStorage, _styles, _isMobile, _autocompleteOptions
// _styleItDark(), _styleItWhite(), _showLoading(), _hideLoading(),
// _setWithExpiry(), _getWithExpiry()

// 'lang_mappings.js' and 'html_holders.js' ==> 'GMap.js'
// AqiCard, TemperatureCard, _weekdaysLangs(), _aqiLangs(), _picturesLangs()

// 'accessibility.js' ==> 'Gmap.js'
// _fireAccessFunctions()

// MAIN
// Instantiate a map. For first visit, there is no search yet and as a result no center, thus we take passed parameters (language / centerLocation) and decide center
// Refreshes DOM too after response, this is why initMap calls nearbyRequest and nearbyRequest calls initMap back
/**
 * refreshCenter()
 * new google.maps.Map()
 * configUIControls()
 * _initAccessibility()
 * map.data.addGeoJson()
 * showAlertsList()
 * populateHeatMap()
 * renderForecastDays()
 * renderPollution()
 * getPicture()
 * nearbyRequest()
 */

function initMap () {
  refreshCenter()
  // Instantiate the map or clean it if it already exists
  if (!map) {
    const loader = new Loader({
        apiKey: "YOUR_API_KEY",
        version: "weekly",
        // ...additionalOptions,
      });
      
      loader.load().then(() => {
        map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8,
        });
      });
      
    map = new google.maps.Map(LIS.id('map'), {
      center: center,
      zoom: 10,
      rotateControl: false,
      mapTypeControl: false,
      streetViewControl: false
    })
  } else {
    // initMap() being called a second time, clear earlier data
    map.data.forEach(feature => map.data.remove(feature))
    google.maps.event.trigger(map, 'resize')
  }
  configUIControls()
  _initAccessibility(language)
  // Populate current list of cities nearby on the map
  if (currObj.isValid) {
    map.data.addGeoJson(currObj.currentList)
    clearMarkers()
    getMarkers()
    showMarkers()
    map.data.setStyle({
      strokeColor: 'blue'
    })
    // Fit map size to its markers
    const bounds = new google.maps.LatLngBounds()
    map.data.forEach(function (feature) {
      feature.getGeometry().forEachLatLng(function (latlng) {
        bounds.extend(latlng)
      })
    })
    map.fitBounds(bounds)
    map.setCenter(center)
    map.setZoom(11)
    // Show alerts panel
    showAlertsList(currObj)
    populateHeatMap(0)
  }

  // Create the infowindow for the center marker
  const infowindow = new google.maps.InfoWindow()
  const infowindowContent = LIS.id('infowindow-content')
  const infowindowContentPrime = infowindowContent.cloneNode(true)
  infowindow.setContent(infowindowContent)
  const marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP
  })

  let latestClicked = ''
  // marker onclick: populate the forecast data on the HTML cards (renderForecastDays)
  if (markers && markers.length > 0) {
    markers.forEach(marker => {
      marker.addListener('click', () => {
        // console.log(marker.title)
        currentMarked = marker.title
        // Do not render again when the same marker is clicked !
        if (latestClicked !== marker.title) {
          latestClicked = marker.title
        }
        infowindowContentPrime.getElementsByClassName('title')[0].innerHTML = marker.title
        infowindow.close()
        infowindow.setContent(infowindowContentPrime)
        infowindow.open(map, marker)
        toggleBounce()
        if (currObj.isValid) {
          LIS.id('location').innerHTML = marker.title // currObj.location;
          const cityWeather = currObj.weather.find(item => item.cityName === marker.title)
          const cityPollution = currObj.pollution.find(item => item.cityName === marker.title)
          renderForecastDays(cityWeather.daily)
          renderPollution(cityPollution)
        }
      })
      marker.addListener('mousedown', (e) => {
        console.log('mousedown')
      })
      marker.addListener('rightclick', (e) => {
        configURLsControls(marker)
      })
      function toggleBounce () {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null)
        } else {
          markers.forEach(marker_ => {
            marker_.setAnimation(null)
          })
          marker.setAnimation(google.maps.Animation.BOUNCE)
        }
      }
    })
  }

  // Define behavior for possible second searches
  autocomplete.addListener('place_changed', () => {
    if (!first && ((new Date().getTime() - last) < 200)) {
      console.log('quick re-call, ignore.')
      return
    }
    first = false
    last = new Date().getTime()
    infowindow.close()
    const place = autocomplete.getPlace()
    if (!place.geometry) return
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport)
    } else {
      map.setCenter(place.geometry.location)
      map.setZoom(11)
    }

    // Set the position of the marker using the place ID and location.
    marker.setPlace({
      placeId: place.place_id,
      location: place.geometry.location
    })
    marker.setVisible(false)
    infowindowContent.children.namedItem('place-name').textContent = place.name
    // infowindowContent.children.namedItem("place-id").textContent =
    //     place.place_id;
    infowindowContent.children.namedItem('place-address').textContent =
      place.formatted_address
    // infowindow.open(map, marker);
    currentMarked = place.name
    getPicture(place.name)
    nearbyRequest(place)
    refreshDzBorder()
    showAlertsList(currObj)
  })
  // Populate current alerts of all cities on a floating HTML panel on the map
  showAlertsList(currObj)
}

// Called once the user search for a city, look for weather cached data for today (local user time) for the city,
// If not found, create an AJAX request for it
/**
 * _showLoading(), _hideLoading()
 * _getWithExpiry(), _setWithExpiry()
 * "nearby/" is the main API in back-end
 * renderForecastDays()
 * initMap()
 */
function nearbyRequest (place) {
  _showLoading() // Block page while loading
  const requestObject = JSON.stringify({
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng(),
    cityname: place.name,
    language: language
  })
  fetch('nearby/' + requestObject, { localCache: true, cacheTTL: 5 }).then(function (response) {
    return response.json()
  }).then(function (data) {
    currObj = new CurrentList(data.data)
    LIS.id('location').innerHTML = currObj.location
    renderForecastDays(currObj.dailies)
    initMap()
    populateHeatMap(0)
    _hideLoading() // Unblock page
  })
}

// Same as nearbyRequest()
function nearbyTriggeredRequest (place) {
  _showLoading() // Block page while loading
  const requestObject = JSON.stringify({
    lat: place.lat,
    lng: place.lng,
    cityname: place.name,
    language: language
  })
  fetch('nearby/' + requestObject, { localCache: true, cacheTTL: 5 }).then(function (response) {
    return response.json()
  }).then(function (data) {
    currObj = new CurrentList(data.data)
    LIS.id('location').innerHTML = currObj.location
    renderForecastDays(currObj.dailies)
    initMap()
    _hideLoading() // Unblock page
  })
}

// Create an HTML panel containing weather alerts for all current cities
function showAlertsList (currObj) {
  if (!currObj.isValid) {
    return
  }
  if (_isMobile) {
    return
  }
  const cityNames = currObj.weather.map(elem => { return elem.cityName })
  const alerts = currObj.weather.map((elem, idx) => { return elem.alerts ? { city: cityNames[idx], alert: elem.alerts[0] } : undefined }).filter(elem => { return elem })

  let panel = document.createElement('ul')
  // If the panel already exists, use it. Else, create it and add to the page.
  if (LIS.id('panel')) {
    panel = LIS.id('panel')
    panel.style = 'overflow-y: scroll;'
    // If panel is already open, close it
    if (panel.classList.contains('open')) {
      panel.classList.remove('open')
    }
  } else {
    panel.setAttribute('id', 'panel')
    const body = document.body
    body.insertBefore(panel, body.childNodes[0])
  }
  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].clear()
  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(panel)

  // Clear the previous details
  while (panel.lastChild) {
    panel.removeChild(panel.lastChild)
  }

  if (!alerts || alerts.length === 0) {
    panel.style.display = 'none'
    return
  }
  panel.style.display = 'block'
  alerts.forEach((alert) => {
    // Add alert details with text formatting
    const name = document.createElement('li')
    name.classList.add('alert')
    name.textContent = alert.city
    panel.appendChild(name)
    const alertContent = document.createElement('p')
    alertContent.classList.add('alertContent')
    alertContent.textContent = alert.alert.event
    panel.appendChild(alertContent)
  })
  // Open the panel
  panel.classList.add('open')
}

/**
 * new HeatmapOverlay()
 * map getScale() on weather
 */
let heatmap
let heatMapData
let temp
const getScale = (min, max, value) => Math.floor(5 * (value - min) / (max - min))
function populateHeatMap (day) {
  if (!currObj.isValid) {
    return false
  }
  let temps = currObj.weather.map(a => { return a.daily[day].temp.min })
  const tempsMax = Math.max(...temps)
  const tempsMin = Math.min(...temps)
  temps = temps.map(a => { return getScale(tempsMin, tempsMax, a) })
  temp = []
  temp = currObj.weather.map((a, idx) => { return { location: new google.maps.LatLng(a.lat, a.lon), weight: temps[idx] } })
  heatMapData = new google.maps.MVCArray(temp)
  if (!heatmap) {
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatMapData,
      radius: 150,
      opacity: 0.5
    })
    heatmap.setMap(map)
  } else {
    heatmap.set('data', heatMapData)
    // heatmap.set('opacity', 0.5)
    // heatmap.set('radius', 150)
  }
  return true
}

Array.range = function (from, to, step, prec) {
  if (typeof from === 'number') {
    const A = [from]
    step = typeof step === 'number' ? Math.abs(step) : 1
    if (!prec) {
      prec = (from + step) % 1 ? String((from + step) % 1).length + 1 : 0
    }
    if (from > to) {
      while (+(from -= step).toFixed(prec) >= to) A.push(+from.toFixed(prec))
    } else {
      while (+(from += step).toFixed(prec) <= to) A.push(+from.toFixed(prec))
    }
    return A
  }
}

// Create and Update the HTML list of div cards holding a list of weather information for one city in a week
// Fill __currentSpokenForecast with a transcript for Weather forecast
// hueColors: calculated background color based on the current tempreture and all weather average
let lastIcon
let todayWeather
function renderForecastDays (dailies) {
  // console.log("renderForecastDays");
  // console.log(JSON.stringify(dailies));
  dailies.sort(function (first, second) {
    return second.dt - first.dt
  })
  const weekdayNames = _weekdaysLangs(language)
  lastIcon = `url(https://openweathermap.org/img/wn/${dailies[dailies.length - 1].weather[0].icon || 'na'}.png)`
  const choiceTheme = localStorage.getItem('themeSwitch') !== null && localStorage.getItem('themeSwitch') === 'true'
  if (choiceTheme) {
    document.body.style.backgroundImage = lastIcon
    document.documentElement.style.backgroundImage = lastIcon
  }
  LIS.id('forecast-items').innerHTML = ''
  const maxTemp = Math.max(...dailies.map((item) => { return item.temp.max }))
  const minTemp = Math.min(...dailies.map((item) => { return item.temp.min }))
  dailies.forEach(function (period, co) {
    const card = new TemperatureCard(language, period, maxTemp, minTemp, currentMarked, co)
    LIS.id('forecast-items').insertAdjacentHTML('afterbegin', card.html())
  })
  window.todayWeather = dailies[0].weather[0].description
  // const minMaxBtn = '<div class="text-center"><button type="button" class="btn btn-light" id="minmax" onclick="minMax()"><i class="bi bi-thermometer"></i><i class="bi bi-thermometer-high"></i></button></div>'
  // LIS.id('forecast-items').insertAdjacentHTML('beforebegin', minMaxBtn)

  dailies.reverse()
  let __currentSpokenForecast = 'Now, let’s see what the weather is like in ' + __currentSpokenCity + ': '
  dailies.forEach(function (period, key) {
    const toPrecision = x => Number.parseFloat(x).toPrecision(1)
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
        chain = (dailies.length - 1 === key) ? 'Finally, on ' : 'On '
        break
    }
    __currentSpokenForecast += `${chain} ${dayName}, ${d.toDateString().slice(4, 10)}, it feels like ${description} with a maximum temperature of ${toPrecision(maxTempF)}°C and a minimum of ${toPrecision(minTempF)}°. `
  })
}

// Create and Update the HTML div card holding pollution information and scale for one city for today only
function renderPollution (pollution) {
  const aqi = pollution.list[0].main.aqi
  const { co, no, no2 } = pollution.list[0].components
  const today = pollution.list[0].dt
  const card = new AqiCard(language, aqi, today, co, no, no2)
  LIS.id('forecast-items').insertAdjacentHTML('beforeend', card.html())
}

// #getMarkers, #setMapOnAll, #clearMarkers, #showMarkers are helpers to refresh markers.
// Detach old features then attach new markers to map
function getMarkers () {
  if (!currObj.isValid) {
    return
  }
  center = {
    lat: currObj.coordinates[1],
    lng: currObj.coordinates[0]
  }
  // const bounds = new google.maps.LatLngBounds()

  let idx = 0
  const COLORS = ['blue', 'purple', 'green', 'yellow', 'red']
  const getColor = (min, max, value) => COLORS[Math.floor(COLORS.length * (value - min) / (max - min))]

  const maxTemp = Math.max(...currObj.weather.map((item) => { return item.daily[0].temp.max }))
  const minTemp = Math.min(...currObj.weather.map((item) => { return item.daily[0].temp.min }))
  map.data.forEach(function (feature) {
    // if (feature.getGeometry().getType() === 'Polygon') {
    //     feature.getGeometry().forEachLatLng(function(latlng) {
    //         bounds.extend(latlng);
    //     });
    // } else
    if (feature.getGeometry().getType() === 'Point') {
      const todayTempCeil = (currObj.weather[idx].daily[0].temp.max)
      const todayTempFloor = (currObj.weather[idx++].daily[0].temp.min)
      const todayTemp = (todayTempCeil + todayTempFloor) / 2
      const LatLng = feature.getGeometry().get()
      const marker = new google.maps.Marker({
        position: LatLng,
        map: map,
        animation: google.maps.Animation.DROP,
        title: feature.i ? feature.i.name : feature.name,
        iconSrc: `https://maps.google.com/mapfiles/ms/icons/${getColor(minTemp, maxTemp, todayTemp)}-dot.png`
      })
      // console.log('minTemp', minTemp, 'maxTemp', maxTemp, 'todayTemp', todayTemp)
      marker.setIcon(`https://maps.google.com/mapfiles/ms/icons/${getColor(minTemp, maxTemp, todayTemp)}-dot.png`)
      markers.push(marker)
      // remove previous markers from map.data
      map.data.remove(feature)
    }
  })
}

// Sets the map on all markers in the array.
function setMapOnAll (map) {
  markers.forEach(marker => marker.setMap(map))
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers () {
  markers.forEach(marker => marker.setVisible(false))
  setMapOnAll(null)
  markers = []
}

// Shows any markers currently in the array.
function showMarkers () {
  markers.forEach(marker => marker.setVisible(true))
  setMapOnAll(map)
}

// Get pictures for seached place
/**
 * new google.maps.places.PlacesService
 * _myStorage.getItem(place), _myStorage.setItem(place, urls)
 * populate pictures on featured_pictures div
 */
function getPicture (place) {
  const [success, fail] = _picturesLangs(language)
  LIS.id('imgGrid').innerHTML = ''
  let cache = _myStorage.getItem(place)
  if (cache) {
    cache = JSON.parse(cache)
    for (let i = 0; i < cache.photos.length; i++) {
      LIS.id('imgGrid').innerHTML += '<div class="featured_pictures"><img src="' + cache.photos[i] + '" alt="' + cache.names[i] + '" /></div>'
    }
    return
  }
  const service = new google.maps.places.PlacesService(map)
  const request = {
    location: map.getCenter(),
    radius: '3000',
    query: place,
    type: ['park'] //, 'mosque', 'airport', 'amusement_park', 'art_gallery', 'casino', 'church', 'museum', 'park', 'synagogue', 'tourist_attraction', 'university']
  }
  let called = false
  service.nearbySearch(request, callback)
  // Checks that the PlacesServiceStatus is OK, and adds a marker
  // using the place ID and location from the PlacesService.
  function callback (results, status) {
    if (called) {
      return
    }
    called = true
    LIS.id('gallery').innerHTML = success(place)
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const photos = results.map(elem => { return elem.photos ? elem.photos[0].getUrl() : undefined }).filter(elem => { return elem })
      const names = results.map(elem => { return elem.name })
      if (!photos.length) {
        LIS.id('gallery').innerHTML = fail(place)
        return
      }
      _myStorage.setItem(place, JSON.stringify({ photos: photos, names: names }))
      for (let i = 0; i < photos.length; i++) {
        LIS.id('imgGrid').innerHTML += '<div class="featured_pictures"><img src="' + photos[i] + '" alt="' + names[i] + '" /></div>'
      }
    } else {
      LIS.id('gallery').innerHTML = fail(place)
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    const params = _getScriptParams(['lang', 'centerLocation'])
    language = params[0]
    const centerLocation = params[1]
    const pos = {
      lat: center.lat,
      lng: center.lng
    }
    map.setCenter(pos)
    pos.name = centerLocation.charAt(0).toUpperCase() + centerLocation.slice(1)
    nearbyTriggeredRequest(pos)
    LIS.id('imgGrid').innerHTML = ''
  }, 2000)
}, false)

let borderData
function refreshDzBorder () {
  if (document.location.hash && document.location.hash === '#algeria') {
    setTimeout(() => {
      if (borderData) {
        return
      }
      borderData = new google.maps.Data()
      borderData.loadGeoJson(
        '/data/dza.geojson'
      )
      borderData.setStyle({
        fillColor: 'green',
        fillOpacity: 0.1
      })
      borderData.setMap(map)
    }, 5000)
  }
}
refreshDzBorder()
