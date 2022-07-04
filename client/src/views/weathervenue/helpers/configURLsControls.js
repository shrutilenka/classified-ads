
// Configure Google map URLs based on user interactions (successive right clicks on markers)
// Called when a marker is right clicked
export const configURLsControls = (marker) => {
    // Change marker icon between normal and black states using marker.setIcon
    const newDest = `${marker.position.lat()},${marker.position.lng()}`
    let controlUI
    if (!directions.start_location) {
      directions.start_location = newDest
      marker.setIcon('https://www.google.com/mapfiles/marker_black.png')
      return
    }
    if (!directions.end_location && (directions.start_location !== newDest)) {
      directions.end_location = newDest
      const link = `https://www.google.com/maps/dir/?api=1&origin=${directions.start_location}&destination=${directions.end_location}&travelmode=driving`
      if (!LIS.id('URL')) {
        controlUI = document.createElement('div')
        controlUI.setAttribute('id', 'URL')
      } else {
        controlUI = LIS.id('URL')
        controlUI.innerHTML = ''
      }
      const a = document.createElement('a')
      const linkText = document.createTextNode('🔗Google Map\'s directions')
      a.appendChild(linkText)
      a.title = 'Google Map'
      a.href = link
      a.target = '_blank'
      a.style.cssText = 'background-color: #2a2a3c; color: #fff'
      controlUI.appendChild(a)
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear()
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlUI)
      marker.setIcon('https://www.google.com/mapfiles/marker_black.png')
      return
    }
    // Refresh DOM for all markers after 'marker.setIcon' has been called on some markers
    markers.forEach(marker_ => {
      // console.log(marker_.iconSrc)
      marker_.setIcon(marker_.iconSrc)
    })
    // Create an URL in map's bottom
    controlUI = LIS.id('URL')
    controlUI.innerHTML = ''
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear()
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlUI)
    directions = { start_location: undefined, end_location: undefined }
  }
  