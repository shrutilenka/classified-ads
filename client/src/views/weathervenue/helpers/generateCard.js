import isMobile from "./isMobile"
import shareCard from "./shareCard"

export default generateCard = (cardId) => {
    const toBe = LIS.id(cardId).cloneNode(true)
    const title = `<h3>${cardId.split('-').slice(1, -1).map(a => { return a.charAt(0).toUpperCase() + a.slice(1) }).join('-')}</h3>`
    toBe.setAttribute('id', cardId + '_clone')
    toBe.setAttribute('draggable', false)
    // toBe.style.cursor =''
    toBe.childNodes[1].firstElementChild.setAttribute('href', '')
    toBe.insertAdjacentHTML('afterbegin', title)
    if (isMobile) {
      const button = document.createElement('button')
      button.innerHTML = '<i class="bi bi-share"></i>'
      button.classList.add('btn-sm')
      button.classList.add('btn-light')
      button.onclick = function () {
        shareCard(cardId + '_clone')
        return false
      }
      toBe.appendChild(button)
    }
    return toBe
  }
  