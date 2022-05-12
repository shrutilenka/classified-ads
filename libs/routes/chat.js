const { v4: uuidv4 } = require('uuid')
const Xorc = require('../services/helpers').Xorc
var xorc = new Xorc(99)
const mongoMem = require('../services/mongo-mem')

async function routes (fastify, options) {

    const channels = new Map();

    fastify.addHook('preValidation', async (request, reply) => {
        // check if the request is authenticated
        const isAuthenticated = fastify.wsauth(request)
        if (!isAuthenticated) {
            await reply.code(401).send("not authenticated");
        }
    })

    fastify.get('/ping/*', { websocket: true }, (connection, request) => {
        connection.socket.id = uuidv4()
        const user = fastify.wsauth(request)
        // Client connect
        console.log(`Browser connected ${connection.socket.id}`)
        console.log(`Client connected ${user}`)
        // const channel = xorc.decrypt(request.query.channel)
        const channel = request.query.channel
        console.log(`Channel identified ${channel}`)
        if(validChannel(channel, user)) {
            addToChannel(channel, connection)
        }else{
            console.log('something fishy kick him out')
        }
        // Client message
        connection.socket.on('message', message => {
            console.log(`Client message: ${message}`)
        })
        // Client disconnect
        connection.socket.on('close', () => {
            console.log('Client disconnected')
        })
        
        // New user
        broadcast({
            sender: '__server',
            message: `${user} joined`
        });
        // Leaving user
        connection.socket.on('close', () => {
            broadcast({
                sender: '__server',
                message: `${user} left`
            });
        });
        // Broadcast incoming message
        connection.socket.on('message', (message) => {
            message = JSON.parse(message.toString());
            broadcast({
                sender: user,
                ...message
            });
        });
    })

    function validChannel(channel, user) {
        let [claimedUser, author, thread] = channel.split('-')
        return user === claimedUser && mongoMem.isAuthor(thread, author)
    }

    function addToChannel(channel, connection){
        if(channels.has(channel)) {
            if(channels.get(channel).length == 0)
                channels.set(channel, [connection])
            else
                channels.get(channel).push(connection)
        } else {
            channels.set(channel, [connection])
        }
    }
    function broadcast(message) {
        // TODO: filter with the right channels
        for(let client of fastify.websocketServer.clients) {
            client.send(JSON.stringify(message))
        }
    }
}

module.exports = routes