/*
  'main.js' has access to DOM objects and runs on every page.
  This is why it should be safe because
  pages contain different HTML elements

  GLOBAL VARIABLES besides DOM objects are
  coming sequentially from imported scripts
  before 'main.js' is imported. These are variables renamed

  - pell -> __pell: https://github.com/jaredreich/pell
  - new Tagify: https://github.com/yairEO/tagify
  - new Notyf: https://github.com/caroso1222/notyf
  - holmes: https://github.com/Haroenv/holmes
  - new autoComplete:  https://github.com/Pixabay/JavaScript-autoComplete
  - new Avatar: https://github.com/MatthewCallis/avatar
  - new FontPicker: https://github.com/samuelmeuli/font-picker
  - SVGInjector: https://github.com/iconic/SVGInjector
*/

// Browser loggings to let hints for different environments
// on important events and actions.
import 'bootstrap/js/dist/dropdown.js';
import 'bootstrap/js/dist/modal.js';
import log from 'loglevel';
import '../node_modules/@popperjs/core/dist/umd/popper-lite.js';
import { consts } from './consts.js';
import { setupShared } from './shared/shared.js';

log.setDefaultLevel(consts.logLevel[process.env.NODE_ENV])
window.log = log
if (['development', 'localhost'].includes(process.env.NODE_ENV)) {
    console.log(`Successes: ${window.__successes__}`)
    console.log(`Errors: ${window.__errors__}`)
    console.log(`Id: ${window.__id__}`)
    console.log(`Latitude: ${window.__lat__}`)
    console.log(`Longitude: ${window.__lng__}`)
    console.log(`Font: ${window.__font__}`)
    console.log(`Initials: ${window.__initials__}`)
    console.log(`Section: ${window.__section__}`)
}

console.log(
    ' compiled under environment:',
    process.env.NODE_ENV,
    '\n',
    'compiled for domain:',
    consts.APIHost[process.env.NODE_ENV],
    '\n',
)

setupShared()
