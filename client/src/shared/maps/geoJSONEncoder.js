// import borders from './borders.min.json'
// import states from './states.min.json'
import { country } from './create-maps/state.js'

// TODO: DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
// DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
// DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
// DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
export function getBorders() {
    return country.borders
}

export function getStates() {
    return country.states.features.map((a) => a.geometry.coordinates[0])
}

// name: required - the name of the region (Default is English)
// name_{lang}: optional - the name of the region (Other languages)
// If feature.properties.name_{lang} doesn't exist, it falls to feature.properties.name (English)
export const getStateNamesByLang = (lang) => {
    switch (process.env.DEPLOYMENT_NAME) {
        case 'fr':
            return country.states.features.map((f) => f.properties.nom)
        case 'dz':
            return lang === 'en'
                ? country.states.features.map((f) => f.properties.name)
                : country.states.features.map((f) => f.properties[`name_${lang}`] || f.properties.name)
        default:
            break
    }
}
