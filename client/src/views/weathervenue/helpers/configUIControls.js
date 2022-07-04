import { Client } from "@googlemaps/google-maps-services-js";
import { state } from "../state.js";
import isMobile from "./isMobile.js";
import { ops } from "./routines.js";
const client = new Client({});
function __class (cls) { return document.getElementsByClassName(cls) }
// Instantiate new UI controls for DOM page or Google map. Configure UI controls or retrieve present UI controls when they exist.
/**
 * darkSwitch
 * heatmap slider
 * new google.maps.places.Autocomplete
 * panButton and geolocation
 */
 export const configUIControls = () => {
    // First time visit: style map night or regular based on earlier preferences
    const darkThemeSelected =
        localStorage.getItem('darkSwitch') !== null && localStorage.getItem('darkSwitch') === 'dark'
    darkThemeSelected ? ops.styleItDark() : ops.styleItWhite()
    // Define on toggle behavior.
    google.maps.event.addDomListener(LIS.id('darkSwitch'), 'click', function () {
        const toggle =
            localStorage.getItem('darkSwitch') !== null && localStorage.getItem('darkSwitch') === 'dark'
        toggle ? ops.styleItWhite() : ops.styleItDark()
    })

    // Slider
    const slider = LIS.id('formControlRange')
    const sliderForm = LIS.id('formControlRange0')
    let moving
    if (!isMobile) {
        state.map.controls[google.maps.ControlPosition.TOP_LEFT].clear()
        state.map.controls[google.maps.ControlPosition.TOP_LEFT].push(sliderForm)
    }
    slider.oninput = function () {
        $('#rangeval').html(`Day ${slider.value}`)
        moving = populateHeatMap(slider.value - 1)
        if (!moving) {
            slider.value = 1
            $('#rangeval').html('Day 1')
        }
    }

    // Create the autocompletion search bar if does not exist already
    let input = LIS.id('pac-input')
    if (input == null) {
        const div = document.createElement('INPUT')
        div.id = 'pac-input'
        div.className = 'controls'
        div.type = 'text'
        div.placeholder = 'Enter a location'
        document.body.appendChild(div)
        input = LIS.id('pac-input')
    }
    if (!state.autocomplete) {
        
        state.autocomplete = client.placeQueryAutocomplete(input, _autocompleteOptions)
        state.map.controls[google.maps.ControlPosition.TOP_CENTER].clear()
        state.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input)
        state.autocomplete.bindTo('bounds', state.map)
        // Specify just the place data fields that you need.
        state.autocomplete.setFields(['place_id', 'geometry', 'name'])
    }

    // Geolocation
    currentMarked = 'geolocated'
    // Create Geolocation button if it does not exist
    const panButton = __class('custom-map-control-button')[0]
    if (panButton) {
        return
    }

    const infoWindow = new google.maps.InfoWindow()
    const locationButton = document.createElement('button')
    locationButton.textContent = 'Go to Current Location'
    locationButton.classList.add('custom-map-control-button')
    locationButton.setAttribute('type', 'submit')
    state.map.controls[google.maps.ControlPosition.TOP_RIGHT].clear()
    state.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locationButton)
    locationButton.addEventListener('click', () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    infoWindow.setPosition(pos)
                    infoWindow.setContent('Location found.')
                    infoWindow.open(state.map)
                    state.map.setCenter(pos)
                    pos.name = 'Current place'
                    nearbyTriggeredRequest(pos)
                    LIS.id('imgGrid').innerHTML = ''
                    showAlertsList(currObj)
                },
                () => {
                    handleLocationError(true, infoWindow, state.map.getCenter())
                },
            )
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, state.map.getCenter())
        }
    })
}

// When browser doesn't support Geolocation
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos)
    infoWindow.setContent(
        browserHasGeolocation
            ? 'Error: The Geolocation service failed.'
            : "Error: Your browser doesn't support geolocation.",
    )
    infoWindow.open(state.map)
}
