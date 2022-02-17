const borders = require('./borders.json')
const states = require('./states.json')

// TODO: DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
// DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
// DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
// DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
function getBorders() {
    return borders.features[0].geometry.coordinates[0]
}

function getStates() {
    return states.features.map((a) => a.geometry.coordinates[0])
}

// name: required - the name of the region (Default is English)
// name_{lang}: optional - the name of the region (Other languages)
// If feature.properties.name_{lang} doesn't exist, it falls to feature.properties.name (English)
const getStateNames = (lang) => {
    return lang === 'en'
        ? states.features.map((f) => f.properties.name)
        : states.features.map((f) => f.properties[`name_${lang}`] || f.properties.name)
}

module.exports = { getBorders, getStates, getStateNames }