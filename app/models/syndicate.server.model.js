'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    Tree = require('../common/message.tree');  //for validation


//TODO: How to return specific validation error???
var validateTree = function(property) {
    var json;
    try {
        json = JSON.parse(property);
    } catch(exception) {
        return false;
    }
    var errors = Tree.treeIntegrity(json);
    if (errors){
        //console.dir(errors.join(', '));
        return false;
    }
    return true;
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
        type: String,
        trim: true,
        //validate: [validateJSON, 'This field needs to contain valid JSON']
        validate: [validateTree, 'Tree failed validation']
    }
});

mongoose.model('Syndicate', SyndicateSchema);