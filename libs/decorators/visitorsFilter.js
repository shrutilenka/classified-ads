// import isbot from 'isbot'

function isBot(request, reply, done) {
    // TODO: deal with crawlers ..?
    // if (isbot(request.headers['user-agent'])) {
    //     throw new Error('Please retry later')
    // }
    done()
}

export default isBot
