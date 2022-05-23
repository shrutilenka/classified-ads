import { Notyf } from 'notyf'

const __errors__ = window.__errors__
const __successes__ = window.__successes__
export const runToasts = async () => {
    return new Promise(function (resolve, reject) {
        try {
            const notyf = new Notyf()
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
