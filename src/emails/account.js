const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'annietaylorchen@gmail.com',
        subject: 'Welcome to the app!',
        text: `Welcome, ${name}. Let me know how you like this app.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: 'annietaylorchen@gmail.com',
        subject: 'We are sad to see you leave.',
        text:`Goodbye, ${name}! Do you mind telling us why you want to leave?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}