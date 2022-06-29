import { LIS } from '../../../helpers/lis.js'
import { channelSelect } from '../helpers/dom.js'
import { clientSocket } from './state.js'


const { addressedChannel, notesChannel, sockets, thread, messages } = clientSocket
const list = LIS.id('message-list')
const append = (msg) => {
    const li = document.createElement('li')
    li.innerHTML = `<b>${msg.sender}:&nbsp;</b>${msg.message}`
    list.appendChild(li)
}
const endpoint = `ws://${window.location.host}/chat/ping/?channel=`

export const newSocket = () => {
    try {
        sockets[addressedChannel] = new WebSocket(endpoint + addressedChannel)
        sockets[addressedChannel].onerror = function (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error)
        return false
    }

    sockets[addressedChannel].onmessage = (response) => {
        try {
            let message = JSON.parse(response.data)
            if (!messages[addressedChannel]) messages[addressedChannel] = []
            localStorage.setItem(addressedChannel, JSON.stringify(messages[addressedChannel]))
            append(message)
            
        } catch (error) {
            console.log(error)
        }
    }

    LIS.id('messenger').addEventListener('keyup', (e) => {
        if (e.key === 'Enter' /* || e.keyCode === 13 */) {
            sockets[addressedChannel].send(JSON.stringify({ message: e.target.value }))
            e.target.value = ''
        }
    })
    return true
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
