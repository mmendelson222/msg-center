'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Message Schema
 */
var MessageSchema = new Schema({
    text: {
        type: String,
        default: '',
        trim: true,
        required: 'Message text cannot be blank'
    },
    number: {
        type: String,
        default: '',
        trim: true,
        required: 'number cannot be blank'
    },
    outgoing: {
        type: Boolean,
        required: 'outgoing cannot be blank'
    },
    //for incoming messages only - what was the response?
    response: {
        type: String
    },
    //for outgoing messages only - which logged in user sent the message?  Pared down user object.
    sender: {

    },
    created: {
        type: Date,
        default: Date.now
    }

});

mongoose.model('Message', MessageSchema);