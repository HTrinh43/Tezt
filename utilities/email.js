let sendEmail = (sender, receiver, subject, token) => {
    //research nodemailer for sending email from node.
    // https://nodemailer.com/about/
    // https://www.w3schools.com/nodejs/nodejs_email.asp
    //create a burner gmail account 
    //make sure you add the password to the environmental variables
    //similar to the DATABASE_URL and PHISH_DOT_NET_KEY (later section of the lab)

    //fake sending an email for now. Post a message to logs. 
    const express = require("express")
    const bodyParser = require('body-parser')
    const nodemailer = require("nodemailer")
    const app = express();
    const jwt = require('jsonwebtoken')
    
    //const nodemailer = require("nodemailer")
    const PASSWORD = process.env.EMAIL_PASSWORD
    //const logger = require('logger')
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender,
            pass: PASSWORD
        }
    });
    var mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        html: `Press <a href=https://tcss450-group4-project.herokuapp.com/verify?id=${token}>
            here</a> to verify your email. Thanks`
        };
    
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { 
    sendEmail
}