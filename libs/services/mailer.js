const MailTime = require('mail-time')
const transports = []
const nodemailer = require('nodemailer')

/**
 *
 * @param { MongoDBNamespace } mongoDB
 */
module.exports = function (db) {
    // Private SMTP
    transports.push(
        nodemailer.createTransport({
            host: 'smtp.example.com',
            from: 'no-reply@example.com',
            auth: {
                user: 'no-reply',
                pass: 'xxx',
            },
        }),
    )

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
            return '"Awesome App" <' + transport.options.from + '>'
        },
        concatEmails: true, // Concatenate emails to the same addressee
        concatDelimiter: '<h1>{{{subject}}}</h1>', // Start each concatenated email with it's own subject
        template: MailTime.Template, // Use default template
    })

    this.sendMail = function (to, subject, text, html) {
        mailQueue.sendMail({
            to: 'user@gmail.com',
            subject: "You've got an email!",
            text: 'Plain text message',
            html: '<h1>HTML</h1><p>Styled message</p>',
        })
    }
}
