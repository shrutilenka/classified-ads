// import { LIS } from '../../helpers/lis'
import { Notyf } from 'notyf'
import { getCookies } from './helpers/get-cookies'
export const setupTips = async () => {
  return new Promise(function (resolve, reject) {
    try {
      // TODO
      console.log(Notyf)
      console.log('Im here but wip')
      const cookizz = getCookies()
      const lang = cookizz.locale
      resolve('### function "setupTips" run successfully')
    } catch (error) {
      reject(new Error(`### function "setupTips" failed with error ${error.message}`))
    }
  })
}
