//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


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
 * @apiDescription Request to get the theme from the user.
 * 
 * @apiSuccess {String} theme the user's theme
 * 
 * @apiError (400: Missing user) {String} message "User doesn't exist."
 * 
 * @apiError (400: SQL Error) {String} message "SQL Error on member in member check."
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 */
 router.get("/", (request, response, next) => {
    //validate memberid exists in the chat
    let query = `SELECT * FROM Members WHERE MemberId = $1`
    let values = [request.decoded.memberid]
    pool.query(query, values)
        .then(result => {
            if (result.rowCount > 0) {
                 next()
            } else {
                response.status(400).send({
                    message: "User doesn't exist."
                })
            }            
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error on member in member check.",
                error: error
            })
        })
}, (request, response) => {
    let query = `SELECT Theme FROM Members WHERE MemberId = $1;`
    let values = [request.decoded.memberid]
    pool.query(query, values)
        .then(result => {
            response.send({
                rows: result.rows
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
 * @apiDescription Request to add a theme to the Member's database. It will
 * overwrite any existing theme.
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiParam {String} theme the theme for the user.
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *  * 
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

    let query = `UPDATE Members SET Theme = $1 WHERE MemberId = $2;`
    let values = [request.body.theme, request.decoded.memberid]
    pool.query(query, values)
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
