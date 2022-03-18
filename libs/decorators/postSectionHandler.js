const { Storage } = require('@google-cloud/storage')
// const Joi = require('joi')
const path = require('path')
const { format } = require('util')
const storage = new Storage({ keyFilename: process.env.CREDS_PATH })
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)
const { validationPipeLine, stringTransformer } = require('../services/PipeLine.js')
const queries = require('../services/mongo')
// Require dependencies (fastify plugins and others)
require('dotenv').config()
const config = require('config')
// incremental is better at least here in app.js
const NODE_ENV = {
    'monkey chaos': -1,
    'localhost': 0,
    'development': 1,
    'production': 2
}[process.env.NODE_ENV]

const isEmpty = (o) => Object.keys(o).length === 0
const arabic = /[\u0600-\u06FF]/g
/**
   * Detects if String is Arabic, if ration of arabic characters count is at least 0.5
   * @param {string} str The first number.
   * @return {boolean} isArabic or null.
   */
function isArabic(str) {
    const count = str.match(arabic)
    return count && ((count.length / str.length) > 0.5)
}
const insertDocument = async (QInstance, req, blob, upload) => {
    const { body } = req
    
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = upload ? format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`) : 'blaaaaa'
    const entry = Object.assign(body, {
        d: false,
        a: false,
        img: publicUrl,
        usr: req.params.username,
        usr_profile: req.params.username,
        ara: isArabic(body.desc)
    })
    let acknowledged = await QInstance.insertDocument(entry)
    return { data: entry, messages: [] }    
}
var tidy = require('htmltidy2').tidy;

// options http://api.html-tidy.org/tidy/tidylib_api_5.6.0/tidy_quickref.html
const opt = { 'show-body-only': 'yes' }


module.exports = (fastify) => {
    const { db } = fastify.mongo
    const logger = fastify.log
    const QInstance = new queries(db, logger)
    return async (req, reply) => {
        const { body } = req
        const section = body.section
        const { error, tagsValid, geoValid, undrawValid } = validationPipeLine(req)
        const valid = (isEmpty(error)) && tagsValid && geoValid && undrawValid
        if (!valid) {
            reply.send({
                message: 'Invalid request',
                data: body,
                error: error
            })
        } else {
            tidy(body.desc, opt, async function (err, html) {
                body.desc = new stringTransformer(html).sanitizeHTML().cleanSensitive().valueOf()
                // Files other than images are undefined
                if (!req.file && NODE_ENV > 0) {
                    reply.send({
                        message: 'Invalid request',
                        data: body,
                        error: 'file not found'
                    })
                }
                if (NODE_ENV < 1) {
                    let data = await insertDocument(QInstance, req, null, false)
                    reply.blabla([data, 'listing', section])
                } else {
                    // Upload that damn picture
                    // Create a new blob in the bucket and upload the file data.
                    const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
                    const filename = suffix + path.extname(req.file.originalname)
                    const blob = bucket.file(filename)
                    const blobStream = blob.createWriteStream()
                    blobStream.on('error', (err) => {
                        // TODO: do not call done inside promises
                        throw (err)
                    })
                    blobStream.on('finish', async () => {
                        let data = await insertDocument(QInstance, req, blob, true)
                        reply.blabla([data, 'listing', section])
                    })
                    blobStream.end(req.file.buffer)
                }
            })
        }
    }
}
