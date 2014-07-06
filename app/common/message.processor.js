'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var Commands = require('../common/processor.commands'),
Tree = require('../common/processor.tree');

var helpInfo = {
    'action':'help',
    'message':'Commands: START [NAME] or STOP [NAME].  You are subscribed to [TODO]'
};


exports.processMessage = function(msg_text, number, callback) {
    if (!msg_text)
        return callback({'action': 'error','message': 'Text is empty'});

    //so the question is - how to make this code more elegant.
    Commands.parseCommand (msg_text, number, function(data) {
        if (data.action === 'next'){

            Tree.parseCommand (msg_text, number, function(data) {
                if (data.action === 'next'){
                    //unhandled
                    return callback(helpInfo);
                }else {
                    return callback(data);
                }
            });
        } else {
            return callback(data);
        }
    });
};


