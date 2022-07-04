import { Loader } from "@googlemaps/js-api-loader"
import { LIS } from "../../helpers/lis"

const today = new Date().toDateString()
LIS.id('date').innerHTML = today

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


// Create and Update the HTML div card holding pollution information and scale for one city for today only
function renderPollution (pollution) {
  const aqi = pollution.list[0].main.aqi
  const { co, no, no2 } = pollution.list[0].components
  const today = pollution.list[0].dt
  const card = new AqiCard(language, aqi, today, co, no, no2)
  LIS.id('forecast-items').insertAdjacentHTML('beforeend', card.html())
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