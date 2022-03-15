/**
 * This style Cards in a way or another
 */
import tippy from 'tippy.js';
import { LIS } from '../../helpers/lis';
export const setupInteractiveCards = async () => {
  return new Promise(function (resolve, reject) {
    if (!LIS.classExists(['card', 'card-body'])) {
      return resolve('### function "setupInteractiveCards" ignored well')
    }
    
    try {
      const instances = tippy('.deactivated', {
        content: "Deactivated, you can reactivate it again!",
      })
      const instances2 = tippy('.notapproved', {
        content: "Not yet approved, wait for approval!",
      })
      return resolve('### function "setupInteractiveCards" run successfully')
    } catch (error) {
      console.log(
        error.message
      )
      return reject(new Error('### function "setupInteractiveCards" failed'))
    }
  })
}
