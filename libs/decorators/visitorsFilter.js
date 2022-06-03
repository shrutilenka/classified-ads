import isbot from 'isbot'

function isBot(request, reply, done) {
    if (isbot(request.headers['user-agent'])) {
        throw new Error('Please retry later')
    }
    done()
}

export default isBot
