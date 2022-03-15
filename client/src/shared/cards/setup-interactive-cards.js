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
      tippy('.card', {
        content: "I'm a Tippy tooltip!",
      });
      return resolve('### function "setupInteractiveCards" run successfully')
    } catch (error) {
      console.log(
        error.message
      )
      return reject(new Error('### function "setupInteractiveCards" failed'))
    }
  })
}
