const { MongoDBNamespace } = require('mongodb')
const config = require('config')
const MailTime = require('mail-time')
const nodemailer = require('nodemailer')

class MailerOps {
    constructor(db) {
        const transports = []
        // Mailhog SMTP
        transports.push(nodemailer.createTransport(config.get('SMTP_TIMER')))
        // Outlook Apps SMTP
        transports.push(
            nodemailer.createTransport({
                host: 'smtp.office365.com',
                from: 'no-reply@classified-ads.com',
                port: 587,
                tls: { ciphers: 'SSLv3' },
                secure: false,
                auth: {
                    user: process.env.ADMIN_EMAIL,
                    pass: process.env.ADMIN_PASS,
                },
            }),
        )

        const mailQueue = new MailTime({
            db, // MongoDB
            type: 'server',
            strategy: 'balancer', // Transports will be used in round robin chain
            transports,
            from(transport) {
                // To pass spam-filters `from` field should be correctly set
                // for each transport, check `transport` object for more options
                return '"Classified ads" <' + transport.options.from + '>'
            },
            concatEmails: true, // Concatenate emails to the same addressee
            concatDelimiter: '<h1>{{{subject}}}</h1>', // Start each concatenated email with it's own subject
            template: MailTime.Template, // Use default template
        })

        /**
         * Send an email with user defined language !
         * TODO: How to deal with multilanguage emails ??
         * https://www.contactmonkey.com/blog/multilingual-emails
         * User can send directly `sendMail(to, subject, text, html)` or
         * `sendMail(to, todo, req, data)` and subject, text, html are derived
         * @param {String} to an email to send email to
         * @param {String} [todo] the action the doer is performing
         * @param {String} [subject] optional email subject
         * @param {String} [text] optional email text
         * @param {String} [html] optional email html
         * @param {import('fastify').FastifyRequest} [req] request object to derive i18next translations
         * @param {JSON} [data] key-values to inject to i18next
         */
        this.sendMail = function ({to, todo, subject, text, html, req, data}) {
            // If req is provided we assume here that
            // a multilanguage version exists and data is provieded
            if (req) {
                subject = req.t(`mail.${todo}.subject`, data)
                text = req.t(`mail.${todo}.text`, data)
                html = req.t(`mail.${todo}.html`, data)
            }
            mailQueue.sendMail({ to, subject, text, html })
        }
    }
}

class Mailer {
    constructor() {
        throw new Error('Use Mailer.getInstance()')
    }
    /**
     * Singleton Mailer instance
     * @param { MongoDBNamespace } db
     * @returns { MailerOps }
     */
    static getInstance(db) {
        if (!Mailer.instance) {
            Mailer.instance = new MailerOps(db)
        }
        return Mailer.instance
    }
}
module.exports = Mailer