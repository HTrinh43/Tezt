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
 * @api {get} /themes Request the user's theme
 * @apiName GetThemes
 * @apiGroup Themes
 *
 * @apiSuccess {String} theme the user's theme
 */
 router.get("/", (request, response) => {
    let insert = `SELECT Theme FROM Members WHERE MemberId = $1;`
    let values = [request.decoded.memberid]
    pool.query(insert, values)
        .then(result => {
            response.send({
                success: true,
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
})

/**
 * @api {post} /themes Request to add a theme.
 * @apiName PostThemes
 * @apiGroup Themes
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiParam {String} theme the theme for the user.
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * 
 * @apiError (400: Unknown user) {String} message "unknown email address"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiError (400: Unknown Chat ID) {String} message "invalid chat id"
 * 
 * @apiUse JSONError
 */ 
 router.post("/", (request, response, next) => {
    if (!isStringProvided(request.body.theme)) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else {
        next()
    }
}, (request, response) => {

    let insert = `UPDATE Members SET Theme = $1 WHERE MemberId = $2;`
    let values = [request.body.name, request.decoded.memberid]
    pool.query(insert, values)
        .then(result => {
            response.send({
                success: true,
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
})

module.exports = router
