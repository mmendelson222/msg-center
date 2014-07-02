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

exports.processMessage = function(msg_text, number, callback) {
    if (!msg_text)
        return callback({'action': 'error','message': 'Text is empty'});

    exports.parseCommand (msg_text, number, callback);
};


exports.parseCommand = function(msg_text, number, callback){
    var commandDataPair = msg_text.toUpperCase().split(/\s(.+)?/);
    commandDataPair[0]=commandDataPair[0].toUpperCase();
    if (commandDataPair.length < 2 ||  commandDataPair[0] === 'HELP')
     return callback(helpInfo);

    var command = commandDataPair[0];
    var target = commandDataPair[1];

    switch (command) {
        case 'START':
            exports.subscribe(target, number, callback);
            break;
        case 'STOP':
            exports.unsubscribe(target, number, callback);
            break;
        case 'NAME':
            exports.updateName(target, number, callback);
            break;
        default:
            return callback({
                'action': command,
                'data': target,
                'message': 'I don\'t know what to do with that command.  ' + helpInfo.message
            });
    }
};

exports.unsubscribe = function(syndicate, number, callback){
    Subscription.find({'syndicate':syndicate, 'number': number}, function(err, subs){
        if (subs.length === 0) {
            return callback({
                'action': 'error',
                'data': null,
                'message': 'You are not a member of that group.'
            });
        } else {
            Subscription.remove({'_id': subs[0]._id}, function (err) {
                if (err) {
                    return callback({
                        'action': 'error',
                        'data': syndicate,
                        'message': 'STOP failed with error: ' + err
                    });
                } else {
                    return callback({
                        'action': 'STOP',
                        'data': syndicate,
                        'message': 'You have unsubscribed.  To resubscribe text START ' + syndicate + ' to this number'
                    });
                }
            });
        }
    });
};


//process subscribe or unsubscribe requests
exports.subscribe = function(syndicate, number, callback){
    Syndicate.find({'name':syndicate}, function(err, syndicates){
        if (syndicates.length === 0) {
            return callback({
                'action': 'error',
                'data': syndicate,
                'message': 'Sorry, there is no group called ' + syndicate + '.'
            });
        } else {
            var subscription = new Subscription();
            subscription.syndicate = syndicate;
            subscription.number = number;
            subscription.save(function (err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            return callback({
                                'action': 'error',
                                'data': syndicate,
                                'message': 'You are already subscribed to ' + syndicate
                            });
                        default:
                            return callback({
                                'action': 'error',
                                'data': syndicate,
                                'message': 'START failed with error: ' + err
                            });
                    }

                } else {
                    return callback({
                        'action': 'START',
                        'data': syndicate,
                        'message': 'You have subscribed to ' + syndicate + ' messages.'
                    });
                }
            });
        }
    });
};