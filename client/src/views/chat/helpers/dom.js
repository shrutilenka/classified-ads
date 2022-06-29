import { newSocket } from '../sockets/refresh.js'
import { clientSocket } from '../sockets/state.js'
const { addressedChannel, messages, sockets } = clientSocket
const list = LIS.id('message-list')
const append = (msg) => {
    const li = document.createElement('li')
    li.innerHTML = `<b>${msg.sender}:&nbsp;</b>${msg.message}`
    list.appendChild(li)
}
// On click event and having the complete list
// focus the channel clicked and un-focus others.
export const channelSelect = (channel, ul) => {
    return function (event) {
        let lies = ul.getElementsByTagName('li')
        for (var i = 0; i < lies.length; ++i) {
            lies[i].innerHTML = lies[i].innerHTML.replace('<b>', '').replace('</b>', '')
        }
        let li = event.target
        li.innerHTML = `<b>${li.innerHTML}</b>`
        addressedChannel = channel
        if (localStorage.getItem(addressedChannel))
            messages[addressedChannel].push(JSON.parse(localStorage.getItem(addressedChannel)))
        if (!sockets[addressedChannel]) newSocket()
        else {
            messages[addressedChannel].forEach((message) => {
                append(message)
            })
        }
    }
}

// const createHTML = (txt, tag) => {
//   var element = document.createElement(tag);
//   element.innerHTML = txt;
//   return element;
// }
