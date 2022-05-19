import { setupTour } from './accessibility/setupTour';
import { setupAdsRotator } from './ads/setup-ads-rotator';
import { setupDelimitationsKeywords } from './auto-complete/setup-delimitations-keywords';
import { setupUndrawKeywords } from './auto-complete/setup-undraw-keywords';
import { setupInteractiveCards } from './cards/setup-interactive-cards';
import { setupPell } from './editor/setup-pell';
import { setupFavorites } from './favorites/favorites';
import { setupScrollBlink } from './focus/scroll&blink';
// import { setupFontPicker } from './fonts/setup-font-picker'
import { dateFromObjectId } from './formatters/date-from-objectId';
import { setupI18n } from './i18n/setup-i18n';
import { loadFile } from './load-file/load-file';
// import { setupLeaflet } from "./maps/setup-leaflet";
import { setupMaps } from './maps/setup-maps';
import { setupAutoComplete } from './search/setup-autocomplete';
import { setupHolmes } from './search/setup-holmes';
import { renderShared } from './syncing/render-json';
import { setupInputTags } from './tags/setup-input-tags';
import { runToasts } from './toasts/toasts';

const MobileDetect = require('mobile-detect')

/**
 * Fulfill promises on phone all other devices
 * Also crushes if one or all fail depending on environment
 * production is more permissive for fails than local/dev
 */
export const setupShared = () => {
  const log = window.log
  log.info('Logging setup shared')
  const toArray = (a) => Array.isArray(a) ? a : [a]
  const md = new MobileDetect(window.navigator.userAgent)
  // functions to be run everywhere, and others to be run only on big screens
  let functions = [
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
    [setupFavorites, true],
    [setupInteractiveCards, false],
    [setupAdsRotator, false],
    [setupTour, false],
    [setupScrollBlink, true],
    [renderShared, true],
    // [tweakBootstrap, true]
  ]
  if (md.mobile()) {
    log.info('RUNNING ON A MOBILE DEVICE')
    functions = functions.filter(p => p[1])
  }
  // Starts executing
  let promises = functions.map(p => p[0]())

  const logPromises = (results) => {
    log.info('Logging succeeded promises')
    toArray(results).forEach((result) => log.info(result))
  }
  const logErrors = (errors) => {
    log.info('Logging failed promises')
    toArray(errors).forEach((error) => log.info(error.message))
  }

  
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
  // TODO: review sockets
  // setupSocket()
  // Global objects
  window.loadFile = loadFile
  window.dateFromObjectId = dateFromObjectId
}
