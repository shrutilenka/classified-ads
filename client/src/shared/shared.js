// import { setupStretchy } from "./stretchy/setup-stretchy";
import { setupDelimitationsKeywords } from './auto-complete/setup-delimitations-keywords'
import { setupUndrawKeywords } from './auto-complete/setup-undraw-keywords'
import { setupPell } from './editor/setup-pell'
import { setupFavourites } from './favourites/setup-favourites'
// import { setupFontPicker } from './fonts/setup-font-picker'
import { dateFromObjectId } from './formatters/date-from-objectId'
import { setupI18n } from './i18n/setup-i18n'
import { loadFile } from './load-file/load-file'
// import { setupLeaflet } from "./maps/setup-leaflet";
import { setupMaps } from './maps/setup-maps'
import { setupAutoComplete } from './search/setup-autocomplete'
import { setupHolmes } from './search/setup-holmes'
import { setupStickySidebar } from './sticky-sidebar/setup-sticky-sidebar'
import { renderShared } from './syncing/render-json'
import { setupInputTags } from './tags/setup-input-tags'
import { runToasts } from './toasts/toasts'
const MobileDetect = require('mobile-detect')

/**
 * Fulfill promises on phone all other devices
 * Also crushes if one or all fail depending on environment
 * production is more permissive for fails than local/dev
 */
export const setupShared = async () => {
  const log = window.log
  const toArray = (a) => Array.isArray(a) ? a : [a]
  // setupStretchy();
  const md = new MobileDetect(window.navigator.userAgent)
  let promises = [
    [setupI18n, true],
    [setupHolmes, true],
    [setupAutoComplete, true],
    [setupPell, true],
    [setupInputTags, true],
    // buggy
    // [setupFontPicker, true],
    // [setupLeaflet, true],
    [setupDelimitationsKeywords, true],
    [setupUndrawKeywords, true],
    [runToasts, true],
    [setupFavourites, true],
    [setupStickySidebar, false],
  ]
  if (md.mobile()) {
    log.info('RUNNING ON A MOBILE DEVICE')
    promises = promises.filter(p => p[1])
  }
  promises = promises.map(p => p[0]())
  const logPromises = (results) => {
    toArray(results).forEach((result) => log.info(result))
  }
  const logErrors = (errors) => {
    toArray(errors).forEach((error) => log.error(error))
  }
  // Reject as soon as possible for dev environments
  // More permissive for production environment.
  // Counterintuitive huh ?
  if (['development', 'localhost'].includes(process.env.NODE_ENV)) {
    Promise.all(promises)
      .then((results) => logPromises(results))
      .catch((errors) => logErrors(errors))
  } else {
    Promise.allSettled(promises)
      .then((results) => logPromises(results))
      .catch((errors) => logErrors(errors))
  }
  // Other function calls that are not yet promisified
  // because I'm not sure yet what's asynchronous in there
  setupMaps()
  renderShared()
  // TODO: review sockets
  // setupSocket()
  // Global objects
  window.loadFile = loadFile
  window.dateFromObjectId = dateFromObjectId
}
