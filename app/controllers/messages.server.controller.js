'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    Subscription = mongoose.model('Subscription'),
    _ = require('lodash');

var Processor = require('../common/message.processor'),
    Broadcaster = require('../common/sms.broadcaster');

var twilio = require('twilio');

/**
 * This is invoked when a message is received from Twilio.
 */
exports.receive = function(req, res) {
    console.log('\nTwilio service request received: '+req.url);
    var resp = new twilio.TwimlResponse();
    var text = req.body.Body;
    var number = req.body.From;

    //Invoke ProcessMessage to create a response.
    Processor.processMessage(text, number, function(parsed){

        //persist a record of the text and response to the database.
        var message = new Message({
            'text': text,
            'number': number,
            'outgoing': false,
            'response':parsed.message
        });
        message.save();

        //Response goes back to Twilio and return message is sent.
        resp.sms(message.response);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(resp.toString());
    });
};


var sendTo = '3037154487';

/**
 * Send a one-way outgoing message
 */
exports.send = function(req, res) {
    var user = req.user;
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

    //Not sure if this would break mongoose validation.  Test this later, but in the meantime, add this after save.
    message.sentFrom = '7203167666';

    Broadcaster.sendMessage(message,
        function (err, messageInfo){
            // The HTTP request to Twilio will run asynchronously. This callback
            // function will be called when a response is received from Twilio
            // The 'error" variable will contain error information, if any.
            // If the request was successful, this value will be "falsy"

            if (err) {
                return res.send(400, {
                    message: err
                });
            } else {
                // The second argument to the callback will contain the information
                // sent back by Twilio for the request. In this case, it is the
                // information about the text messsage you just sent:
                // console.log(messageInfo.sid);
                // console.log('Message sent on:');
                // console.log(messageInfo.dateCreated);
                res.jsonp({'message':'Message '+messageInfo.status+' to '+messageInfo.to});
            }
        }
    );
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