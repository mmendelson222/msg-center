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
            Subscription.update({'_id': subs[0]._id}, {'active' : false}, function (err) {
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
exports.subscribe = function(syndicateName, number, callback){
    Syndicate.find({'name':syndicateName}, function(err, syndicates){
        if (syndicates.length === 0) {
            return callback({
                'action': 'error',
                'data': syndicateName,
                'message': 'Sorry, there is no group called ' + syndicateName + '.'
            });
        } else {
            var subscription = new Subscription();
            Subscription.find({'syndicate':syndicateName, 'number': number}, function(err, subs) {
                if (subs.length == 0) {
                    subscription.syndicate = syndicateName;
                    subscription.number = number;
                    subscription.save(function (err) {
                        if (err) {
                            return callback({
                                'action': 'error',
                                'data': syndicateName,
                                'message': 'START failed with error: ' + err
                            });
                        } else {
                            var syndicate = syndicates[0];
                            var greet;
                            if (syndicate.message_tree) {
                                greet = syndicate.message_tree.text;
                            } else {
                                greet = syndicate.greetings.started.replace('%1', syndicateName);
                            }
                            return callback({
                                'action': 'START',
                                'data': syndicate,
                                'message': greet
                            });
                        }
                    });
                } else {
                    return callback({
                        'action': 'error',
                        'data': syndicateName,
                        'message': 'You are already subscribed to ' + syndicateName
                    });
                }
            });
        }
    });
};