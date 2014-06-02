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
    }
});

mongoose.model('Message', MessageSchema);