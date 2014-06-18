'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    _ = require('lodash');

// Load the twilio module
var twilio = require('twilio');

// Create a new REST API client to make authenticated requests against the twilio back end
var twilio_client = new twilio.RestClient();

var twilioConfig = {
    sid : 'TWILIO_ACCOUNT_SID',
    token : 'TWILIO_AUTH_TOKEN',
    number : 'TWILIO_NUMBER'
};

/**
 * Create a Message
 */
exports.receive = function(req, res) {

    console.log('\nTwilio service request received: '+req.url);
    var resp = new twilio.TwimlResponse();
    //var twilio_client = new twilio.RestClient();

    var text = req.body.Body;
    var reversed = text.split('').reverse().join('') + '...' + req.body.From;

    resp.sms(reversed);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(resp.toString());

};

/**
 * Outoing Message
 */
exports.send = function(req, res) {

    var message = new Message(req.body);

    // Pass in parameters to the REST API using an object literal notation. The
    // REST client will handle authentication and response serialzation for you.
    twilio_client.sms.messages.create({
        to:'3037154487',
        from:'7203167666',
        body:message.text
    }, function(error, messageInfo) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SID for this SMS message is:');
            console.log(messageInfo.sid);

            console.log('Message sent on:');
            console.log(messageInfo.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    });
};

/**
 * Show the current Message
 */
exports.read = function(req, res) {

};

/**
 * Update a Message
 */
exports.update = function(req, res) {

};

/**
 * Delete an Message
 */
exports.delete = function(req, res) {

};

/**
 * List of Messages
 */
exports.list = function(req, res) {
    var mockMessges = [
        {
            "created": "2014-05-29T02:36:19.308Z",
            "text":"This is a fake text message.",
            "user":{
                "displayName": "Bill Clinton"
            }
        },
        {
            "created": "2014-05-30T10:36:19.308Z",
            "text":"This text message is from a mock.",
            "user":{
                "displayName": "Barak Obama"
            }
        }
        ];
    res.jsonp(mockMessges);
};