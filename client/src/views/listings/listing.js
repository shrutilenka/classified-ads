import { LIS } from '../../helpers/lis'
import { setupGravatar } from './gravatar/setup-gravatar'
import { setupImageModal } from './modals/setup-image-modal'
import { undrawOutput } from './undraw-output/undraw-output'

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
  })
  return response.json() // parses JSON response into native JavaScript objects
}


window.postComment = function (commentId) {
  console.log(`Normally replying to ${commentId}`)
  if (!commentId) {
    // replying to thread !!!!!!!
    console.log("replying to thread !!!!!!!")
  } else {
    // blink or something
    const replyingTo = document.getElementById(commentId)
    let start = Date.now() // mémoriser l'heure de début
    let timer = setInterval(function () {
      // combien de temps s'est écoulé depuis le début ?
      let timePassed = Date.now() - start
      if (timePassed >= 2000) {
        clearInterval(timer) // terminer l'animation après 2 secondes
        // draw(0)
        return
      }
      // dessiner l'animation à l'instant timePassed
      draw(timePassed)
    }, 20)
    // eslint-disable-next-line no-inner-declarations
    function draw(timePassed) {
      replyingTo.style.left = timePassed / 5 + '1x'
    }
  }

  function closure() {
    const message = document.querySelector('#message').value
    console.log(`Effectively replying to ${commentId}`)
    console.log(`Message ${message}`)
    const data = commentId ? { message, commentId } : { message }
    console.log('posting data', JSON.stringify(data))
    postData('comment', data)
      .then(res => {
        console.log(res) // JSON res parsed by `res.json()` call
        alert(res.msg)
        // if (res.success) return location.reload()
      })
  }
  if(commentForm) {
    commentForm.addEventListener('submit', e => {
      e.preventDefault()
      closure()
    })
  }
}
const commentForm = LIS.id('commentForm')
if(commentForm) {
  commentForm.addEventListener('submit', e => {
    e.preventDefault()
  })
}