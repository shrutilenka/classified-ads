import { createRequire } from "module";
const require = createRequire(import.meta.url);

const borders = require("./borders.json");
const states = require("./states.min.json");

// TODO: DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
// DECODE YOUR GEOJSON. THIS MIGHT NOT WORK ON YOUR DATA
function getBorders() {
    return borders.features[0].geometry.geometries[0].coordinates
}

function getStates() {
    return states.features.map((a) => a.geometry.coordinates[0])
}

// name: required - the name of the region (Default is English)
// name_{lang}: optional - the name of the region (Other languages)
// If feature.properties.name_{lang} doesn't exist, it falls to feature.properties.name (English)
const getStateNames = (lang) => {
    switch (process.env.APP_NAME) {
        case 'Ici-Annonces':
            return states.features.map((f) => f.properties.nom)
        case 'dz':
            return lang === 'en'
                ? states.features.map((f) => f.properties.name)
                : states.features.map((f) => f.properties[`name_${lang}`] || f.properties.name)
        default:
            break
    }
}

export { getBorders, getStates, getStateNames };
