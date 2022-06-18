import { Storage } from '@google-cloud/storage'
import { tidy } from 'htmltidy2'
import { createRequire } from 'module'
import path from 'path'
import { format, promisify } from 'util'
import config from '../../configuration.js'
import constraints from '../constraints/constraints.js'
import { ops as helpers } from '../services/helpers.js'
import queries from '../services/mongo.js'
import { stringTransformer, validationPipeLine } from '../services/pipeLine.js'

const require = createRequire(import.meta.url)
let sharp
try {
    sharp = require('sharp')
} catch (error) {
    console.log('oh no no sharp module. I hope this is not production environment')
}

const NODE_ENV = {
    api: -1,
    localhost: 0,
    development: 1,
    production: 2,
}[process.env.NODE_ENV]
const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null])

let storage, bucket
if (NODE_ENV < 1) {
    storage = new Storage({ keyFilename: process.env.CREDS_PATH })
    bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)
}

const tidyP = promisify(tidy)
/**
 *
 * @param {*} QInstance
 * @param {*} req
 * @param {*} blobNames
 * @param {*} upload
 * @returns
 */
const formatNInsertListing = async (QInstance, req, blobNames) => {
    const { body } = req
    let publicUrl, publicUrlSmall
    if (blobNames) {
        const [blobName, blobNameSmall] = blobNames[0].small
            ? [blobNames[1].name, blobNames[0].name]
            : [blobNames[0].name, blobNames[1].name]
        publicUrlSmall = format(`https://storage.googleapis.com/${bucket.name}/${blobNameSmall}`)
        publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blobName}`)
    } else {
        // TODO: config('IMG') & config('IMG_THUMB')
        publicUrl = publicUrlSmall = `/static/images/${req.file.filename}`
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
    let data = { data: listing, section: listing.section }
    return data
}

// options http://api.html-tidy.org/tidy/tidylib_api_5.6.0/tidy_quickref.html
const opt = { 'show-body-only': 'yes' }

export default (fastify) => {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis)
    return async (req, reply) => {
        const { body, method } = req
        const section = body.section
        if (!section) {
            req.log.error(`post/listings#postListingHandler: no section provided}`)
            reply.blabla([{ title: 'TODO: blaaaaaaaaaaa' }, 'message', 'server error... Please try again later.'])
            return reply
        }
        let errors, tagsValid, geoValid, undrawValid
        try {
            ;({ errors, tagsValid, geoValid, undrawValid } = validationPipeLine(req))
        } catch (error) {
            req.log.error(`post/listings#postListingHandler: ${error.message}`)
            reply.blabla([{ title: 'TODO: blaaaaaaaaaaa' }, 'message', 'server error... Please try again later.'])
            return reply
        }
        const valid = !errors.length && tagsValid && geoValid && undrawValid
        if (!valid) {
            req.log.error(`post/listings#postListingHandler: ${JSON.stringify(errors)}`)
            reply.blabla([{ errors, section }, 'listings', 'POST_ERR'], req)
            return reply
        } else {
            let stripped
            try {
                body.desc = new stringTransformer(body.desc).sanitizeHTML().cleanSensitive().valueOf()
                stripped = body.desc.replace(/<[^>]*>?/gm, '')
                body.desc = await tidyP(body.desc, opt)
            } catch (error) {
                // TODO: stop request ?
                req.log.error(`post/listings#postListingHandler: tidyP:: ${body.desc.slice(0, 20)} | ${error.message} `)
            }
            try {
                body.lang = stripped ? await helpers.getLanguage(stripped) : 'und'
            } catch (error) {
                body.lang = 'und'
                req.log.error(
                    `post/listings#postListingHandler: getLanguage:: ${stripped.slice(0, 20)} | ${error.message} `,
                )
            }
            const { upload } = constraints[process.env.NODE_ENV][method][section]
            if (upload && !req.file) {
                req.log.error(`post/listings#postListingHandler: file not found`)
                reply.blabla([{ title: 'TODO: blaaaaaaaaaaa' }, 'message', 'server error... Please try again later.'])
                return reply
            }
            if (!upload) {
                formatNInsertListing(QInstance, req, null)
                    .then((data) => {
                        reply.blabla([data, 'listing', 'id'], req)
                        return reply
                    })
                    .catch((err) => {
                        req.log.error(`formatNInsertListing#insertListing: ${err.message}`)
                        reply.blabla([
                            { title: 'TODO: blaaaaaaaaaaa' },
                            'message',
                            'server error... Please try again later.',
                        ])
                        return reply
                    })
            } else {
                // Upload that damn pictures the original (req.file) and the thumbnail
                // Create a new blob in the bucket and upload the file data.
                // req.file       | Image {
                // req.file       |   fieldname: 'file',
                // req.file       |   originalname: 'cruise.jpg',
                // req.file       |   encoding: '7bit',
                // req.file       |   mimetype: 'image/jpeg',
                // req.file       |   buffer: <Buffer ff d8 ff e1 3d 1e 45 78 69 66 00... 15755535 more bytes>,
                // req.file       |   size: 15755585
                // req.file       | }
                let uploadSmallImg, uploadImg
                let thumbnailBuffer, originalBuffer
                originalBuffer = req.file.buffer
                const { width } = config('IMG_THUMB')
                const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
                const filename = suffix + path.extname(req.file.originalname)
                const blob = bucket.file(filename)
                try {
                    if (sharp)
                        thumbnailBuffer = await sharp(originalBuffer)
                            .metadata()
                            .then(({ width: originalWidth }) => {
                                if (originalWidth > 400) {
                                    return sharp(originalBuffer)
                                        .resize(Math.round(originalWidth * 0.5))
                                        .toBuffer()
                                }
                                if (originalWidth > 200) {
                                    return sharp(originalBuffer).resize(width, { fit: 'inside' }).toBuffer()
                                }
                                return undefined
                            })
                            .catch((err) => {
                                req.log.error(`post/listings#postListingHandler#sharp: ${err.message}`)
                            })
                    else {
                        thumbnailBuffer = await Jimp.read(originalBuffer)
                            .then(async (image) => {
                                image.quality(80)
                                image.resize(width, Jimp.AUTO)
                                return await image.getBufferAsync(Jimp.AUTO)
                            })
                            .catch((err) => {
                                req.log.error(`post/listings#postListingHandler#Jimp: ${err.message}`)
                            })
                    }
                } catch (error) {
                    req.log.error(`post/listings#postListingHandler#Image compression: ${error.message}`)
                }

                if (thumbnailBuffer)
                    uploadSmallImg = new Promise((resolve, reject) => {
                        blob.createWriteStream({
                            resumable: false, //Good for small files
                        })
                            .on('finish', () => {
                                resolve({ name: blob.name, small: true })
                            })
                            .on('error', (err) => {
                                reject('upload error: ', err)
                            })
                            .end(thumbnailBuffer)
                    })
                else uploadSmallImg = Promise.resolve({ name: config('IMG_THUMB').url, small: true })
                uploadImg = new Promise((resolve, reject) => {
                    blob.createWriteStream({
                        metadata: { contentType: req.file.mimetype },
                        resumable: true,
                    })
                        .on('finish', () => {
                            resolve({ name: blob.name, small: false })
                        })
                        .on('error', (err) => {
                            reject('upload error: ', err)
                        })
                        .end(originalBuffer)
                })
                Promise.all([uploadImg, uploadSmallImg])
                    .then((blobNames) => {
                        formatNInsertListing(QInstance, req, blobNames)
                            .then((data) => {
                                reply.blabla([data, 'listing', 'id'], req)
                                return reply
                            })
                            .catch((err) => {
                                req.log.error(`formatNInsertListing#insertListing: ${err.message}`)
                                return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                            })
                    })
                    .catch((err) => {
                        req.log.error(`formatNInsertListing#upload: ${err.message}`)
                        return reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
                    })
            }
        }
    }
}
