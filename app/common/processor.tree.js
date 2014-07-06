'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var mongoose = require('mongoose'),
    Syndicate = mongoose.model('Syndicate'),
    Subscription = mongoose.model('Subscription');


exports.parseCommand = function(msg_text, number, callback){
    return callback({
        'action': 'next',
        'data': null,
        'message': 'tree is not implemented yet'
    });

};

