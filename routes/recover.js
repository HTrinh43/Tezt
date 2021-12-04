//express is the framework we're going to use to handle requests
const express = require('express')
console.log("hello")
//Access the connection to Heroku Database
const pool = require('../utilities').pool
const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash

const sendRecoveryEmail = require('../utilities').sendRecoveryEmail

const router = express.Router()
console.log("world")
const jwt = require('jsonwebtoken')
const config = {
    secret: process.env.JSON_WEB_TOKEN
}
/**
 * @api {post} /recover Request to recover a password
 * @apiName PostRecover
 * @apiGroup Recover
 * 
 * @apiParam {String} email a users email *unique
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "email":"cfb3@fake.email"
 *  }
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted 
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: Username exists) {String} message "Username exists"
 * 
 * @apiError (400: Email exists) {String} message "Email exists"
 *  
 * @apiError (400: Other Error) {String} message "Other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about the error
 * 
 */ 
router.post('/', (request, response, next) => {
    //Retrieve data from query params
    var email = request.body.email
    console.log("Please work");
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(email)) {
        //validate email exists 
        let theQuery = 'SELECT * FROM Members WHERE Email=$1'
        let values = [email]
    
        pool.query(theQuery, values)
            .then(result => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: "email not found"
                    })
                } else {
                    //user found
                    response.locals.salt = result.rows[0].salt
                    console.log(response.locals.salt)
                    console.log(result.rows[0])
                    next()
                }
            }).catch(error => {
                response.status(400).send({
                    message: "SQL Error",
                    error: error
                })
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
}, (request, response) => {
    //let theQuery = "SELECT * FROM Members WHERE Email = $1"
    //let theQuery = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING Email"
    let code = Math.floor(Math.random() * 1000000)
    let salted_hash = generateHash(code, response.locals.salt)
    console.log(response.locals.salt)
    let email = request.body.email
    console.log(salted_hash)
    let theQuery = "UPDATE Members SET Code = $1 WHERE Email = $2"
    let values = [salted_hash, email]
    console.log(salted_hash)
    pool.query(theQuery, values)
        .then(result => {
            sendRecoveryEmail("tcss450autumn2021group4@gmail.com", email, "A new password was requested!", code)

            response.status(201).send({
                success: true,
                email: email
            })
            console.log('after email.')
        })
        .catch((error) => {
            //log the error
            console.log(error)

            response.status(400).send({
                message: "Other error, see detail",
                detail: error.detail
            })
        })
})

/**
 * @api {get} /auth Request to sign a user in the system
 * @apiName GetAuth
 * @apiGroup Auth
 * 
 * @apiHeader {String} authorization "username:password" uses Basic Auth 
 * 
 * @apiSuccess {boolean} success true when the name is found and password matches
 * @apiSuccess {String} message "Authentication successful!""
 * @apiSuccess {String} token JSON Web Token
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "success": true,
 *       "message": "Authentication successful!",
 *       "token": "eyJhbGciO...abc123"
 *     }
 * 
 * @apiError (400: Missing Authorization Header) {String} message "Missing Authorization Header"
 * 
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header"
 * 
 * @apiError (404: User Not Found) {String} message "User not found"
 * 
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 * 
 */ 
 router.get('/', (request, response, next) => {
    if (isStringProvided(request.headers.authorization) && request.headers.authorization.startsWith('Basic ')) {
        next()
    } else {
        response.status(400).json({ message: 'Missing Authorization Header' })
    }
}, (request, response, next) =>  {
    // obtain auth credentials from HTTP Header
    const base64Credentials =  request.headers.authorization.split(' ')[1]
    
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')

    const [email, code] = credentials.split(':')

    if (isStringProvided(email) && isStringProvided(code)) {
        request.auth = { 
            "email" : email,
            "code" : code
        }
        next()
    } else {
        response.status(400).send({
            message: "Malformed Authorization Header"
        })
    }
}, (request, response) => {
    const theQuery = "SELECT Code, Salt, MemberId FROM Members WHERE Email=$1"
    const values = [request.auth.email]
    pool.query(theQuery, values)
        .then(result => { 
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: 'User not found or code does not exist' 
                })
                return
            }

            //Retrieve the salt used to create the salted-hash provided from the DB
            let salt = result.rows[0].salt
            //Retrieve the salted-hash password provided from the DB
            let storedSaltedHash = result.rows[0].code 
            //Generate a hash based on the stored salt and the provided password
            let providedSaltedHash = generateHash(request.auth.code, salt)
            //Did our salted hash match their salted hash?
            if (storedSaltedHash === providedSaltedHash ) {
                //credentials match. get a new JWT
                let token = jwt.sign(
                    {
                        "email": request.auth.email,
                        "memberid": result.rows[0].memberid
                    },
                    config.secret,
                    { 
                        expiresIn: '1 day' // expires in 1 day
                    }
                )
                //package and send the results
                response.json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token
                })
            } else {
                //credentials dod not match
                response.status(400).send({
                    message: 'Credentials did not match' 
                })
            }
        })
        .catch((err) => {
            //log the error
            console.log(err.stack)
            response.status(400).send({
                message: err.detail
            })
        })
})

module.exports = router
