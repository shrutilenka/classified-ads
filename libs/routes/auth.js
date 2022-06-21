import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import config from '../../configuration.js'
import constraints from '../constraints/constraints.js'
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

    const JWT_SECRET = process.env.JWT_SECRET
    const COOKIE_NAME = config('COOKIE_NAME')
    const loginSchema = constraints[process.env.NODE_ENV].POST.login.schema

    // const mailer = Mailer.getInstance(null)
    fastify.decorateReply('blabla', blabla)
    fastify.post('/login', { schema: loginSchema, attachValidation: true }, async function (request, reply) {
        if (request.validationError) {
            reply.blabla([{}, 'login', 'VALIDATION_ERROR'], request)
        }
        const { username, password } = request.body
        const user = await QInstance.getUserById(username)
        if (!user) {
            reply.blabla([{}, 'login', 'INCORRECT_CREDENTIALS'], request)
            return
        }
        try {
            const isMatch = await bcrypt.compare(password, user.passhash)
            if (!isMatch) {
                reply.blabla([{}, 'login', 'INCORRECT_CREDENTIALS'], request)
                return
            } else if (!user.isVerified) {
                reply.blabla([{}, 'login', 'USER_UNVERIFIED'], request)
                return
            } else {
                const token = await jwt.sign({ username: username, role: user.role }, JWT_SECRET)
                reply.setCookie(COOKIE_NAME, token)
                // this.user = username
                if (request.headers.referer) {
                    reply.redirect(request.headers.referer)
                    return
                } else {
                    request.flash('success', 'Successfully logged in')
                    reply.redirect('/')
                    return
                }
            }
        } catch (err) {
            console.error(err)
            reply.blabla([{}, 'login', 'SERVER_ERROR'], request)
            return
        }
    })

    const signupSchema = constraints[process.env.NODE_ENV].POST.signup.schema
    fastify.post('/signup', { schema: signupSchema, attachValidation: true }, async function (request, reply) {
        if (request.validationError) {
            reply.blabla([{}, 'signup', 'VALIDATION_ERROR'], request)
            return
        }
        const { username, password } = request.body
        // Always 'regular' by default (except user@mail.com for tests)
        const role = username === 'bacloud14@gmail.com' || username === 'sracer2016@yahoo.com' ? 'admin' : 'regular'
        const isVerified = role === 'admin' ? true : false
        try {
            const user = await QInstance.getUserById(username)
            if (user) {
                reply.blabla([{}, 'signup', 'EMAIL_TAKEN'], request)
                return
                // throw { statusCode: 400, message: 'EMAIL_TAKEN' }
            } else if(helpers.isBadEmail(username)) {
                reply.blabla([{}, 'signup', 'BAD_EMAIL'], request)
                return
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
                        passhash,
                        isVerified,
                        role,
                    }),
                )
                if (err) return reply.blabla([{}, 'signup', 'VALIDATION_ERROR'], request)

                if (role === 'admin') {
                    reply.redirect('/')
                    return
                }
                console.log('signing in')
                Mailer.getInstance(mongoURL, dbName)
                    .then((mailer) => {
                        mailer.sendMail({
                            to: username,
                            todo: 'signup',
                            req: request,
                            data: {
                                token: tempUser.token,
                                host: config('APIHost'),
                            },
                        })
                    })
                    .catch((err) => {
                        req.log.error(`signup/Mailer: ${err.message}`)
                    })

                await QInstance.insertTmpUser(tempUser)
                reply.blabla([{}, 'message', 'verification'], request)
                return
            }
        } catch (err) {
            req.log.error(`signup: ${err.message}`)
            reply.blabla([{}, 'signup', 'SERVER_ERROR'], request)
            return
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

    /* GET login page. */
    fastify.get('/login', async function (req, reply) {
        reply.blabla([{}, 'login', 'login'], req)
    })

    /* GET subscribe page. */
    fastify.get('/signup', async function (req, reply) {
        reply.blabla([{}, 'signup', 'signup'], req)
    })
}

export default routes
