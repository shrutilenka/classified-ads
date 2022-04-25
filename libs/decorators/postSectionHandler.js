const to = (promise) => promise.then(data => [null, data]).catch(err => [err, null])
const helpers = require('../services/helpers').ops
const { Storage } = require('@google-cloud/storage')
// const Joi = require('joi')
const path = require('path')
const { format, promisify } = require('util')
const sharp = require('sharp')

const storage = new Storage({ keyFilename: process.env.CREDS_PATH })
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)
const {
    validationPipeLine,
    stringTransformer,
} = require('../services/pipeLine.js')
const queries = require('../services/mongo')
// Require dependencies (fastify plugins and others)
require('dotenv').config()
const config = require('config')
var tidy = require('htmltidy2').tidy
const tidyP = promisify(tidy)
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]

const formatInsertDocument = async (QInstance, req, blob, upload) => {
    const { body } = req
    const publicUrl = upload
        ? format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`)
        : `/cdn/${req.file.filename}`
    const entry = Object.assign(body, {
        d: false,
        a: false,
        img: publicUrl,
        usr: req.params.username,
    })
    const [err, acknowledged] = await to(QInstance.insertListing(entry))
    return { data: entry, messages: [] }
}

// options http://api.html-tidy.org/tidy/tidylib_api_5.6.0/tidy_quickref.html
const opt = { 'show-body-only': 'yes' }

module.exports = (fastify) => {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis)
    return async (req, reply) => {
        const { body } = req
        const section = body.section
        const { errors, tagsValid, geoValid, undrawValid } =
            validationPipeLine(req)
        const valid = !errors.length && tagsValid && geoValid && undrawValid
        if (!valid) {
            req.log.error(`post/listings#postSectionHandler: ${JSON.stringify(errors)}`)
            reply.blabla([{ errors, section }, 'listings', 'POST_ERR'], req)
            return reply
        } else {
            const html = body.desc
            // Tidy not working on Ubuntu
            // const html = await tidyP(body.desc, opt)
            body.desc = new stringTransformer(html)
                .sanitizeHTML()
                .cleanSensitive()
                .valueOf()
            body.lang = await helpers.getLanguage(body.desc)
            // Files other than images are undefined
            if (!req.file && NODE_ENV > 0) {
                reply.send({
                    message: 'Invalid request',
                    data: body,
                    error: 'file not found',
                })
            }
            // TODO: must be safer
            // TODO: should get another buffer (thumbnail) and upload as well
            let buffer
            try {
                buffer = await sharp(req.file.buffer)
                    .resize(1800, 948)
                    .toFormat('jpeg')
                    .jpeg({ quality: 80 })
                    .toBuffer()
            } catch (error) {
                req.log.error(`post/listings#postSectionHandler#sharp: ${error.message}`)
                buffer = req.file.buffer
            }

            if (NODE_ENV < 1) {
                formatInsertDocument(
                    QInstance,
                    req,
                    null,
                    false,
                ).then((data) =>  reply.blabla([data, 'listing', section]))
                    .catch((err) => {
                        req.log.error(`formatInsertDocument#insertListing: ${err.message}`)
                        reply.blabla([{}, 'messages', 'server error... Please try again later.'])
                    })
               
            } else {
                // Upload that damn picture
                // Create a new blob in the bucket and upload the file data.
                const suffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9)
                const filename = suffix + path.extname(req.file.originalname)
                const blob = bucket.file(filename)
                const blobStream = blob.createWriteStream()
                // const blobStream2 = blob.createWriteStream()
                blobStream.on('error', (err) => {
                    throw err
                })
                blobStream.on('finish', async () => {
                    await formatInsertDocument(
                        QInstance,
                        req,
                        blob,
                        true,
                    ).then((data) =>  reply.blabla([data, 'listing', section]))
                        .catch((err) => {
                            req.log.error(`formatInsertDocument#insertListing: ${err.message}`)
                            reply.blabla([{}, 'messages', 'server error... Please try again later.'])
                        })
                })
                blobStream.end(buffer)
            }
        }
    }
}
