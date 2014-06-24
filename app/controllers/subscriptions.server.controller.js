'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Subscription = mongoose.model('Subscription'),
	_ = require('lodash');

var processor = require('../common/message.processor');

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
    processor.parseMessage(req.body.text, function(parsed){
        if (parsed) {
            console.dir(parsed);
            res.jsonp(parsed);
        } else
            res.send(400, {'message': 'server error'});


        //process actions.
        switch (parsed.action) {
            case 'START':
                var subscription = new Subscription(req.body);
                subscription.user = req.user;
                subscription.syndicate = parsed.data;
                subscription.number = '000-000-0000';
                subscription.save(function (err) {
                    //if validation fails here, what do do?
                    if (err) {
                        console.dir(command + ' update failed with error: ' + err);
                        //res.send(400, {'message': 'server error: '+err});
                    }
                });
                break;
            case 'STOP':
                break;
            default:

        }
    });
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