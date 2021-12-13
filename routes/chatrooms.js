//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const router = express.Router()

const msg_functions = require('../utilities/exports').messaging

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */ 

/**
 * @api {get} /chatrooms Request to get chat rooms 
 * @apiName GetChatrooms
 * @apiGroup Chatrooms
 * 
 * @apiDescription Request to get all the chat rooms that the user is part of
 * and the other members from the server.
 * 
 * @apiSuccess {Number} rowCount the number of entries in the chatrooms returned
 * @apiSuccess {String} members.memberid The id for the user
 * @apiSuccess {String} members.email The email of the member in the chatroom
 * @apiSuccess {String} members.username The name of the member in the chatroom
 * @apiSuccess {String} chatmembers.chatid The id of the chatroom
 * 
 * @apiError (404: MemberID Not Found) {String} message "Member ID Not Found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. memberId must be a number" 
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

    //let query = `SELECT * FROM Chatmembers WHERE Memberid=$1`
    let query = `SELECT Members.Email, Members.username, ChatMembers.ChatId
                    FROM ChatMembers
                    INNER JOIN Members ON ChatMembers.MemberId=Members.MemberId
                    WHERE ChatMembers.ChatId IN (SELECT ChatId FROM 
                        ChatMembers WHERE Memberid=$1)`

    let values = [request.decoded.memberid]
    pool.query(query, values)
        .then(result => {
            response.status(201).send({
                memberid: request.decoded.memberid,
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
/**
 * @api {delete} /chatrooms Request to delete chat rooms 
 * @apiName DeleteChatrooms
 * @apiGroup Chatrooms
 * 
 * @apiDescription Request to delete a specific chat room.
 * 
 * @apiSuccess {String} chatmembers.chatid The id of the chatroom
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.delete("/:chatid", (request, response, next) => {
    if (isStringProvided(request.params.chatid)) {
        let theQuery = `DELETE FROM Messages Where Chatid = $1`
        let values = [request.params.chatid]
        pool.query(theQuery, values)
            .then(result => {
                next()
            }).catch(err => {
                console.log(err)
                response.status(400).send({
                    message: "SQL Error",
                    error: err
                })
            })
    } else {
        response.status(400).send({
            message: "Missing values"
        })
    }
}, (request, response, next) => {
    let theQuery = "DELETE FROM ChatMembers Where Chatid = $1"
    let values = [request.params.chatid]
    pool.query(theQuery, values)
        .then(result => {
            next()
        }).catch(err => {
            console.log(err)
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
}, (request, response, next) => {
    let theQuery = "DELETE FROM Chats WHERE chatid = $1"
        let values = [request.params.chatid]
    pool.query(theQuery, values)
            .then(result => {
                next()
                // response.status(201).send({
                //     success:true
                // })
            }).catch(err => {
                console.log(err)
                response.status(400).send({
                    message: "SQL Error",
                    error: err
                })
            })
}, (request, response) => {
// send a notification of this message to ALL members with registered tokens
        const theQuery = `SELECT token FROM Push_Token
                        INNER JOIN ChatMembers ON
                        Push_Token.memberid=ChatMembers.memberid
                        WHERE ChatMembers.chatId=$1`
        const values = [request.params.chatid]
        pool.query(theQuery, values)
            .then(result => {
                response.message = result.rows
                console.log(response.message)
                console.log(request.decoded.email)
                result.rows.forEach(entry => 
                    msg_functions.sendChatToIndividual(
                        entry.token, 
                        response.message))
                response.send({
                    success:true,
                    chatID:request.params.chatid,
                    message:response.message
                })
            }).catch(err => {

                response.status(400).send({
                    message: "SQL Error on select from push token",
                    error: err
                })
            })
        })

module.exports = router