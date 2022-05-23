import { LIS } from '../../helpers/lis'

export const setupScrollBlink = async () => {
    const id = window.__toFocus__
    return new Promise(function (resolve, reject) {
        try {
            if (!id || !LIS.id(id + '-@@@@@')) {
                return resolve('### function "setupScrollBlink" ignored well')
            }
            const element = LIS.id(id + '-@@@@@')
            element.classList.add('blink')
            element.scrollIntoView({ behavior: 'smooth' })
            resolve('### function "setupScrollBlink" run successfully')
        } catch (error) {
            reject(new Error(`### function "setupScrollBlink" failed with error ${error.message}`))
        }
    })
}
