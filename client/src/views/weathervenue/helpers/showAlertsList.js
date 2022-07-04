import { LIS } from "../../../helpers/lis"
import { state } from "../state"
import isMobile from "./isMobile"

// Create an HTML panel containing weather alerts for all current cities
export const showAlertsList = (currObj) => {
    if (!currObj.isValid) {
        return
    }
    if (isMobile) {
        return
    }
    const cityNames = currObj.weather.map((elem) => {
        return elem.cityName
    })
    const alerts = currObj.weather
        .map((elem, idx) => {
            return elem.alerts ? { city: cityNames[idx], alert: elem.alerts[0] } : undefined
        })
        .filter((elem) => {
            return elem
        })

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
    state.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].clear()
    state.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(panel)

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
