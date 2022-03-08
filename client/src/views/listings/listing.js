import { setupGravatar } from './gravatar/setup-gravatar';
import { setupImageModal } from './modals/setup-image-modal';
import { undrawOutput } from './undraw-output/undraw-output';
setupGravatar()
setupImageModal()
undrawOutput()

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}


window.postComment = function (commentId) {
  console.log(`Normally replying to ${commentId}`)
  document.getElementById('commentForm').addEventListener('submit', e => {
    e.preventDefault();
    const message = document.querySelector('#message').value;
    console.log(`Effectively replying to ${commentId}`)
    console.log(`Message ${message}`)
    postData('/comment/', { message, commentId })
      .then(data => {
        console.log(data); // JSON data parsed by `data.json()` call
        alert(data.msg);
        // if (data.success) return location.reload();
      });
  });
}