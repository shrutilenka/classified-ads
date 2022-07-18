/**
 * This style Cards in a way or another
 */
import tippy from 'tippy.js'
import { LIS } from '../../helpers/lis.js'
import { share } from './share.js'
export const setupInteractiveListings = async () => {
    return new Promise(function (resolve, reject) {
        if (['listings', 'alllistings', 'index'].indexOf(__context__) < 0) {
            return resolve('### function "setupInteractiveListings" ignored well')
        }
        if (!LIS.classExists(['card', 'card-body']) || !document.querySelector('.sharer')) {
            return resolve('### function "setupInteractiveListings" ignored well')
        }

        try {
            const instances = tippy('.deactivated', {
                content: 'Deactivated, you can reactivate it again!',
            })
            const instances2 = tippy('.nonapproved', {
                content: 'Not yet approved, wait for approval!',
            })
            document.querySelector('.sharer').addEventListener('click', function (e) {
                var id = e.target.id,
                    item = e.target
                share(item)
            })
            return resolve('### function "setupInteractiveListings" run successfully')
        } catch (error) {
            return reject(new Error('### function "setupInteractiveListings" failed'))
        }
    })
}
