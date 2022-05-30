import autoComplete from '@tarekraafat/autocomplete.js';
import { getStateNames } from '../../helpers/get-state-names';

export const setupDelimitationsKeywords = async () => {
    return new Promise(function (resolve, reject) {
        if (!document.getElementsByName('div_q').length) {
            return resolve('### function "setupDelimitationsKeywords" ignored well')
        }
        const names = getStateNames()
        // Autocomplete for governmental divisions
        try {
            const autoCompleteJS = new autoComplete({
                selector: '#autoComplete-states',
                placeHolder: 'Divisions...',
                data: {
                    src: names,
                },
                resultItem: {
                    highlight: {
                        render: true,
                    },
                },
            })
            return resolve('### function "setupDelimitationsKeywords" run successfully')
        } catch (error) {
            return reject(new Error('### function "setupDelimitationsKeywords" failed'))
        }
    })
}
