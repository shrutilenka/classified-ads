import { Notyf } from 'notyf'

const __errors__ = window.__errors__
const __successes__ = window.__successes__
const __announcements__ = window.__announcements__

export const runToasts = async () => {
    return new Promise(function (resolve, reject) {
        try {
            const notyfInfo = new Notyf({ types: [{ type: 'info', background: 'blue', icon: false, duration: 9000 }] })
            __errors__.forEach((error) => {
                notyfInfo.error(error)
            })
            __successes__.forEach((success) => {
                notyfInfo.success(success)
            })
            const sometimes = Math.random() < 0.3
            if (__announcements__ && sometimes) {
                __announcements__.forEach((info) => {
                    notyfInfo.open({ type: 'info', message: info })
                })
            }
            return resolve('### function "runToasts" run successfully')
        } catch (error) {
            console.log(error.message)
            return reject(new Error('### function "runToasts" failed'))
        }
    })
}