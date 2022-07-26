import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import config from '../../configuration.js'
import constraints from '../constraints/constraints.js'
import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/blabla.js'
import { ops as helpers } from '../services/helpers.js'
import Mailer from '../services/mailer.js'
import queries from '../services/mongo.js'

const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null])
// Encapsulates routes: (Init shared variables and so)
async function routes(fastify, options) {
    const { db } = fastify.mongo
    const { redis } = fastify

    const QInstance = new queries(db, redis)
    let { auth, adminAuth, softAuth } = authAdapter(fastify)

    const dbName = 'listings_db'
    const JWT_SECRET = process.env.JWT_SECRET
    const COOKIE_NAME = config('COOKIE_NAME')
    const mongoURL = config('MONGODB_URI', { dbName })
    const loginSchema = constraints[process.env.NODE_ENV].POST.login.schema

    // const mailer = Mailer.getInstance(null)
    fastify.decorateReply('blabla', blabla)

    /* GET login page. */
    fastify.get('/login', function (req, reply) {
        reply.blabla([{}, 'login', 'login'], req)
    })

    /* GET subscribe page. */
    fastify.get('/signup', function (req, reply) {
        reply.blabla([{}, 'signup', 'signup'], req)
    })

    /* GET reset page. */
    fastify.get('/reset', function (req, reply) {
        reply.blabla([{}, 'reset', 'reset'], req)
    })
    /* GET logout. */
    fastify.get('/logout', (request, reply) => {
        reply.setCookie(COOKIE_NAME, {})
        request.flash('success', 'Successfully logged out')
        reply.redirect('/')
    })

    fastify.post('/login', { schema: loginSchema, attachValidation: true }, async function (request, reply) {
        if (request.validationError) {
            reply.blabla([{}, 'login', 'VALIDATION_ERROR'], request)
            return reply
        }
        const { username, password } = request.body
        const user = await QInstance.getUserById(username)
        if (!user) {
            reply.blabla([{}, 'login', 'INCORRECT_CREDENTIALS'], request)
            return reply
        }
        try {
            const isMatch = await bcrypt.compare(password, user.passhash)
            if (!isMatch) {
                reply.blabla([{}, 'login', 'INCORRECT_CREDENTIALS'], request)
                return reply
            } else if (!user.isVerified) {
                reply.blabla([{}, 'login', 'USER_UNVERIFIED'], request)
                return reply
            } else {
                const token = jwt.sign({ username: username, role: user.role }, JWT_SECRET)
                reply.setCookie(COOKIE_NAME, token)
                // this.user = username
                if (request.headers.referer) {
                    reply.redirect(request.headers.referer)
                    return reply
                } else {
                    request.flash('success', 'Successfully logged in')
                    reply.redirect('/')
                    return reply
                }
            }
        } catch (err) {
            console.error(err)
            reply.blabla([{}, 'login', 'SERVER_ERROR'], request)
            return reply
        }
    })

    const signupSchema = constraints[process.env.NODE_ENV].POST.signup.schema
    fastify.post('/signup', { schema: signupSchema, attachValidation: true }, async function (request, reply) {
        if (request.validationError) {
            reply.blabla([{}, 'signup', 'VALIDATION_ERROR'], request)
            return reply
        }
        const { username, password, firstName, secondName } = request.body
        
        // Always 'regular' by default (except user@mail.com for tests)
        const role = username === process.env.ADMIN_EMAIL || username === process.env.ADMIN_EMAIL2 ? 'admin' : 'regular'
        const isVerified = role === 'admin' ? true : false
        try {
            const user = await QInstance.getUserById(username)
            if (user) {
                reply.blabla([{}, 'signup', 'EMAIL_TAKEN'], request)
                return reply
                // throw { statusCode: 400, message: 'EMAIL_TAKEN' }
            } else if (helpers.isBadEmail(username)) {
                reply.blabla([{}, 'signup', 'BAD_EMAIL'], request)
                return reply
            } else {
                let passhash = await bcrypt.hash(password, 10)
                // Temporary user to be able to verify property of identity (email)
                var tempUser = {
                    username: username,
                    token: crypto.randomBytes(16).toString('hex'),
                }
                // Actual user but unverified
                const [err, acknowledged] = await to(
                    QInstance.insertUser({
                        username,
                        password,
                        firstName,
                        secondName,
                        passhash,
                        isVerified,
                        role,
                    }),
                )
                if (err) {
                    reply.blabla([{}, 'signup', 'VALIDATION_ERROR'], request)
                    return reply
                }

                if (role === 'admin') {
                    reply.redirect('/')
                    return reply
                }
                const mailer = await Mailer.getInstance(mongoURL, dbName)
                mailer.sendMail({
                    to: username,
                    todo: 'signup',
                    req: request,
                    data: { token: tempUser.token, host: config('APIHost') },
                })
                await QInstance.insertTmpUser(tempUser)
                reply.blabla([{}, 'message', 'verification'], request)
                return reply
            }
        } catch (err) {
            request.log.error(`signup: ${err.message}`)
            reply.blabla([{}, 'signup', 'SERVER_ERROR'], request)
            return reply
        }
    })

    /* Confirmation of email identity. */
    fastify.get('/confirmation/:token', async function (request, reply) {
        const token = request.params.token
        const tmpUser = await QInstance.getTmpUserByToken(token)
        if (!tmpUser) {
            throw { statusCode: 401, message: 'UNAUTHORIZED' }
        }
        const user = await QInstance.getUserById(tmpUser.username)
        if (!user) {
            throw { statusCode: 401, message: 'INCORRECT_TOKEN' }
        }
        if (user.isVerified) {
            throw { statusCode: 401, message: 'ALREADY_VERIFIED' }
        }
        user.isVerified = true
        await QInstance.updateUser(user)
        reply.redirect('/')
        return
    })

    const resetSchema = constraints[process.env.NODE_ENV].POST.reset.schema
    fastify.post(
        '/reset',
        { schema: resetSchema, preHandler: auth, attachValidation: true },
        async function (request, reply) {
            if (request.validationError) {
                reply.blabla([{}, 'reset', 'VALIDATION_ERROR'], request)
                return reply
            }
            const currentUser = req.params.username
            const { password } = request.body
            const user = await QInstance.getUserById(currentUser)
            // This must never happen really
            if (!user) {
                reply.blabla([{}, 'reset', 'SERVER_ERROR'], request)
                return reply
            }
            try {
                let passhash = await bcrypt.hash(password, 10)
                user.passhash = passhash
                const [err, acknowledged] = await to(QInstance.updateUser(user))
                if (err) {
                    reply.blabla([{}, 'reset', 'VALIDATION_ERROR'], request)
                    return reply
                }
                request.flash('success', 'Successfully updated password')
                reply.redirect('/')
                return reply
            } catch (err) {
                req.log.error(`reset: ${err.message}`)
                reply.blabla([{}, 'reset', 'SERVER_ERROR'], request)
                return reply
            }
        },
    )
}

export default routes
