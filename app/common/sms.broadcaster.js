'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

// Load the twilio module
var twilio = require('twilio');

// Create a new REST API client to make authenticated requests against the twilio back end
var twilio_client = new twilio.RestClient();

var twilioConfig = {
    sid : 'TWILIO_ACCOUNT_SID',
    token : 'TWILIO_AUTH_TOKEN',
    number : 'TWILIO_NUMBER'
};


exports.sendMessage = function(message, oncomplete) {
    // Pass in parameters to the REST API using an object literal notation. The
    // REST client will handle authentication and response serialization for you.
    twilio_client.sms.messages.create({
        to: message.number,
        from: message.sentFrom,
        body: message.text
    }, function(err, messageInfo) {
        oncomplete(err, messageInfo);
    });
};


