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
    //for outgoing messages only
    response: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }

});

mongoose.model('Message', MessageSchema);