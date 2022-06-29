import { newSocket } from "../sockets/refresh.js"
import { addressedChannel } from "../sockets/state.js"

export const channelSelect = (channel, ul) => {
    return function (event) {
        let lies = ul.getElementsByTagName('li')
        for (var i = 0; i < lies.length; ++i) {
            lies[i].innerHTML = lies[i].innerHTML.replace('<b>', '').replace('</b>', '')
        }
        let li = event.target
        li.innerHTML = `<b>${li.innerHTML}</b>`
        addressedChannel = channel
        newSocket()
    }
}



// const createHTML = (txt, tag) => {
//   var element = document.createElement(tag);
//   element.innerHTML = txt;
//   return element;
// }

