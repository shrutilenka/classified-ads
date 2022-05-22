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
const { constraints } = require('../constraints/constraints')

const queries = require('../services/mongo')
// Require dependencies (fastify plugins and others)
const config = require('config')
var tidy = require('htmltidy2').tidy
const tidyP = promisify(tidy)
const crypto = require('../services/helpers').crypto
const key = crypto.passwordDerivedKey(process.env.PASSWORD)

const formatInsertDocument = async (QInstance, req, blobNames) => {
    const { body } = req
    let publicUrl, publicUrlSmall
    if(blobNames) {
        const [blobName, blobNameSmall] = blobNames[0].small ? [
            blobNames[1].name, blobNames[0].name
        ] : [blobNames[0].name, blobNames[1].name]
        publicUrlSmall = format(`https://storage.googleapis.com/${bucket.name}/${blobNameSmall}`)
        publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blobName}`)
    } else {
        // TODO: config.get('IMG') & config.get('IMG_THUMB')
    }

    const listing = Object.assign(body, {
        d: false,
        a: false,
        img: publicUrl,
        thum: publicUrlSmall,
        usr: req.params.username,
    })
    const [err, insertedId] = await to(QInstance.insertListing(listing))
    if (err) throw err
    listing['id'] = insertedId.toHexString()
    // TODO: check id
    const author = req.params.username
    const channel = crypto.encrypt(key, `${author},${author},${listing['id']}`)
    let data = { data: listing, section: listing.section, author, channel, messages: [] }
    return data
}

// options http://api.html-tidy.org/tidy/tidylib_api_5.6.0/tidy_quickref.html
const opt = { 'show-body-only': 'yes' }

module.exports = (fastify) => {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis)
    return async (req, reply) => {
        const { body, method } = req
        const section = body.section
        if(!section) {
            req.log.error(`post/listings#postListingHandler: no section provided}`)
            reply.blabla([{title: 'TODO: blaaaaaaaaaaa'}, 'message', 'server error... Please try again later.'])
            return reply
        }
        let errors, tagsValid, geoValid, undrawValid
        try {
            ({ errors, tagsValid, geoValid, undrawValid } =
            validationPipeLine(req))
        } catch (error) {
            req.log.error(`post/listings#postListingHandler: ${error.message}`)
            reply.blabla([{title: 'TODO: blaaaaaaaaaaa'}, 'message', 'server error... Please try again later.'])
            return reply
        }
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
            const { upload } = constraints[process.env.NODE_ENV][method][section]
            if (upload && !req.file) {
                req.log.error(`post/listings#postListingHandler: file not found`)
                reply.blabla([{title: 'TODO: blaaaaaaaaaaa'}, 'message', 'server error... Please try again later.'])
                return reply
            }
            if (!upload) {
                formatInsertDocument(QInstance, req, null, false,)
                    .then((data) =>  {
                        reply.blabla([data, 'listing', 'id'], req)
                        return reply
                    })
                    .catch((err) => {
                        req.log.error(`formatInsertDocument#insertListing: ${err.message}`)
                        reply.blabla([{title: 'TODO: blaaaaaaaaaaa'}, 'message', 'server error... Please try again later.'])
                        return reply
                    })
               
            } else {
                // Upload that damn pictures the original and the thumbnail
                // Create a new blob in the bucket and upload the file data.
                let uploadSmallImg, uploadImg
                let thumbnailBuffer, originalBuffer
                originalBuffer = req.file.buffer
                const { width } = config.get('IMG_THUMB')
                const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
                const filename = suffix + path.extname(req.file.originalname)
                const blob = bucket.file(filename)
                try {
                    thumbnailBuffer = await sharp(originalBuffer)
                        .metadata()
                        .then(({ width : originalWidth }) => {
                            if(originalWidth > 400) {
                                return sharp(originalBuffer)
                                    .resize(Math.round(originalWidth * 0.5)).toBuffer()
                            }
                            if(originalWidth > 200){
                                return sharp(originalBuffer)
                                    .resize(width, { fit: 'inside' }).toBuffer()
                            }
                            return undefined
                        })
                } catch (error) {
                    req.log.error(`post/listings#postListingHandler#sharp: ${error.message}`)
                }
                
                if (thumbnailBuffer)
                    uploadSmallImg =  new Promise((resolve, reject) => {
                        blob.createWriteStream({
                            resumable: false //Good for small files
                        }).on('finish', () => {
                            resolve({ name: blob.name, small: true })
                        }).on('error', err => {
                            reject('upload error: ', err)
                        }).end(thumbnailBuffer)
                    })
                else
                    uploadSmallImg =  Promise.resolve({ name: config.get('IMG_THUMB').url, small: true })
                uploadImg =  new Promise((resolve, reject) => {
                    blob.createWriteStream({
                        metadata: { contentType: req.file.mimetype },
                        resumable: true
                    }).on('finish', () => {
                        resolve({ name: blob.name, small: false })
                    }).on('error', err => {
                        reject('upload error: ', err)
                    }).end(originalBuffer)
                })
                Promise.all([uploadImg, uploadSmallImg]).then((blobNames) => {
                    formatInsertDocument( QInstance, req, blobNames, true, )
                        .then((data) =>  {
                            reply.blabla([data, 'listing', 'id'], req)
                            return reply
                        })
                        .catch((err) => {
                            req.log.error(`formatInsertDocument#insertListing: ${err.message}`)
                            reply.blabla([{title: 'TODO: blaaaaaaaaaaa'}, 'message', 'server error... Please try again later.'])
                            return reply
                        })
                }).catch((err) => {
                    req.log.error(`formatInsertDocument#upload: ${err.message}`)
                    reply.blabla([{title: 'TODO: blaaaaaaaaaaa'}, 'message', 'server error... Please try again later.'])
                    return reply
                })
            }
        }
    }
}
