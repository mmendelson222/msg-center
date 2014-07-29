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
    active :{
        type:Boolean,
        default: true
    },
    fullName:{
        type:String
    },
    firstName: {
        type:String
    },
    tree_state:{
        type:String
    },
	created: {
		type: Date,
		default: Date.now
	}
});

SubscriptionSchema.index({ number: 1, syndicate: 1 }, { unique: true });

mongoose.model('Subscription', SubscriptionSchema);