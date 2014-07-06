'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var mongoose = require('mongoose'),
    Syndicate = mongoose.model('Syndicate'),
    Subscription = mongoose.model('Subscription');

exports.parseCommand = function(msg_text, number, callback){
    var commandDataPair = msg_text.split(/\s(.+)?/);
    commandDataPair[0]=commandDataPair[0].toUpperCase();

    var command = commandDataPair[0];
    var target = commandDataPair[1];

    switch (command.toUpperCase()) {
        case 'START':
            exports.subscribe(target.toUpperCase(), number, callback);
            break;
        case 'STOP':
            exports.unsubscribe(target.toUpperCase(), number, callback);
            break;
        case 'NAME':
            exports.updateName(number, target, callback);
            break;
        default:
            return callback({
                'action': 'next',
                'message': 'Request is unhandled'
            });
    }
};

exports.updateName = function(number, name, callback){
    if (!name){
        return callback({
            'action': 'error',
            'data': '',
            'message': 'No name given'
        });
    }

    var conditions = { number: number };
    var update = { $set: { fullName: name, firstName: name.split(' ')[0] }};
    var options = { multi: true };

    Subscription.update(conditions, update, options, function (err, count, raw) {
        //console.dir('count is ' + count);
        //console.dir('The raw response from Mongo was '+ JSON.stringify(raw));
        if (err) {
            return callback({
                'action': 'error',
                'data': name,
                'message': 'NAME failed with error: ' + err
            });
        } else if (count > 0) {
            return callback({
                'action': 'NAME',
                'data': name,
                'message': 'Your name has been changed to ' + name
            });
        } else {
            return callback({
                'action': 'error',
                'data': name,
                'message': 'No subscriptions found.'
            });
        }
    });
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