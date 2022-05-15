
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Sync data @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { markRequiredInputs, updatePostPostInputs } from './ReactiveUI/constraints'
import { renderComments, renderTopByDiv, renderTopSearches, renderTopTags } from './renderers/renderer'
export const renderShared = async () => {
  return new Promise(function (resolve, reject) {
    try {
      if (window.__section__) {
        renderTopTags(window.__section__)
      }
      renderTopSearches()
      renderTopByDiv()
      renderComments()
      markRequiredInputs()
      updatePostPostInputs()
      return resolve('### function "renderShared" run successfully')
    } catch (error) {
      console.log(
        'EJS rendering error | ERROR: ',
        error.message
      )
      return reject(new Error('### function "renderShared" failed'))
    }
  })
}


