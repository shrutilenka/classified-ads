import { LIS } from '../../../helpers/lis.js'
import { channelSelect } from '../helpers/dom.js'
import { addressedChannel, sockets, thread } from './state.js'

const append = (msg) => (LIS.id('chat').innerHTML += `<div><b>${msg.sender}:&nbsp;</b>${msg.message}</div>`)

export const newSocket = () => {
    sockets[addressedChannel] = new WebSocket(
        `ws://${window.location.host}/chat/ping/?channel=${addressedChannel}`,
    )
    sockets[addressedChannel].onmessage = (message) => {
        message = JSON.parse(message.data)
        append(message)
    }

    LIS.id('messenger').addEventListener('keyup', (e) => {
        if (e.key === 'Enter' /* || e.keyCode === 13 */) {
            sockets[addressedChannel].send(JSON.stringify({ message: e.target.value }))
            e.target.value = ''
        }
    })
}

export const getChannels = () => {
    const channels = LIS.id('channels')
    if (channels) {
        fetch(`/listings/id/${thread}/channels`)
            .then((response) => response.json())
            .then((data) => {
                data.channels.forEach((channel) => {
                    var ul = LIS.id('channels box')
                    var li = document.createElement('li')
                    if (channel === notesChannel) li.style = 'color: red'
                    li.appendChild(document.createTextNode(channel))
                    li.addEventListener('click', channelSelect(channel, ul), false)
                    ul.appendChild(li)

                    // let btn = document.createElement("button");
                    // btn.innerHTML = "Submit";
                    // btn.type = "submit";
                    // btn.name = "formBtn";
                    // channels.appendChild(btn);
                })
                console.log(`channels ${data}`)
            })
    }
}
