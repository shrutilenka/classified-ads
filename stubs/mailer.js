import MailTime from 'mail-time'
import { MongoClient } from 'mongodb'
import nodemailer from 'nodemailer'

const transports = []

// Private SMTP
transports.push(
nodemailer.createTransport({
    host: 'smtp.office365.com',
    from: 'no-reply@classified-ads.com',
    port: 587,
    tls: {
        ciphers: 'SSLv3',
    },
    secure: false,
    auth: {
        user: 'dddd',
        pass: 'ddd',
    },
}),
)

const dbName = 'listings_db'

// We're using environment variable MONGO_URL
// to store connection string to MongoDB
// example: "MONGO_URL=mongodb://127.0.0.1:27017/myapp node mail-micro-service.js"
MongoClient.connect('mongodb://localhost:27017/listings_db', (error, client) => {
    if (error) throw error
    const db = client.db(dbName)

    const mailQueue = new MailTime({
        db, // MongoDB
        type: 'server',
        strategy: 'balancer', // Transports will be used in round robin chain
        transports,
        from(transport) {
            // To pass spam-filters `from` field should be correctly set
            // for each transport, check `transport` object for more options
            return `"Awesome App" <${transport.options.from}>`
        },
        concatEmails: true, // Concatenate emails to the same addressee
        concatDelimiter: '<h1>{{{subject}}}</h1>', // Start each concatenated email with it's own subject
        template: MailTime.Template, // Use default template
    })

    mailQueue.sendMail(
        {
            to: 'ddd',
            subject: "You've got an email!",
            text: 'Plain text message',
            html: '<h1>HTML</h1><p>Styled message</p>',
        },
        (err, task) => {
            if (err) throw error
            console.log(task)
        },
    )
})

// import nodemailer from 'nodemailer'
// const transporter = nodemailer.createTransport({
//     host: 'smtp.office365.com',
//     from: 'no-reply@classified-ads.com',
//     port: 587,
//     tls: {
//         ciphers: 'SSLv3',
//     },
//     secure: false,
//     auth: {
//         user: 'ddd',
//         pass: 'dddd',
//     },
// })

// // verify connection configuration
// transporter.verify(function (error, success) {
//     if (error) {
//         console.log(error)
//     } else {
//         console.log('Server is ready to take our messages')
//     }
// })

// transporter.sendMail(
//     {
//         to: 'dddd',
//         subject: "You've got an email!",
//         text: 'Plain text message',
//         html: '<h1>HTML</h1><p>Styled message</p>',
//     },
//     function (err) {
//         if (err) {
//             // check if htmlstream is still open and close it to clean up
//         }
//     },
// )
