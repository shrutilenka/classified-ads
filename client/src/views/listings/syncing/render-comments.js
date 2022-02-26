
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Sync data @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { LIS } from '../../../helpers/lis';
// import { commentsTemplate } from './comments-template'
export const renderComments = () => {
  const comments = LIS.id('comments')
  fetch(`/listings/id/${window.__id__}/comments`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
    });

}
