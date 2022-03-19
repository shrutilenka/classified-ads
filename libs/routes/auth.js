require('dotenv').config()
const config = require('config')
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]

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


    const bcrypt = require('bcryptjs')
    const jwt = require('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET
    const COOKIE_NAME = config.get('COOKIE_NAME')
    const loginSchema = constraints[process.env.NODE_ENV].POST.login.schema
    fastify.post('/login', { schema: loginSchema }, async function (request, reply) {
        const username = request.body.username
        const password = request.body.password
        try {
            // const user = await UserCredentials.findOne({username})
            const user = await QInstance.getUserById(username)
            if (!user) {
                throw { statusCode: 401, message: 'INCORRECT_CREDENTIALS' }
            }
            try {
                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    throw { statusCode: 401, message: 'INCORRECT_CREDENTIALS' }
                } else {
                    const token = await jwt.sign({ username: username, role: user.role }, JWT_SECRET)
                    reply.setCookie(COOKIE_NAME, token)
                    // this.user = username
                    return { msg: "SUCCESS" }
                }
            } catch (err) {
                throw { statusCode: 500, message: 'Something went wrong! Please try again' }
            }
        } catch (err) {
            throw { statusCode: 500, message: 'Something went wrong! Please try again' }
        }
    })

    const loginSchema2 = constraints[process.env.NODE_ENV].POST.login.schema
    fastify.post('/signup', { schema: loginSchema2 }, async function (request, reply) {
        const username = request.body.username
        const password = request.body.password
        // Always 'regular' by default (except user@mail.com for tests)
        const role = (username === 'user@mail.com') ? 'admin' : 'regular'
        try {
            const user = await QInstance.getUserById(username)
            if (user) {
                throw { statusCode: 400, message: 'USER_TAKEN' }
            } else {
                let hash_pass
                try {
                    hash_pass = await bcrypt.hash(password, 10)
                } catch (err) {
                    throw { statusCode: 500, message: 'Something went wrong! Please try again' }
                }
                const new_user = await QInstance.insertUser({ username, password: hash_pass, role: role})
                return { msg: "SUCCESS" }
            }
        } catch (err) {
            throw { statusCode: 500, message: 'Something went wrong! Please try again' }
        }
    })

    /* GET login page. */
    fastify.get('/login', async function (req, reply) {
        reply.view(`/templates/pages/login`, { UXConstraints: constraints[process.env.NODE_ENV].GET.login.requiredUXInputs })
    })

    /* GET subscribe page. */
    fastify.get('/signup', async function (req, reply) {
        reply.view(`/templates/pages/signup`, { UXConstraints: constraints[process.env.NODE_ENV].GET.signup.requiredUXInputs })
    })

}

module.exports = routes