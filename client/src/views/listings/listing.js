import { setupGravatar } from './gravatar/setup-gravatar';
import { setupImageModal } from './modals/setup-image-modal';
import { undrawOutput } from './undraw-output/undraw-output';
setupGravatar()
setupImageModal()
undrawOutput()

window.updateCommentId = function (commentId){
  console.log(commentId)
  console.log('wow')
}