'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var mongoose = require('mongoose'),
    Syndicate = mongoose.model('Syndicate'),
    Subscription = mongoose.model('Subscription');

var helpInfo = {
    'action':'help',
    'message':'Commands: START [NAME] or STOP [NAME].  You are subscribed to [TODO]'
};

exports.parseMessage = function(msg_text, callback) {
    if (!msg_text)
        return callback({'action': 'error','message': 'Text is empty'});

    exports.parseCommand (msg_text, callback);
};


exports.parseCommand = function(msg_text, callback){
    var commandDataPair = msg_text.toUpperCase().split(/\s(.+)?/);
    commandDataPair[0]=commandDataPair[0].toUpperCase();
    if (commandDataPair.length < 2 ||  commandDataPair[0] === 'HELP')
     return callback(helpInfo);

    var command = commandDataPair[0];
    var target = commandDataPair[1];

    switch (command) {
        case 'START':
        case 'STOP':
            exports.subscribe(msg_text, command, target, callback);
            break;
        default:
            return callback({
                'action': command,
                'data': target,
                'message': 'I don\'t know what to do with that command.  ' + helpInfo.message
            });
    }
};
//exports.treeRequest = function(command, )


//process subscribe or unsubscribe requests
exports.subscribe = function(msg_text, command, target, callback){
    Syndicate.findOne({'name':target}, function(err, syndicate){
        var subscription = new Subscription();
        subscription.syndicate = target;
        subscription.number = '000-000-0000';

        switch (command) {
            case 'START':
                if (syndicate) {
                    subscription.save(function (err) {
                        if (err) {
                            return callback({
                                'action': command,
                                'data': target,
                                'message': command + ' failed with error: ' + err
                            });
                        } else {
                            return callback({
                                'action': command,
                                'data': target,
                                'message': 'You have subscribed to ' + target + ' messages.'
                            });
                        }
                    });
                }
                break;
            case 'STOP':
                if (syndicate) {
                    Subscription.remove({'syndicate':'TEST', 'number':'000-000-0000'}, function(err) {
                        if (err) {
                            return callback({
                                'action': command,
                                'data': target,
                                'message': command + ' failed with error: ' + err
                            });
                        } else {
                            return callback({
                                'action': command,
                                'data': target,
                                'message': 'You have unsubscribed.  To resubscribe text START ' + target + ' to this number'
                            });
                        }
                    });
                }
                break;
        }
    });
};