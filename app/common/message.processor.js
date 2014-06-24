'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var mongoose = require('mongoose'),
    Syndicate = mongoose.model('Syndicate');

exports.parseMessage = function(text, callback) {
    var helpInfo = {
        'action':'help',
        'message':'Commands: START [NAME] or STOP [NAME].  You are subscribed to [TODO]'
    };

    if (!text)
        return callback({'action': 'error','message': 'Text is empty'});

    var a = text.split(' ');
    var command = a[0].toUpperCase();
    if (a.length < 2 ||  command === 'HELP')
        return callback(helpInfo);

    var target = a[1].toUpperCase();

    Syndicate.findOne({'name':target}, function(err, syndicate){
        switch (command) {
            case 'START':
                if (syndicate) {
                    return callback({
                        'action': command,
                        'data': target,
                        'message': 'You have subscribed to ' + target + ' messages.'
                    });
                }
                break;
            case 'STOP':
                if (syndicate) {
                    return callback({
                        'action': command,
                        'data': target,
                        'message': 'You have unsubscribed.  To resubscribe text START ' + target + ' to this number'
                    });
                }
                break;
            default:
                return callback({
                    'action': command,
                    'data': target,
                    'message': 'I don\'t know what to do with that command.  ' + helpInfo.message
                });
        }

        //fallthrough - unknown command.
        callback({
            'action': 'error ',
            'message': 'Group '+target+' does not exist.'
        });
    });
};