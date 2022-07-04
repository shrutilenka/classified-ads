import { v4 as uuidv4 } from 'uuid'
import { crypto } from '../services/helpers.js'
const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]
const key = crypto.passwordDerivedKey(process.env.PASSWORD)
async function routes(fastify, options) {
    // Channels is a map of { key: socket }
    // Where the key is referred as: channel
    const channels = new Map()

    fastify.addHook('preValidation', async (request, reply) => {
        // check if the request is authenticated
        const isAuthenticated = fastify.wsauth(request)
        if (!isAuthenticated) {
            await reply.code(401).send('not authenticated')
        }
    })
    // Periodically clean dead sockets
    setInterval(function ping() {
        fastify.websocketServer.clients.forEach(function each(ws) {
            if (NODE_ENV < 1) console.log('cleaning dead sockets')
            if (ws.isAlive === false) return ws.terminate()
            ws.isAlive = false
            ws.ping()
        })
    }, 100000)
    // Periodically refresh sockets
    setInterval(function () {
        if (NODE_ENV < 1) console.log('refreshing channels')
        refreshChannels(channels)
    }, 100000)

    // Endpoint for first user landing on chat page (listing)
    fastify.get('/ping/*', { websocket: true }, (connection, request) => {
        connection.socket.id = uuidv4()
        const socket = connection.socket
        const user = fastify.wsauth(request)
        // Client connect
        if (NODE_ENV < 1) console.log(`Browser connected ${socket.id}\nClient connected ${user}`)
        const channel = crypto.decrypt(key, request.query.channel)
        if (NODE_ENV < 1) console.log(`Channel identified ${channel}`)
        if (validChannel(channel, user)) {
            addChannel(channel, socket)
            socket.isAlive = true
            socket.on('pong', heartbeat)
        } else {
            console.log('something fishy kick him out')
            // return for current connection !
            socket.isAlive = false
            connection.destroy()
            return
        }
        // New user
        broadcast({ sender: '__server', message: `${user} joined` }, channel)
        // Leaving user
        socket.on('close', () => {
            socket.isAlive = false
            connection.destroy()
            broadcast({ sender: '__server', message: `${user} left` }, channel)
        })
        // Broadcast incoming message
        socket.on('message', (message) => {
            message = JSON.parse(message.toString())
            broadcast({ sender: user, ...message }, channel)
        })
    })

    function heartbeat() {
        this.isAlive = true
    }

    function validChannel(channel, user) {
        let [, claimedUser] = channel.split(',')
        return user === claimedUser // || isAuthor(thread, author)
    }

    function refreshChannels(channels) {
        Object.keys(channels).forEach((channel) => {
            const sockets = channels.get(channel)
            sockets.slice(0).forEach((socket) => {
                if (!socket.isAlive) sockets.splice(sockets.indexOf(socket), 1)
            })
        })
    }

    function addChannel(channel, socket) {
        if (!channels.get(channel)) channels.set(channel, [socket])
        else channels.get(channel).push(socket)
        socket.channel = channel
    }
    function broadcast(message, channel) {
        // Clients are the same sockets around
        for (let client of fastify.websocketServer.clients) {
            if (client.readyState === 1 && client.channel === channel) client.send(JSON.stringify(message))
        }
    }
}

export default routes
