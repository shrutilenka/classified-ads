// import { LIS } from '../../helpers/lis'
import introJs from "intro.js";
// import {
//   __ar_translations,
//   __en_translations,
//   __fr_translations
// } from '../../data/translations'
import { getCookies } from './helpers/get-cookies';
export const setupTour = async () => {
  return new Promise(function (resolve, reject) {
    try {
      // TODO
      console.log(introJs)
      console.log('Im here but wip')
      const cookizz = getCookies()
      const lang = cookizz.locale
      resolve('### function "setupTour" run successfully')
    } catch (error) {
      reject(new Error(`### function "setupTour" failed with error ${error.message}`))
    }
  })
}
