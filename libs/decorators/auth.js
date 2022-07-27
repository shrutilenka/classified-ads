const NODE_ENV = {
    api: -1,
    localhost: 0,
    production: 1,
}[process.env.NODE_ENV]

export default function authAdapter(fastify) {
    let auth, adminAuth, softAuth
    if (fastify.auth && NODE_ENV > -1) {
        auth = fastify.auth([fastify.verifyJWT('regular')])
        adminAuth = fastify.auth([fastify.verifyJWT('admin')])
        softAuth = fastify.auth([fastify.softVerifyJWT])
    } else if (NODE_ENV === -1) {
        auth = softAuth = fastify.auth([fastify.testVerifyJWT])
    } else {
        auth = softAuth = (fastify, opts, done) => {
            done(new Error('fastify.auth must be present !'))
        }
    }
    return { auth, adminAuth, softAuth }
}
