import { getCookies } from './helpers/get-cookies'
import { jsI18n } from './helpers/vendors/jsi18n'
import { langSelect } from './lang-select'
import {
  __ar_translations,
  __en_translations,
  __fr_translations
} from './translations'

export const setupI18n = () => {
  return new Promise(function (resolve, reject) {
    try {
      jsI18n.addLocale('ar', __ar_translations)
      jsI18n.addLocale('fr', __fr_translations)
      jsI18n.addLocale('en', __en_translations)

      // BASED ON LOCALE SET THE DEFAULT SELECT INPUT OPTION
      const cookizz = getCookies()
      if (cookizz.locale) {
        jsI18n.setLocale(cookizz.locale)
        jsI18n.processPage()
        // document.body.setAttribute('lang', cookizz.locale);
        if (cookizz.locale === 'ar') {
          document.body.setAttribute('dir', 'rtl')
        }
        const langOptions = document.getElementsByTagName('option')
        const opt = [...langOptions].filter(
          (opt) => opt.value === cookizz.locale
        )[0]
        opt.selected = 'selected'
        console.log('SET LANGUAGE TO: ' + cookizz.locale)
      }
      window.langSelect = langSelect
      return resolve('### function "setupI18n" run successfully')
    } catch (error) {
      return reject(new Error(`### function "setupI18n" failed with error ${error.message}`))
    }
  })
}
