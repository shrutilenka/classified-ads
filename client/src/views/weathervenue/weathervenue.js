import { Loader } from '@googlemaps/js-api-loader'
import { LIS } from '../../helpers/lis.js'
import { configUIControls } from './helpers/configUIControls.js'
import { getPicture } from './helpers/getPicture.js'
import { clearMarkers, getMarkers, showMarkers } from './helpers/map/refresh.js'
import { refreshCenter } from './helpers/refreshCenter.js'
import { renderPollution } from './helpers/renderPollution.js'
import { nearbyRequest, nearbyTriggeredRequest } from './helpers/requests.js'
import { showAlertsList } from './helpers/showAlertsList.js'
import { state } from './state.js'

const today = new Date().toDateString()
LIS.id('date').innerHTML = today

function initMap() {
    refreshCenter()
    // Instantiate the map or clean it if it already exists
    if (!state.map) {
        const loader = new Loader({
            apiKey: 'YOUR_API_KEY',
            version: 'weekly',
            // ...additionalOptions,
        })

        loader.load().then(() => {
            state.map = new google.maps.Map(LIS.id('map'), {
                center: { lat: -34.397, lng: 150.644 },
                zoom: 8,
            })
        })

        state.map = new google.maps.Map(LIS.id('map'), {
            center: state.center,
            zoom: 10,
            rotateControl: false,
            mapTypeControl: false,
            streetViewControl: false,
        })
    } else {
        // initMap() being called a second time, clear earlier data
        state.map.data.forEach((feature) => state.map.data.remove(feature))
        google.maps.event.trigger(state.map, 'resize')
    }
    configUIControls()
    _initAccessibility(state.language)
    // Populate current list of cities nearby on the map
    if (state.currObj.isValid) {
        state.map.data.addGeoJson(state.currObj.currentList)
        clearMarkers()
        getMarkers()
        showMarkers()
        state.map.data.setStyle({
            strokeColor: 'blue',
        })
        // Fit map size to its markers
        const bounds = new google.maps.LatLngBounds()
        state.map.data.forEach(function (feature) {
            feature.getGeometry().forEachLatLng(function (latlng) {
                bounds.extend(latlng)
            })
        })
        state.map.fitBounds(bounds)
        state.map.setCenter(state.center)
        state.map.setZoom(11)
        // Show alerts panel
        showAlertsList(state.currObj)
        populateHeatMap(0)
    }

    // Create the infoWindow for the center marker
    const infoWindow = new google.maps.InfoWindow()
    const infoWindowContent = LIS.id('infoWindow-content')
    const infoWindowContentPrime = infoWindowContent.cloneNode(true)
    infoWindow.setContent(infoWindowContent)
    const marker = new google.maps.Marker({
        map: state.map,
        animation: google.maps.Animation.DROP,
    })

    let latestClicked = ''
    // marker onclick: populate the forecast data on the HTML cards (renderForecastDays)
    if (state.markers && state.markers.length > 0) {
        state.markers.forEach((marker) => {
            marker.addListener('click', () => {
                // console.log(marker.title)
                state.currentMarked = marker.title
                // Do not render again when the same marker is clicked !
                if (latestClicked !== marker.title) {
                    latestClicked = marker.title
                }
                infoWindowContentPrime.getElementsByClassName('title')[0].innerHTML = marker.title
                infoWindow.close()
                infoWindow.setContent(infoWindowContentPrime)
                infoWindow.open(state.map, marker)
                toggleBounce()
                if (state.currObj.isValid) {
                    LIS.id('location').innerHTML = marker.title // state.currObj.location;
                    const cityWeather = state.currObj.weather.find((item) => item.cityName === marker.title)
                    const cityPollution = state.currObj.pollution.find(
                        (item) => item.cityName === marker.title,
                    )
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
            function toggleBounce() {
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null)
                } else {
                    state.markers.forEach((marker_) => {
                        marker_.setAnimation(null)
                    })
                    marker.setAnimation(google.maps.Animation.BOUNCE)
                }
            }
        })
    }

    // Define behavior for possible second searches
    state.autocomplete.addListener('place_changed', () => {
        if (!state.first && new Date().getTime() - state.last < 200) {
            console.log('quick re-call, ignore.')
            return
        }
        state.first = false
        state.last = new Date().getTime()
        infoWindow.close()
        const place = state.autocomplete.getPlace()
        if (!place.geometry) return
        if (place.geometry.viewport) {
            state.map.fitBounds(place.geometry.viewport)
        } else {
            state.map.setCenter(place.geometry.location)
            state.map.setZoom(11)
        }

        // Set the position of the marker using the place ID and location.
        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location,
        })
        marker.setVisible(false)
        infoWindowContent.children.namedItem('place-name').textContent = place.name
        // infoWindowContent.children.namedItem("place-id").textContent =
        //     place.place_id;
        infoWindowContent.children.namedItem('place-address').textContent = place.formatted_address
        // infoWindow.open(map, marker);
        state.currentMarked = place.name
        getPicture(place.name)
        nearbyRequest(place)
        // refreshDzBorder()
        showAlertsList(state.currObj)
    })
    // Populate current alerts of all cities on a floating HTML panel on the map
    showAlertsList(state.currObj)
}

initMap()

document.addEventListener(
    'DOMContentLoaded',
    function () {
        setTimeout(function () {
            const params = _getScriptParams(['lang', 'centerLocation'])
            state.language = params[0]
            const centerLocation = params[1]
            const pos = {
                lat: state.center.lat,
                lng: state.center.lng,
            }
            state.map.setCenter(pos)
            pos.name = centerLocation.charAt(0).toUpperCase() + centerLocation.slice(1)
            nearbyTriggeredRequest(pos)
            LIS.id('imgGrid').innerHTML = ''
        }, 2000)
    },
    false,
)
