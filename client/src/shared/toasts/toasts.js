import { Notyf } from 'notyf'

const __errors__ = window.__errors__
const __successes__ = window.__successes__

export const runToasts = async () => {
    return new Promise(function (resolve, reject) {
        try {
            const notyf = new Notyf({ duration: 4000 })
            __errors__.forEach((error) => {
                notyf.error(error)
            })
            __successes__.forEach((success) => {
                notyf.success(success)
            })
            return resolve('### function "runToasts" run successfully')
        } catch (error) {
            console.log(error.message)
            return reject(new Error('### function "runToasts" failed'))
        }
    })
}

// const notyf = new Notyf({
//     duration: 3000,
// })
// function delayedNotifications(messages, type) {
//     setTimeout(function () {
//         if (type === 'success' && messages[0]) notyf.success(messages[0])
//         if (type === 'error' && messages[0]) notyf.error(messages[0])
//         while (messages.shift()) {
//             delayedNotifications(messages, type)
//         }
//     }, 1000)
// }

// export const runToasts = async () => {
//     return new Promise(function (resolve, reject) {
//         try {
//             delayedNotifications(__errors__, 'error')
//             delayedNotifications(__successes__, 'success')
//             return resolve('### function "runToasts" run successfully')
//         } catch (error) {
//             return reject(new Error('### function "runToasts" failed'))
//         }
//     })
// }
