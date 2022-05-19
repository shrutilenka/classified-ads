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
const config = require('config')
var tidy = require('htmltidy2').tidy
const tidyP = promisify(tidy)

const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]

const formatInsertDocument = async (QInstance, req, blobNames) => {
    const { body } = req
    const [blobName, blobNameSmall] = blobNames[0].small ? [
        blobNames[1].name, blobNames[0].name
    ] : [blobNames[0].name, blobNames[1].name]
    const publicUrlSmall = format(`https://storage.googleapis.com/${bucket.name}/${blobNameSmall}`)
    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blobName}`)
    const entry = Object.assign(body, {
        d: false,
        a: false,
        img: publicUrl,
        thum: publicUrlSmall,
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
            req.log.error(`post/listings#postListingHandler: ${JSON.stringify(errors)}`)
            reply.blabla([{ errors, section }, 'listings', 'POST_ERR'], req)
            return reply
        } else {
            const html = await tidyP(body.desc, opt)
            body.desc = new stringTransformer(html)
                .sanitizeHTML()
                .cleanSensitive()
                .valueOf()
            body.lang = await helpers.getLanguage(body.desc)
            if (!req.file && NODE_ENV > 0) {
                reply.send({
                    message: 'Invalid request',
                    data: body,
                    error: 'file not found',
                })
            }
            let thumbnailBuffer
            let originqlBuffer = req.file.buffer
            try {
                thumbnailBuffer = await sharp(originqlBuffer)
                    .resize(1800, 948)
                    .toFormat('jpeg')
                    .jpeg({ quality: 80 })
                    .toBuffer()
            } catch (error) {
                req.log.error(`post/listings#postListingHandler#sharp: ${error.message}`)
            }

            if (NODE_ENV < 1) {
                formatInsertDocument(QInstance, req, null, false,)
                    .then((data) =>  reply.blabla([data, 'listing', section]))
                    .catch((err) => {
                        req.log.error(`formatInsertDocument#insertListing: ${err.message}`)
                        reply.blabla([{}, 'messages', 'server error... Please try again later.'])
                    })
               
            } else {
                // Upload that damn pictures the original and the thumbnail
                // Create a new blob in the bucket and upload the file data.
                const suffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9)
                const filename = suffix + path.extname(req.file.originalname)
                const blob = bucket.file(filename)
                const uploadSmallImg =  new Promise((resolve, reject) => {
                    blob.createWriteStream({
                        resumable: false //Good for small files
                    }).on('finish', () => {
                        resolve({ name: blob.name, small: true })
                    }).on('error', err => {
                        reject('upload error: ', err)
                    }).end(thumbnailBuffer)
                })
                const uploadImg =  new Promise((resolve, reject) => {
                    blob.createWriteStream({
                        metadata: { contentType: req.file.mimetype },
                        resumable: true
                    }).on('finish', () => {
                        resolve({ name: blob.name, small: false })
                    }).on('error', err => {
                        reject('upload error: ', err)
                    }).end(originqlBuffer)
                })
                Promise.all([uploadImg, uploadSmallImg]).then((blobNames) => {
                    formatInsertDocument( QInstance, req, blobNames, true, )
                        .then((data) =>  reply.blabla([data, 'listing', section]))
                        .catch((err) => {
                            req.log.error(`formatInsertDocument#insertListing: ${err.message}`)
                            reply.blabla([{}, 'messages', 'server error... Please try again later.'])
                        })
                }).catch((err) => {
                    req.log.error(`formatInsertDocument#upload: ${err.message}`)
                    reply.blabla([{}, 'messages', 'server error... Please try again later.'])
                })
            }
        }
    }
}
