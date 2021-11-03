//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash

const router = express.Router()

//Pull in the JWT module along with out a secret key
const jwt = require('jsonwebtoken')
const config = {
    secret: process.env.JSON_WEB_TOKEN
}

/**
 * @api {get} /auth Request to verify an email in the system
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
     console.log("Did verify even start?")
    if (isStringProvided(request.query.id)) {
        next()
    } else {
        response.status(400).json({ message: 'Missing id query parameter' })
    }
}, (request, response) => {
    console.log("Did we get to decoding?")
    const token = request.query.id;
    if (token) {
        try {
            jwt.verify(token, config.secret, (error, decoded) => {
                if (error) {
                    console.log(error)
                    return response.sendStatus(403)
                } else {
                    const email = decoded.email;
                    console.log("did we get to the database")
                    //let theQuery = `UPDATE Members SET verification = 1 WHERE email ='${email}';`
                    let theQuery = "UPDATE members SET verification = 1 WHERE email= $1"
                    let values = [email]
                    console.log(theQuery)
                    //UPDATE INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6)
                    pool.query(theQuery, values)
                        .then(result => {
                            response.status(201).send({
                                success: true
                            })
                            console.log("success?")
                        })
                        .catch((error) => {
                            console.log(error)
                            response.status(400).send({
                                message: "other error, see detail",
                                detail: error.detail
                            })
                            console.log("Something's wrong")
                        })
                }
            });
        } catch (error) {

            console.log(error)
            return response.sendStatus(403)
        }
    } else {
        return response.sendStatus(403)

    }
    console.log("end of the line")
})

module.exports = router
