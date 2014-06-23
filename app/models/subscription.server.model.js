'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Subscription Schema
 */
var SubscriptionSchema = new Schema({
    number: {
        type: String,
        default: '',
        trim: true,
        required: 'number cannot be blank'
    },
	syndicate: {
		type: String,
		default: '',
		required: 'Please fill syndicate name',
		trim: true
	},
    fullName:{
        type:String
    },
    firstName: {
        type:String
    },
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Subscription', SubscriptionSchema);