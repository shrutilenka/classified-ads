const { v4: uuidv4 } = require('uuid')

async function routes (fastify, options) {
    fastify.addHook('preValidation', async (request, reply) => {
        // check if the request is authenticated
        const isAuthenticated = fastify.wsauth(request)
        if (!isAuthenticated) {
            await reply.code(401).send("not authenticated");
        }
    })

    fastify.get('/ping', { websocket: true }, (connection, request) => {
        connection.socket.id = uuidv4()
        // Client connect
        console.log(`Client connected ${connection.socket.id}`)
        console.log(`Client connected ${fastify.wsauth(request)}`)
        // Client message
        connection.socket.on('message', message => {
            console.log(`Client message: ${message}`)
        })
        // Client disconnect
        connection.socket.on('close', () => {
            console.log('Client disconnected')
        })
    })
}

module.exports = routes