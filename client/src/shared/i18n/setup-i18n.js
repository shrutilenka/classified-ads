import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'
import locI18next from 'loc-i18next'
import { getCookies } from '../../helpers/get-cookies.js'
import { refreshTrans } from './helpers/refresh-translations.js'
import { langSelect } from './lang-select.js'

export const setupI18n = async () => {
    const selectElement = document.querySelector('#langSelect')
    selectElement.addEventListener('change', (event) => {
        const lang = event.target.value
        langSelect(lang)
    })

    const cookies = getCookies()
    return new Promise(function (resolve, reject) {
        try {
            i18next
                .use(HttpApi)
                .use(LanguageDetector)
                .init({
                    fallbackLng: process.env.DEFAULT_LANG,
                    debug: ['development', 'localhost'].includes(process.env.NODE_ENV),
                    ns: ['common'],
                    defaultNS: 'common',
                    backend: {
                        // load from i18next-gitbook repo
                        loadPath: '/locales/{{lng}}/common.json',
                        crossDomain: true,
                    },
                    cookiename: 'locale',
                    detection: {
                        order: ['cookie'],
                        lookupCookie: 'locale',
                        caches: ['cookie'],
                    },
                    // cache: {
                    //   enabled: true,
                    // },
                    // load: 'languageOnly',
                })
                .then(function (t) {
                    if (cookies.locale) {
                        i18next.changeLanguage(cookies.locale).then((t) => {
                            const localize = locI18next.init(i18next, { selectorAttr: 'data-trans' })
                            refreshTrans(localize)
                            // TODO: seems not to be working sometimes !
                            document.documentElement.setAttribute('lang', cookies.locale)
                            document.body.setAttribute('lang', cookies.locale)
                            if (cookies.locale === 'ar') {
                                document.body.setAttribute('dir', 'rtl')
                            }
                            const langOptions = document.getElementsByTagName('option')
                            const opt = [...langOptions].find((opt) => opt.value === cookies.locale)
                            opt.selected = 'selected'
                            console.log('SET LANGUAGE TO: ' + cookies.locale)
                        })
                    }
                })
            resolve('### function "setupI18n" run successfully')
        } catch (error) {
            reject(new Error(`### function "setupI18n" failed with error ${error.message}`))
        }
    })
}
