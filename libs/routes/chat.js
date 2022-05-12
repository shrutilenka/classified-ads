const { v4: uuidv4 } = require('uuid')
const Xorc = require('../services/helpers').Xorc
var xorc = new Xorc(99)
const mongoMem = require('../services/mongo-mem')

async function routes(fastify, options) {
    const channels = new Map()

    fastify.addHook('preValidation', async (request, reply) => {
        // check if the request is authenticated
        const isAuthenticated = fastify.wsauth(request)
        if (!isAuthenticated) {
            await reply.code(401).send('not authenticated')
        }
    })

    // const interval = setInterval(function ping() {
    //     wss.clients.forEach(function each(ws) {
    //         if (ws.isAlive === false) return ws.terminate();

    //         ws.isAlive = false;
    //         ws.ping();
    //     });
    // }, 30000);

    fastify.get('/ping/*', { websocket: true }, (connection, request) => {
        connection.socket.id = uuidv4()
        const socket = connection.socket
        const user = fastify.wsauth(request)
        // Client connect
        console.log(`Browser connected ${socket.id}`)
        console.log(`Client connected ${user}`)
        // const channel = xorc.decrypt(request.query.channel)
        const channel = request.query.channel
        console.log(`Channel identified ${channel}`)
        if (validChannel(channel, user)) {
            addToChannel(channel, socket)
            socket.isAlive = true
            socket.on('pong', heartbeat)
        } else {
            console.log('something fishy kick him out')
            // return for current connection !
            socket.isAlive = false
            connection.destroy()
            return
        }
        // Client message
        socket.on('message', (message) => {
            console.log(`Client message: ${message}`)
        })
        // Client disconnect
        socket.on('close', () => {
            console.log('Client disconnected')
        })

        // New user
        broadcast({
            sender: '__server',
            message: `${user} joined`,
        })
        // Leaving user
        socket.on('close', () => {
            socket.destroy()
            broadcast({
                sender: '__server',
                message: `${user} left`,
            })
        })
        // Broadcast incoming message
        socket.on('message', (message) => {
            message = JSON.parse(message.toString())
            broadcast({
                sender: user,
                ...message,
            })
        })
    })

    function heartbeat() {
        this.isAlive = true
    }

    function validChannel(channel, user) {
        let [author, claimedUser, thread] = channel.split('-')
        return user === claimedUser && mongoMem.isAuthor(thread, author)
    }

    function refreshChannels(channels) {
        Object.keys(channels).forEach((channel) => {
            const sockets = channels.get(channel)
            sockets.slice(0).forEach((socket) => {
                if (!socket.isAlive) sockets.splice(sockets.indexOf(socket), 1)
            })
        })
    }

    function addToChannel(channel, socket) {
        if (channels.has(channel)) {
            if (channels.get(channel).length == 0)
                channels.set(channel, [socket])
            else channels.get(channel).push(socket)
        } else {
            channels.set(channel, [socket])
        }
    }
    function broadcast(message) {
        // TODO: filter with the right channels
        for (let client of fastify.websocketServer.clients) {
            client.send(JSON.stringify(message))
        }
    }
}

module.exports = routes
