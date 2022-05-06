const { MongoDBNamespace } = require('mongodb')
const config = require('config')
const MailTime = require('mail-time')
const nodemailer = require('nodemailer')

class MailerOps {
    constructor(db) {
        const transports = []
        // Mailhog SMTP
        transports.push(nodemailer.createTransport(config.get('SMTP_TIMER')))
        // Google Apps SMTP
        transports.push(
            nodemailer.createTransport({
                host: 'smtp.gmail.com',
                from: 'no-reply@mail.example.com',
                auth: {
                    user: 'no-reply@mail.example.com',
                    pass: 'xxx',
                },
            }),
        )

        // Mailing service (SparkPost as example)
        transports.push(
            nodemailer.createTransport({
                host: 'smtp.sparkpostmail.com',
                port: 587,
                from: 'no-reply@mail2.example.com',
                auth: {
                    user: 'SMTP_Injection',
                    pass: 'xxx',
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
         * Send an email
         * @param {*} to 
         * @param {*} subject 
         * @param {*} text 
         * @param {*} html 
         */
        this.sendMail = function (to, subject, text, html) {
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
