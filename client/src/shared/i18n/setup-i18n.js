import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'
import locI18next from "loc-i18next"
import { getCookies } from './helpers/get-cookies'
import { refreshTrans } from "./helpers/refresh-translations"
import { langSelect } from './lang-select'


export const setupI18n = async () => {
  window.langSelect = langSelect
  const cookizz = getCookies()
  return new Promise(function (resolve, reject) {
    try {
      i18next
        .use(HttpApi)
        .use(LanguageDetector)
        .init({
          fallbackLng: 'en-US',
          debug: ['development', 'localhost'].includes(process.env.NODE_ENV),
          ns: ['common'],
          defaultNS: 'common',
          backend: {
          // load from i18next-gitbook repo
            loadPath: '/locales/{{lng}}/common.json',
            crossDomain: true
          }
        }).then(function(t) {
          if (cookizz.locale) {
            i18next.changeLanguage(cookizz.locale).then((t) => {
              const localize = locI18next.init(i18next, { selectorAttr:'data-trans' })
              refreshTrans(localize)
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
            })
          }
        })
      resolve('### function "setupI18n" run successfully')
    } catch (error) {
      reject(new Error(`### function "setupI18n" failed with error ${error.message}`))
    }
  })
}
