'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    Syndicate = mongoose.model('Syndicate'),
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

var helpInfo = {
    'action':'help',
    'message':'Commands: START [NAME] or STOP [NAME].  You are subscribed to [TODO]'
};

exports.parseMessage = function(text) {
    var a = text.split(' ');
    var command = a[0].toUpperCase();
    if (a.length < 2 ||  command === 'HELP'){
        return helpInfo;
    }

    switch (command) {
        case 'START':
            return {
                'action': 'start ' + a[1],
                'message': 'You have subscribed to ' + a[1] + ' messages.'
            };
        case 'STOP':
            return {
                'action': 'stop '+a[1],
                'message': 'You have unsubscribed.  To resubscribe text START '+a[1]+' to this number'
            };
        default:
            return {
                'action': 'error '+a[1],
                'message': 'I don\'t know what to do with that command.  '+helpInfo.message
            };
    }

/*
    Syndicate.findOne({'syndicate': }).sort('-created').populate('user', 'displayName').exec(function(err, syndicates) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(syndicates);
        }
    });
*/


};

/**
 * Create a Message
 */
exports.receive = function(req, res) {

    console.log('\nTwilio service request received: '+req.url);
    var resp = new twilio.TwimlResponse();
    //var twilio_client = new twilio.RestClient();

    var text = req.body.Body;

    var parsed = exports.parseMessage(text);

    //var reversed = text.split('').reverse().join('') + '...' + req.body.From;

    var message = new Message({
        'text': req.body.Body,
        'number': req.body.From,
        'outgoing': false,
        'response':parsed.message
    });
    message.save();

    resp.sms(message.response);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(resp.toString());
};

/**
 * Outoing Message
 */
exports.send = function(req, res) {

    var sendTo = '3037154487',
        sentFrom = '7203167666',
        user = req.user;

    var message = new Message({
        'text': req.body.text,
        'number': sendTo,
        'outgoing': true,
        'sender': {
            'displayName':user.displayName,
            'username':user.username
        }
    });
    message.save();

    // Pass in parameters to the REST API using an object literal notation. The
    // REST client will handle authentication and response serialzation for you.
    twilio_client.sms.messages.create({
        to: sendTo,
        from: sentFrom,
        body:message.text
    }, function(error, messageInfo) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The 'error" variable will contain error information, if any.
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
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Message already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }
    return message;
};

/**
 * Save an Message

exports.save = function(req, res) {
console.log("saving");
    console.dir("xsaving");
}; */


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
    //newest on top
    Message.find().sort({'created':-1}).exec(function(err, messages) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(messages);
        }
    });
};