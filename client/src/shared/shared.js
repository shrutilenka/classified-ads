import InApp from 'detect-inapp'
import { setupTour } from './accessibility/setupTour.js'
import { setupAdsRotator } from './ads/setup-ads-rotator.js'
import { setupDelimitationsKeywords } from './auto-complete/setup-delimitations-keywords.js'
import { setupUndrawKeywords } from './auto-complete/setup-undraw-keywords.js'
import { setupInteractiveListings } from './cards/setup-interactive-listings.js'
import { setupInteractiveNotifications } from './cards/setup-interactive-notifications.js'
import { setupSadFace } from './collaboration/setup-sad-face.js'
import { setupPell } from './editor/setup-pell.js'
import { setupFavorites } from './favorites/favorites.js'
import { setupScrollBlink } from './focus/scroll&blink.js'
// import { setupFontPicker } from './fonts/setup-font-picker'
import { dateFromObjectId } from './formatters/date-from-objectId.js'
import { setupI18n } from './i18n/setup-i18n.js'
import { loadFile } from './load-file/load-file.js'
import { country } from './maps/create-maps/state.js'
import { setupMaps } from './maps/setup-maps.js'
import { setupAutoComplete } from './search/setup-autocomplete.js'
import { setupHolmes } from './search/setup-holmes.js'
import { renderShared } from './syncing/render-json.js'
import { setupInputTags } from './tags/setup-input-tags.js'
import { runToasts } from './toasts/toasts.js'

/**
 * Fulfill promises on phone all other devices
 * Also crushes if one or all fail depending on environment
 * production is more permissive for fails than local/dev
 */
export const setupShared = () => {
    const log = window.log
    log.info('Logging setup shared')
    const toArray = (a) => (Array.isArray(a) ? a : [a])
    const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera)
    let functions = [
        [setupI18n, true],
        [setupHolmes, true],
        [setupAutoComplete, true],
        [setupPell, true],
        [setupInputTags, true],
        // buggy
        // [setupFontPicker, true],
        // [setupLeaflet, true],
        // [setupDelimitationsKeywords, true], must run after loading country state
        [setupUndrawKeywords, true],
        [runToasts, true],
        [setupFavorites, true],
        [setupInteractiveListings, false],
        [setupInteractiveNotifications, true]
        [setupAdsRotator, false],
        [setupTour, false],
        [setupScrollBlink, true],
        [renderShared, true],
        [setupSadFace, false],
        // [tweakBootstrap, true]
    ]
    if (inapp.isMobile) {
        log.info('RUNNING ON A MOBILE DEVICE')
        functions = functions.filter((p) => p[1])
    }
    // Instantiate Promises
    let promises = functions.map((p) => p[0]())

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
    fetch(process.env.STATES_FILE_URL)
        .then((response) => response.json())
        .then((data) => {
            country.states = data
            fetch(process.env.BORDERS_FILE_URL)
                .then((response) => response.json())
                .then((data) => {
                    country.borders = data.features[0].geometry.geometries[0].coordinates
                    setupDelimitationsKeywords()
                    setupMaps()
                })
        })
    
    // TODO: review sockets
    // setupSocket()
    // Global objects
    window.loadFile = loadFile
    window.dateFromObjectId = dateFromObjectId
}
