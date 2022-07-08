import autoComplete from '@tarekraafat/autocomplete.js'
import { getStateNames } from '../../helpers/get-state-names.js'

export const setupDelimitationsKeywords = async () => {
    if (!document.getElementsByName('div_q').length) {
        console.log('### function "setupDelimitationsKeywords" ignored well')
    }
    const names = getStateNames()
    // Autocomplete for governmental divisions
    try {
        const autoCompleteJS = new autoComplete({
            selector: '#autoComplete-states',
            // placeHolder: 'Divisions...',
            data: {
                src: names,
            },
            resultItem: {
                highlight: {
                    render: true,
                },
            },
        })
        window.autoCompleteJS = autoCompleteJS
        console.log('### function "setupDelimitationsKeywords" run successfully')
    } catch (error) {
        console.error('### function "setupDelimitationsKeywords" failed')
    }
}
