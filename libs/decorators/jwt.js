import jwt from 'jsonwebtoken'
import config from '../../configuration.js'

const JWT_SECRET = process.env.JWT_SECRET
const COOKIE_NAME = config('COOKIE_NAME')

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
function softVerifyJWT(request, reply, done) {
    if (!request.cookies) return false
    const cookie = request.cookies[COOKIE_NAME]
    const verificationCallback = (err, data) => {
        if (err) {
            return done()
        }
        request.params.username = data.username
        return done()
    }
    jwt.verify(cookie, JWT_SECRET, verificationCallback)
}

const emails = ['user', 'user2', 'user3', 'user4']
// Test verification does not block the page from viewing if user is not logged in !!!!
// Test verification attaches a random testing user to the current session
async function testVerifyJWT(request, reply) {
    request.params.username = `${emails[Math.floor(Math.random() * langs.length)]}@example.com`
}

// JWT verify websocket endoints. This one is synchronous and quick.
function wsauth(request) {
    if (!request.cookies) return false
    const cookie = request.cookies[COOKIE_NAME]
    if (!cookie) return false
    try {
        const decoded = jwt.verify(cookie, JWT_SECRET)
        return decoded.username
    } catch (ex) {
        console.error(ex.message)
        return false
    }
}

export { verifyJWT, softVerifyJWT, testVerifyJWT, wsauth }

