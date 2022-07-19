/**
 * This style Cards in a way or another
 */
import { LIS } from '../../helpers/lis.js'
const __context__ = window.__context__

export const setupInteractiveNotifications = async () => {
    return new Promise(function (resolve, reject) {
        if (['messages'].indexOf(__context__) < 0) {
            return resolve('### function "setupInteractiveNotifications" ignored well')
        }
        if (!LIS.classExists(['card', 'card-body'])) {
            return resolve('### function "setupInteractiveNotifications" ignored well')
        }

        try {
            const threads = Array.from(document.getElementsByClassName('notifications')[0].children)
                .filter((node) => node.classList.contains('thread'))
                .map((node) => node.classList[node.classList.length - 1])
            console.log(threads)
            return resolve('### function "setupInteractiveNotifications" run successfully')
        } catch (error) {
            return reject(new Error('### function "setupInteractiveNotifications" failed'))
        }
    })
}
