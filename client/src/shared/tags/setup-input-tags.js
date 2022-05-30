import { getCookies } from '../../helpers/get-cookies.js'
import { newTagify } from './helpers/new-tagify.js'

const inputElm =
    document.querySelector('#donations') ||
    document.querySelector('#skills') ||
    document.querySelector('#events')
let tagifyObj
let tags = {}
const choices = document.getElementsByClassName('tags-lang')

export const setupInputTags = async () => {
    return new Promise(function (resolve, reject) {
        if (!(choices.length === 3) || !inputElm) {
            return resolve('### function "setupInputTags" ignored well')
        }
        // For gender specific datasets ESCOT
        const getTags = (json) => {
            if (json[0].masculine) {
                return json.map((tag) => tag.masculine)
            }
            return json
        }
        const dataURLs = [
            `/data/get_${inputElm.id}_tags_ar`,
            `/data/get_${inputElm.id}_tags_en`,
            `/data/get_${inputElm.id}_tags_fr`,
        ]

        const promises = dataURLs.map((url) => fetch(url).then((y) => y.json()))
        Promise.all(promises)
            .then((arr) => {
                tags['ar'] = getTags(arr[0].tags)
                tags['en-US'] = getTags(arr[1].tags)
                tags['fr'] = getTags(arr[2].tags)
                tagifyPage()
                return resolve('### function "setupInputTags" run successfully')
            })
            .catch((err) => {
                return reject(new Error('### function "setupInputTags" failed'))
            })
        // Tagify the current page based on section and current language
        function tagifyPage() {
            // Default load tags based on user language
            const cookies = getCookies()
            const lang = cookies.locale
            if (tags[lang]) {
                tagifyObj = newTagify(tagifyObj, inputElm, tags[lang])
                tagifyObj.lang = lang
            }
            ;[].forEach.call(choices, function (choice) {
                const lang = choice.value
                choice.onclick = function () {
                    console.log('new language for tags')
                    if (tags[lang] && inputElm) {
                        if (tagifyObj && tagifyObj.lang !== lang) {
                            // tagifyObj.destroy()
                            tagifyObj = newTagify(tagifyObj, inputElm, tags[lang])
                        } else if (!tagifyObj) {
                            tagifyObj = newTagify(tagifyObj, inputElm, tags[lang])
                        }
                        tagifyObj.lang = lang
                    }
                }
            })
        }
    })
}
