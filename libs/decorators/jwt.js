const jwt = require('jsonwebtoken')
const config = require('config')

const JWT_SECRET = process.env.JWT_SECRET
const COOKIE_NAME = config.get('COOKIE_NAME')

function verifyJWT(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async function (request, reply) {
        if (!request.cookies) {
            throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
        }
        
        const cookie = request.cookies[COOKIE_NAME]
        const verificationCallback = (err, data) => {
            if (err) {
                throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
            }
            if (roles.length && !roles.includes(data.role)) {
                // user's role is not authorized
                throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
            }
            request.params.username = data.username
        }

        jwt.verify(cookie, JWT_SECRET, verificationCallback)
    }
}

// Soft verification does not block the page from viewing if user is not logged in !!!!
async function softVerifyJWT(request, reply) {
    if (!request.cookies) {
        return
    }
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

module.exports = { verifyJWT, softVerifyJWT }
