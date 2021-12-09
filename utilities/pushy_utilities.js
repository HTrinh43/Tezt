const Pushy = require('pushy');

// Plug in your Secret API Key 
const pushyAPI = new Pushy(process.env.PUSHY_API_KEY);

//use to send message to a specific client by the token
function sendMessageToIndividual(token, message) {

    //build the message for Pushy to send
    var data = {
        "type": "msg",
        "message": message,
        "chatid": message.chatid
    }


    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}

//use to send contact to a specific client by the token
function sendContactToIndividual(token, message) {

    //build the message for Pushy to send
    let data = {
        "type": "contact",
        "message": message
    };

    // Send push notification via the Send Notifications API
    // https://pushy.me/docs/api/send-notifications
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success
        console.log('Push sent successfully! (ID: ' + id + ')');
    })
}

//use to send chat to a specific client by the token
function sendChatToIndividual(token, message) {

    //build the message for Pushy to send
    let data = {
        "type": "chat",
        "message": message,
        "chatid": message.chatid
    };

    // Send push notification via the Send Notifications API
    // https://pushy.me/docs/api/send-notifications
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success
        console.log('Push sent successfully! (ID: ' + id + ')');
    })
}

//add other "sendYypeToIndividual" functions here. Don't forget to export them

module.exports = {
    sendMessageToIndividual, sendContactToIndividual, sendChatToIndividual
};