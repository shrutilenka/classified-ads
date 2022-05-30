import { getCookies } from './get-cookies.js'
const geoJSONEncoder = require('../data/geoJSONEncoder')

export const getStateNames = () => {
    const lang = getCookies().locale
    return geoJSONEncoder.getStateNames(lang)
}
