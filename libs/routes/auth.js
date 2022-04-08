require('dotenv').config()
const config = require('config')
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]
const adminEmail = process.env.ADMIN_EMAIL

// Encapsulates routes: (Init shared variables and so)
async function routes(fastify, options) {
    const { db } = fastify.mongo
    const logger = fastify.log
    const queries = require('../services/mongo')
    const QInstance = new queries(db, logger)
    const renderer = require('../services/renderer')
    const { constraints } = require('../constraints/constraints')
    // TODO: replace `reply.view` with reply.blabla([data, route, kind])
    fastify.decorateReply('blabla', function (context) {
        if (NODE_ENV == -1) {
            this.send(context[0])
        } else {
            const userFriendlyMsg = renderer(...context)
            const route = context[1]
            this.view(`/templates/pages/${route}`, userFriendlyMsg)
        }
    })

    let { nodemailer } = fastify
    const bcrypt = require('bcryptjs')
    var crypto = require('crypto')
    const jwt = require('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET
    const COOKIE_NAME = config.get('COOKIE_NAME')
    const loginSchema = constraints[process.env.NODE_ENV].POST.login.schema
    fastify.post(
        '/login',
        { schema: loginSchema },
        async function (request, reply) {
            const username = request.body.username
            const password = request.body.password
            console.log('logging user' + username + ' with password' + password)
            try {
                // const user = await UserCredentials.findOne({username})
                const user = await QInstance.getUserById(username)
                if (!user) {
                    console.log('no user')
                    throw { statusCode: 401, message: 'INCORRECT_CREDENTIALS' }
                }
                try {
                    const isMatch = await bcrypt.compare(
                        password,
                        user.passhash,
                    )
                    if (!isMatch) {
                        console.log('no match')
                        throw {
                            statusCode: 401,
                            message: 'INCORRECT_CREDENTIALS',
                        }
                    } else if (!user.isVerified) {
                        throw { statusCode: 401, message: 'USER_UNVERIFIED' }
                    } else {
                        const token = await jwt.sign(
                            { username: username, role: user.role },
                            JWT_SECRET,
                        )
                        reply.setCookie(COOKIE_NAME, token)
                        // this.user = username
                        if (request.headers.referer) {
                            reply.redirect(request.headers.referer)
                            return
                        } else {
                            reply.redirect('/')
                            return
                        }
                    }
                } catch (err) {
                    console.log(err)
                    throw {
                        statusCode: 500,
                        message: 'Something went wrong! Please try again',
                    }
                }
            } catch (err) {
                throw {
                    statusCode: 500,
                    message: 'Something went wrong! Please try again',
                }
            }
        },
    )

    const loginSchema2 = constraints[process.env.NODE_ENV].POST.login.schema
    fastify.post(
        '/signup',
        { schema: loginSchema2 },
        async function (request, reply) {
            const username = request.body.username
            const password = request.body.password

            // Always 'regular' by default (except user@mail.com for tests)
            const role =
                username === 'bacloud14@gmail.com' ? 'admin' : 'regular'
            const isVerified = role === 'admin' ? true : false
            try {
                const user = await QInstance.getUserById(username)
                if (user) {
                    throw { statusCode: 400, message: 'EMAIL_TAKEN' }
                } else {
                    let passhash
                    try {
                        passhash = await bcrypt.hash(password, 10)
                    } catch (err) {
                        throw {
                            statusCode: 500,
                            message: 'Something went wrong! Please try again',
                        }
                    }
                    // Actual user but unverified
                    const new_user = await QInstance.insertUser({
                        username,
                        password,
                        passhash,
                        isVerified,
                        role,
                    })
                    console.log(username)
                    console.log(new_user)
                    if (role === 'admin') {
                        return
                    }
                    // Temporary user to be able to verify property of identity (email)
                    var tempUser = {
                        username: username,
                        token: crypto.randomBytes(16).toString('hex'),
                    }
                    var mailOptions = {
                        from: adminEmail,
                        to: username,
                        subject: 'Account Verification Token',
                        text:
                            'Hello,\n\n' +
                            'Please verify your account by clicking the link: \nhttp://' +
                            request.headers.host +
                            '/confirmation/' +
                            tempUser.token +
                            '.\n',
                    }
                    nodemailer.sendMail(mailOptions, async (err, info) => {
                        if (err) {
                            console.log(err)
                            // throw {
                            //     statusCode: 500,
                            //     message:
                            //         'Something went wrong! Please try again',
                            // }
                            return
                        }
                        // TODO: insert
                        await QInstance.insertTmpUser(tempUser)
                        reply.redirect('/')
                        return
                    })
                }
            } catch (err) {
                console.log(err)
                throw {
                    statusCode: 500,
                    message: 'Something went wrong! Please try again',
                }
            }
        },
    )

    /* Confirmation of email identity. */
    fastify.get('/confirmation/:token', async function (request, reply) {
        const token = request.params.token
        console.log('verifying token '+token)

        const tmpUser = await QInstance.getTmpUserByToken(token)
        if (!tmpUser) {
            throw { statusCode: 401, message: 'UNAUTHORISED' }
        }
        console.log('got user '+tmpUser.username)
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
        reply.view(`/templates/pages/login`, {
            UXConstraints: constraints[process.env.NODE_ENV].GET.login,
        })
    })

    /* GET subscribe page. */
    fastify.get('/signup', async function (req, reply) {
        reply.view(`/templates/pages/signup`, {
            UXConstraints: constraints[process.env.NODE_ENV].GET.signup,
        })
    })
}

module.exports = routes
