const config = require('config')

const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const COOKIE_NAME = config.get('COOKIE_NAME')

function verifyJWT(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles]
    }

    return async function (request, reply) {
        if (!request.cookies) {
            reply.redirect('/')
            return
            // throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
        }
        const cookie = request.cookies[COOKIE_NAME]
        const verificationCallback = (err, data) => {
            if (err) {
                reply.redirect('/login')
                return
                // throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
            }
            if (roles.length && !roles.includes(data.role) && data.role !== 'admin') {
                // user's role is not authorized
                reply.redirect('/login')
                return
                // throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
            }
            // If logged user has 'admin' role then let go
            request.params.username = data.username
        }
        jwt.verify(cookie, JWT_SECRET, verificationCallback)
    }
}

// Soft verification does not block the page from viewing if user is not logged in !!!!
async function softVerifyJWT(request, reply) {
    if (!request.cookies) return false
    const cookie = request.cookies[COOKIE_NAME]
    const verificationCallback = (err, data) => {
        if (err) {
            return
        }
        request.params.username = data.username
        return
    }
    jwt.verify(cookie, JWT_SECRET, verificationCallback)
}

function wsauth(request) {
    if (!request.cookies) return false
    const cookie = request.cookies[COOKIE_NAME]
    if (!cookie) return false
    try {
        const decoded = jwt.verify(cookie, JWT_SECRET)
        return decoded.username
    } catch (ex) {
        console.log(ex.message)
        return false
    }
}

module.exports = { verifyJWT, softVerifyJWT, wsauth }
