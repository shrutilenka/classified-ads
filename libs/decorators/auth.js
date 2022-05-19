const NODE_ENV = {
    'api env': -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]

module.exports = function authAdapter(fastify) {
    let auth, adminAuth, softAuth
    if (fastify.auth && NODE_ENV > -1) {
        auth = fastify.auth([fastify.verifyJWT('regular')])
        adminAuth = fastify.auth([fastify.verifyJWT('admin')])
        softAuth = fastify.auth([fastify.softVerifyJWT])
    } else if (NODE_ENV < 0) {
        auth = softAuth = (fastify, opts, done) => {
            done()
        }
    } else {
        auth = softAuth = (fastify, opts, done) => {
            done(new Error('fastify.auth must be present !'))
        }
    }
    return { auth, adminAuth, softAuth }
}
