/**
 * This style Cards in a way or another
 */
import { LIS } from '../../helpers/lis'
export const tweakBootstrap = async () => {
    return new Promise(function (resolve, reject) {
        if (LIS.elements('collapse').length == 0 || LIS.elements('map').length == 0) {
            return resolve('### function "tweakBootstrap" ignored well')
        }

        try {
            LIS.elements('collapse').forEach((element) => {
                element.addEventListener('hidden.bs.collapse', (event) => {
                    LIS.elements('map').forEach((map) => {
                        setTimeout(() => {
                            try {
                                map.invalidateSize()
                            } catch (error) {
                                console.log(`Refreshing map: ${map.id}`)
                            }
                        }, 200)
                    })
                })
            })
            return resolve('### function "tweakBootstrap" run successfully')
        } catch (error) {
            console.log(error.message)
            return reject(new Error('### function "tweakBootstrap" failed'))
        }
    })
}
