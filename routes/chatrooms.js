//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const router = express.Router()

const msg_functions = require('../utilities/exports').messaging

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

/**
 * @api {get} /messages/:chatId?/:messageId? Request to get chat messages 
 * @apiName GetMessages
 * @apiGroup Messages
 * 
 * @apiDescription Request to get the 10 most recent chat messages
 * from the server in a given chat - chatId. If an optional messageId is provided,
 * return the 10 messages in the chat prior to (and not including) the message containing
 * MessageID.
 * 
 * @apiParam {Number} chatId the chat to look up. 
 * @apiParam {Number} messageId (Optional) return the 15 messages prior to this message
 * 
 * @apiSuccess {Number} rowCount the number of messages returned
 * @apiSuccess {Object[]} messages List of massages in the message table
 * @apiSuccess {String} messages.messageId The id for this message
 * @apiSuccess {String} messages.email The email of the user who posted this message
 * @apiSuccess {String} messages.message The message text
 * @apiSuccess {String} messages.timestamp The timestamp of when this message was posted
 * 
 * @apiError (404: ChatId Not Found) {String} message "Chat ID Not Found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. chatId must be a number" 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
 router.get("/", (request, response, next) => {
    //validate chatId is not empty or non-number
    if (request.decoded.memberid === undefined) {
        response.status(400).send({
            message: "Missing required information"
        })
    }  else if (isNaN(request.decoded.memberid)) {
        response.status(400).send({
            message: "Malformed parameter. memberId must be a number"
        })
    } else {
        next()
    }
}, (request, response, next) => {
    //validate that the MemberId exists
    let query = 'SELECT * FROM Members WHERE MemberId=$1'
    let values = [request.decoded.memberid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "Member ID not found"
                })
            } else {
                next()
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
}, (request, response) => {
    //perform the Select

    if (!request.params.chatId) {
        //no chatId provided. Use the largest possible integer value
        //allowed for the chatId in the db table. 
        request.params.chatId = 2**31 - 1
    }

    //let query = `SELECT * FROM Chatmembers WHERE Memberid=$1`
    let query = `SELECT Members.Email, Members.username,  
                    FROM ChatMembers
                    INNER JOIN Members ON ChatMembers.MemberId=Members.MemberId
                    WHERE Memberid=$1`
    let values = [request.decoded.memberid]
    pool.query(query, values)
        .then(result => {
            response.send({
                memberid: request.params.memberid,
                rowCount : result.rowCount,
                rows: result.rows
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
});
module.exports = router