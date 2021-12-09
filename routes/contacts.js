//express is the framework we're going to use to handle requests
const express = require('express')

var router = express.Router()

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const msg_functions = require('../utilities/exports').messaging

const validation = require('../utilities/exports').validation
let isStringProvided = validation.isStringProvided


/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */ 

/**
 * @api {post} /contacts request to add a contact to a given user
 * @apiName PostContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to add a contact to a given user.
 * 
 * @apiParam {String} name someone's name *unique
 * @apiParam {String} message a message to store with the name
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} message the inserted name
 * 
 * @apiError (400: Name exists) {String} message "Name exists"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *  
 * @apiUse JSONError
 */ 
router.post("/", (request, response, next) => {
    if (isStringProvided(request.body.contact)) {
        console.log(request.decoded.email)
        console.log(request.body.contact)
        const theQuery = "(SELECT Memberid, 1 sortby FROM Members WHERE Email=$1) " +
            "UNION (SELECT Memberid, 2 sortby FROM Members WHERE Email=$2) ORDER BY sortby"
        const values = [request.decoded.email, request.body.contact]

        pool.query(theQuery, values)
            .then(result => {
                if (typeof result.rows[1] !== 'undefined') {
                    response.locals.user = result.rows[0].memberid
                    response.locals.contact = result.rows[1].memberid
                    console.log(result.rows[0].memberid)
                    console.log(result.rows[1].memberid)
                    console.log("got here")
                    next()
                } else {
                    response.status(400).send({
                        message: "contact does not exist"
                    })
                }

            })
            .catch(err => {
                //log the error
                console.log(err)
                if (err.constraint == "contact_name_key") {
                    response.status(400).send({
                        message: "Name exists"
                    })
                } else {
                    response.status(400).send({
                        message: err.detail
                    })
                }
            }) 
            
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
}, (request, response, next)  => {
    const theQuery = "INSERT INTO CONTACTS(memberid_a, memberid_b) VALUES ($1, $2) RETURNING *"
    const values = [response.locals.user, response.locals.contact]
    pool.query(theQuery, values)
        .then(result => {
            response.message = result.rows
            next()
            // response.status(201).send({
            //     success: true,
            //     message: "Inserted: " + result.rows
            // })
        })
        .catch(err => {
            //log the error
            console.log(err)
            if (err.constraint == "contact_name_key") {
                response.status(400).send({
                    message: "Name exists"
                })
            } else {
                response.status(400).send({
                    message: err.detail
                })
            }
        }) 
}, (request, response) => {
    // send a notification of this message to ALL members with registered tokens
    let query = `SELECT token FROM Push_Token
                    INNER JOIN Contacts ON
                    Push_Token.memberid=Contacts.memberid_b
                    WHERE Contacts.memberid_b=$1`
    let values = [response.locals.contact]
    pool.query(query, values)
        .then(result => {
            console.log(request.decoded.email)
            console.log(request.body.message)
            result.rows.forEach(entry => 
                msg_functions.sendContactToIndividual(
                    entry.token,
                    response.message))
            response.send({
                success:true
            })
        }).catch(err => {

            response.status(400).send({
                message: "SQL Error on select from push token",
                error: err
            })
        })
})

/**
 * @api {get} /contacts/:name? Request to get all contact entries in the DB
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get all the contact entries for the user.
 * 
 * @apiParam {String} [name] the contacts to look up. 
 * 
 * @apiSuccess {boolean} success true when the name is inserted
 * @apiSuccess {Object[]} names List of user (contacts) in the Contacts DB
 * @apiSuccess {String} contacts.memberid_b The contact in relation to memberid_a
 * @apiSuccess {String} contacts.verified The verification status of contact
 * 
 * @apiError (404: ID Not Found) {String} message "ID not found"
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * @apiError (400: Missing User ID) {String} message "Missing User ID"
 * 
 * @apiUse JSONError
 */ 
 router.get("/", (request, response, next) => {

    //const theQuery = 'SELECT contacts.memberid_b, contacts.verified, members.firstname FROM ((Contacts INNER JOIN firstname ON contact.memberid_b = members.memberid) (Contacts WHERE memberid_a=$1)'
    

    //No name was sent so SELECT on all
    //is there a reason to do this?
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
    const theQuery = 
    `SELECT members.email, contacts.verified, contacts.memberid_b, contacts.memberid_a FROM contacts 
    INNER JOIN members ON ((Contacts.memberid_b = $1  AND Contacts.memberid_a = Members.memberid ) 
    OR (Contacts.memberid_a = $1 AND Members.memberid = Contacts.memberid_b))`

    let values = [request.decoded.memberid]



    pool.query(theQuery, values)
        .then(result => {
            response.send({
                success: true,
                contacts: result.rows
            })

        }).catch(err => {
            //log the error
            // console.log(err.details)
            response.status(400).send({
                message: err.detail
            })
        })
})      

/**
 * @api {get} /contacts/search:keyword Request to get all emails similar to the keyword.
 * @apiName GetSearchContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get all emails similar to the keyword.
 * 
 * @apiParam {String} [keyword] the keyword being searched.
 * 
 * @apiSuccess {boolean} success true when the search is completed.
 * @apiSuccess {Object[]} names List of users in the Members DB that match the searc.
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * @apiError (400: Missing Keyword) {String} message "Missing required information"
 * 
 * @apiUse JSONError
 */ 
 router.get("/search/:keyword", (request, response, next) => {
    console.log(request.params.keyword);
    if (request.params.keyword === undefined) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else {
        next()
    }
}, (request, response) => {
    let keyword = request.params.keyword + "%"
    console.log(keyword)
    const theQuery = "SELECT Members.Email, Members.memberid From Members WHERE Email LIKE $1"
    let values = [keyword]
    console.log(theQuery);

    pool.query(theQuery, values)
        .then(result => {
            response.send({
                success: true,
                contacts: result.rows
            })

        }).catch(err => {
            //log the error
            // console.log(err.details)
            response.status(400).send({
                message: err.detail
            })
        })
})
/**
 * @api {put} /contacts Request to update contact verification and name
 * @apiName PutContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to update contact verification and name.
 * 
 * @apiParam {String} verification status of contact
 * @apiParam {String} contact id of associated contact
 * @apiParam {String} user id of associated user
 * 
 * @apiSuccess {boolean} success true when the contact is updated
 * @apiSuccess {String} message Updated user ID x contact ID y to verification status z
 * 
 * @apiError (404: Name Not Found) {String} message "Contact info not found"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.put("/", (request, response, next) => {
    if (isStringProvided(request.body.verification) && isStringProvided(request.body.contact)) {
        const theQuery = "(SELECT Memberid, 1 sortby FROM Members WHERE Email=$1) " +
            "UNION (SELECT Memberid, 2 sortby FROM Members WHERE Email=$2 ORDER BY sortby)"
        const values = [request.decoded.email, request.body.contact]

        pool.query(theQuery, values)
            .then(result => {
                if (typeof result.rows[1] !== 'undefined') {
                    response.locals.user = result.rows[0].memberid
                    response.locals.contact = result.rows[1].memberid
                    console.log(result.rows[0].memberid)
                    console.log(result.rows[1].memberid)
                    console.log("got here")
                    next()
                } else {
                    response.status(400).send({
                        message: "contact does not exist"
                    })
                }

            })
            .catch(err => {
                //log the error
                console.log(err)
                    response.status(400).send({
                        message: err.detail
                    })
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
}, (request, response) => {
    const theQuery = "UPDATE Contacts SET verified = $1 WHERE (memberid_b = $2 AND memberid_a = $3)" +
    " OR (memberid_b = $3 AND memberid_a = $2) RETURNING *"
    const values = [request.body.verification, response.locals.contact, response.locals.user]
    console.log(theQuery)   
    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                response.send({
                    success: true,
                    message: "Updated user ID " + result.rows[0].memberid_b + " contact ID " + result.rows[0].memberid_a + " to verification status " + result.rows[0].verified
                })
            } else {
                response.status(404).send({
                    message: "Contact info not found"
                })
            }
        })
        .catch(err => {
            //log the error
            // console.log(err)
            response.status(400).send({
                message: err.detail
            })
        }) 
})

/**
 * @api {delete} /contact/:user_contact Request to remove entry in the DB for name
 * @apiName DeleteContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to remove entry in the database for a specific name.
 * 
 * @apiParam {String} user_contact the userID and contactID separated by an underscore
 * 
 * @apiSuccess {boolean} success true when the contact relation is deleted
 * @apiSuccess {String} message the userID and contactID deleted
 * 
 * @apiError (404: User and Contact Not Found) {String} message "User and associated contact not found"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: User and Contact not valid) {String} message "User and Contact must exist and have length greater than 0"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.delete("/:contact", (request, response, next) => {
    if (isStringProvided(request.params.contact)) {
        const theQuery = "(SELECT Memberid FROM Members WHERE Email=$1) " +
            "UNION (SELECT Memberid FROM Members WHERE Email=$2)"
        const values = [request.decoded.email, request.params.contact]

        pool.query(theQuery, values)
            .then(result => {
                if (typeof result.rows[1] !== 'undefined') {
                    response.locals.user = result.rows[0].memberid
                    response.locals.contact = result.rows[1].memberid
                    console.log(result.rows[0].memberid)
                    console.log(result.rows[1].memberid)
                    console.log("got here")
                    next()
                } else {
                    response.status(400).send({
                        message: "contact does not exist"
                    })
                }

            })
            .catch(err => {
                //log the error
                console.log(err)
                    response.status(400).send({
                        message: err.detail
                    })
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
        
}, (request, response, next)  => {
        
    const theQuery = "DELETE FROM Contacts WHERE (memberid_a=$1 AND memberid_b=$2) OR (memberid_a=$2 AND memberid_b=$1) RETURNING *"
    const values = [response.locals.user, response.locals.contact]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount >= 1) {
                response.message = "Deleted Contact: " + response.locals.contact + " from user " + response.locals.user
                response.locals.rows = result.rows[0]
                next()
                // response.send({
                //     success: true,
                //     message: "Deleted Contact: " + response.locals.contact + " from user " + response.locals.user
                // })
            } else {
                response.status(404).send({
                    message: "User and associated contact not found"
                })
            }
        })
        .catch(err => {
            //log the error
            console.log(err)
            response.status(400).send({
                message: err.detail
            })
        }) 
}, (request, response) => {
    // send a notification of this message to ALL members with registered tokens
    let query = `SELECT token FROM Push_Token
                    INNER JOIN Contacts ON
                    Push_Token.memberid=Contacts.memberid_b
                    WHERE Contacts.memberid_b=$1`
    let values = [response.locals.contact]
    pool.query(query, values)
        .then(result => {
            console.log(request.decoded.email)
            console.log(request.body.message)
            result.rows.forEach(entry => 
                msg_functions.sendContactToIndividual(
                    entry.token,
                    response.message))
            response.send({
                success:true
            })
        }).catch(err => {

            response.status(400).send({
                message: "SQL Error on select from push token",
                error: err
            })
        })
})

module.exports = router