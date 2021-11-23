const API_KEY = process.env.OPENWEATHER_API_KEY

//express is the framework we're going to use to handle requests
const express = require('express')

//request module is needed to make a request to a web service
const request = require('request')

var router = express.Router()

/**
 * @api {get} /weather Request a list of Phish.net Blogs
 * @apiName GetWeather
 * @apiGroup Weather
 * 
 * @apiHeader {String} authorization JWT provided from Auth get
 * 
 * @apiDescription This end point is a pass through to the OpenWeather API. 
 * 
 */ 
 router.get("/", (req, res) => {
    var lat = 47.252876
    var lon = -122.444290
    // for info on use of tilde (`) making a String literal, see below. 
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=imperial&appid=${API_KEY}`
    
    //find the query string (parameters) sent to this end point and pass them on to
    // phish.net api call 
    //let n = req.originalUrl.indexOf('?') + 1
    //if(n > 0) {
    //    url += '&' + req.originalUrl.substring(n)
    //}

    //When this web service gets a request, make a request to the Phish Web service
     request(url, function (error, response, body) {
        if (error) {
            res.send(error)
        } else {
            // pass on everything (try out each of these in Postman to see the difference)
            // res.send(response);
            
            // or just pass on the body

            var n = body.indexOf("{")
            var nakidBody = body.substring(n - 1)

            res.send(nakidBody)
        }
    })

})

module.exports = router
