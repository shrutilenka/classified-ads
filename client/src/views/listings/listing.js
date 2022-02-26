import { setupGravatar } from './gravatar/setup-gravatar';
import { setupImageModal } from './modals/setup-image-modal';
import { renderComments } from './syncing/render-comments';
import { undrawOutput } from './undraw-output/undraw-output';
setupGravatar()
setupImageModal()
undrawOutput()
renderComments()

let people = ['geddy', 'neil', 'alex'];
let html = window.ejs.render(`<%= people.join(", "); %>`, {people: people});
console.log(html)
