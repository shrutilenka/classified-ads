
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Sync data @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { markRequiredInputs } from './ReactiveUI/constraints'
import { renderComments, renderTopByDiv, renderTopTags } from './renderers/renderer'
export const renderShared = () => {
  if (window.__section__) {
    renderTopTags(window.__section__)
  }
  renderTopByDiv()
  renderComments()
  markRequiredInputs()
}


