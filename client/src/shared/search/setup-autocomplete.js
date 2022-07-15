/**
 * ADD 'https://tarekraafat.github.io/autoComplete.js/' auto complete
 * MUST EXIST:
 *    input id="autoComplete"
 */
import autoComplete from '@tarekraafat/autocomplete.js'
import { consts } from '../../views/main/consts.js'

export const setupAutoComplete = async () => {
    return new Promise(function (resolve, reject) {
        if (!document.querySelector('input#autoComplete')) {
            return resolve('### function "setupAutoComplete"  ignored well')
        }
        try {
            const autoCompleteJS = new autoComplete({
                selector: '#autoComplete',
                placeHolder: 'Quick search...',
                data: {
                    src: async (query) => {
                        try {
                            // Fetch Data from external Source
                            const source = await fetch(
                                `${consts.APIHost[process.env.NODE_ENV]}/autocomplete/${query}`,
                            )
                            // Data is array of `Objects` | `Strings`
                            const data = await source.json()
                            return data
                        } catch (error) {
                            return error
                        }
                    },
                    // Data 'Object' key to be searched
                    keys: ['_id'],
                },
                cache: true,
                debounce: 300,
                searchEngine: 'loose',
                diacritics: true,
                maxResults: 15,
                threshold: 3,
                resultItem: {
                    highlight: true,
                },
                events: {
                    input: {
                        selection: (event) => {
                            const selection = event.detail.selection.value
                            const keyword = selection._id
                            autoCompleteJS.input.value = keyword
                            window.location.href = `${consts.APIHost[process.env.NODE_ENV]}/keyword/${keyword}`
                        },
                    },
                },
            })
            return resolve('### function "setupAutoComplete" run successfully')
        } catch (error) {
            console.log(
                "Maybe running where there is no input with id = 'autoComplete' in HTML | ERROR: ",
                error.message,
            )
            return reject(new Error('### function "setupAutoComplete" failed'))
        }
    })
}
