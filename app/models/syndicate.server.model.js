'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    Tree = require('../common/message.tree');  //for validation

var ValidationError = require('mongoose/lib/error/validation');
var ValidatorError =  require('mongoose/lib/error/validator');

//This validator returns a specific error message.
var validationErrors = function(json) {
    var errors = Tree.treeIntegrity(json);
    if (errors){
        return errors.join(', ') + JSON.stringify(json);
    }
    return null;
};


/**
 * Syndicate Schema
 */
var SyndicateSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Syndicate name',
        unique: true,
		trim: true
	},
    greetings: {
        started: {
            type: String,
            default: 'You have subscribed to %1.  Please reply with NAME [YOUR NAME] so that we can greet you (optional).',
            trim: true
        },
        named: {
            type: String,
            default: 'Hi %1, thanks for setting your name.',
            trim: true
        },
        stopped: {
            type: String,
            default: 'You have been removed from %1',
            trim: true
        }
    },
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    calendar_id : {
        type: String,
        trim: true
    },
    message_tree : {
        type: Object,
        trim: true
        //validate: [validateTree, 'Tree failed validation']
    }
});

//this scenario allows us to pass in any validation message we want.
SyndicateSchema.pre('save', function(next){
    if (!this.message_tree)
        next();
    else {
        var userErrors = validationErrors(this.message_tree);
        if (userErrors) {
            var error = new ValidationError(this);
            error.errors.message_tree = new ValidatorError('message_tree', userErrors, this.message_tree);
            next(error);
        } else {
            next();
        }
    }
});

mongoose.model('Syndicate', SyndicateSchema);