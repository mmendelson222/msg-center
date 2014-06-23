'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Subscription = mongoose.model('Subscription'),
    Syndicate = mongoose.model('Syndicate'),
	_ = require('lodash');

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
                        'action': 'start ' + target,
                        'message': 'You have subscribed to ' + target + ' messages.'
                    });
                }
                break;
            case 'STOP':
                if (syndicate) {
                    return callback({
                        'action': 'stop ' + target,
                        'message': 'You have unsubscribed.  To resubscribe text START ' + target + ' to this number'
                    });
                }
                break;
            default:
                return callback({
                    'action': 'error ' + target,
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

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Subscription already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Subscription
 */
exports.create = function(req, res) {
	var subscription = new Subscription(req.body);
	subscription.user = req.user;

    exports.parseMessage(req.body.text, function(parsed){
        if (parsed) {
            console.dir(parsed);
            res.jsonp(parsed);
        } else
            res.send(400, {'message': 'server error'});
    });

    /*
    subscription.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(subscription);
		}
	});
	*/
};



/**
 * Show the current Subscription
 */
exports.read = function(req, res) {
	res.jsonp(req.subscription);
};

/**
 * Update a Subscription
 */
exports.update = function(req, res) {
	var subscription = req.subscription ;

	subscription = _.extend(subscription , req.body);

	subscription.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(subscription);
		}
	});
};

/**
 * Delete an Subscription
 */
exports.delete = function(req, res) {
	var subscription = req.subscription ;

	subscription.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(subscription);
		}
	});
};

/**
 * List of Subscriptions
 */
exports.list = function(req, res) { Subscription.find().sort({'created':-1}).populate('user', 'displayName').exec(function(err, subscriptions) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(subscriptions);
		}
	});
};

/**
 * Subscription middleware
 */
exports.subscriptionByID = function(req, res, next, id) { Subscription.findById(id).populate('user', 'displayName').exec(function(err, subscription) {
		if (err) return next(err);
		if (! subscription) return next(new Error('Failed to load Subscription ' + id));
		req.subscription = subscription ;
		next();
	});
};

/**
 * Subscription authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.subscription.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};