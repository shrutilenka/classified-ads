import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'
import locI18next from "loc-i18next"
import { i18nextPlugin, showTranslations } from 'translation-check'
import {
  __ar_translations,
  __en_translations,
  __fr_translations
} from '../../data/translations'
import { getCookies } from './helpers/get-cookies'
import { jsI18n } from './helpers/vendors/jsi18n'
import { langSelect } from './lang-select'

export const setupI18n = async () => {
  i18next
    .use(HttpApi)
    .use(LanguageDetector)
    .use(i18nextPlugin)
    .init({
      fallbackLng: 'en-US',
      debug: true,
      ns: ['common'],
      defaultNS: 'common',
      backend: {
        // load from i18next-gitbook repo
        loadPath: '/locales/{{lng}}/common.json',
        crossDomain: true
      }
    }).then(function(t) {
      // initialized and ready to go!
      document.getElementById('output').innerHTML = i18next.t('greetings.title')
      document.getElementById("open-editor").onclick = function (){
        showTranslations(i18next, { // optional options, if not provided it will guess based on your i18next config
          sourceLng: 'en-US',
          targetLngs: ['fr', 'ar'],
          preserveEmptyStrings: false
        })
      }
      const localize = locI18next.init(i18next)
      localize("#btn1")
    })

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
        document.body.setAttribute('lang', cookizz.locale)
        if (cookizz.locale === 'ar') {
          document.body.setAttribute('dir', 'rtl')
        }
        const langOptions = document.getElementsByTagName('option')
        const opt = [...langOptions].find(
          (opt) => opt.value === cookizz.locale
        )
        opt.selected = 'selected'
        console.log('SET LANGUAGE TO: ' + cookizz.locale)
      }
      window.langSelect = langSelect
      resolve('### function "setupI18n" run successfully')
    } catch (error) {
      reject(new Error(`### function "setupI18n" failed with error ${error.message}`))
    }
  })
}
