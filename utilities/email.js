let sendRecoveryEmail = (sender, receiver, subject, code) => {
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
        html: `<html>
  <body>    
  <div id="wrapper">
      <section>
          <body>
              <div id="body-wrapper">
                  <h1>We have received notice that you have forgotten your password!</h1>
            <p>Please use the following six digit code to reset your password: ${code}</p>
            
            <p>If you did not forget your password, no further action is required.</p>
            <br><br>
                  <p> Best regards,<br>
                  Team 4
          </div>
          </body>
      </section>
  </div>
  </body>
  </html>`

        };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
/**
 * Sends a verification email.
 * @param {} sender the account sending the email.
 * @param {*} receiver the account receiving the email.
 * @param {*} subject the subject of the email.
 * @param {*} token the jwt token used to verify the email address.
 */
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
        html: `<html>
  <body>    
  <div id="wrapper">
      <section>
          <body>
              <div id="body-wrapper">
                  <h1>Welcome to our chat app!</h1>
            <p>Please press the button below to verify your email address.</p>
            <form action="https://tcss450-group4-project.herokuapp.com/verify?" method="get">
                <input type="hidden" name="id" id="token" value="${token}">
                <button type="submit">Verify your email</button>
            </form>
            <p>If you did not create an account, no further action is required.</p>
            <br><br>
                  <p> Best regards,<br>
                  Team 4
          </div>
          </body>
      </section>
  </div>
  </body>
  </html>`

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
    sendEmail, sendRecoveryEmail
}