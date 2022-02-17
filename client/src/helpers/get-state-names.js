import { getCookies } from '../shared/i18n/helpers/get-cookies'
const geoJSONEncoder = require('../data/geoJSONEncoder')

export const getStateNames = () => {
  const lang = getCookies().locale
  return geoJSONEncoder.getStateNames(lang)
}
