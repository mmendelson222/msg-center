'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Syndicate = mongoose.model('Syndicate'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Syndicate already exists';
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
 * Create a Syndicate
 */
exports.create = function(req, res) {
    var syndicate = new Syndicate(req.body);
    syndicate.user = req.user;
    syndicate.name = syndicate.name.toUpperCase();
    if (syndicate.message_tree) {
        try {
            syndicate.message_tree = JSON.parse(syndicate.message_tree);
        } catch (exception) {
            return res.send(400, {
                message: exception.message
            });
        }
    }

    syndicate.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(syndicate);
        }
    });
};

/**
 * Show the current Syndicate
 */
exports.read = function(req, res) {
    if (req.syndicate.message_tree) {
        req.syndicate.message_tree = JSON.stringify(req.syndicate.message_tree);
    }
	res.jsonp(req.syndicate);
};

/**
 * Update a Syndicate
 */
exports.update = function(req, res) {
	var syndicate = req.syndicate ;

	syndicate = _.extend(syndicate , req.body);
    syndicate.name = syndicate.name.toUpperCase();
    if (syndicate.message_tree) {
        try {
            syndicate.message_tree = JSON.parse(syndicate.message_tree);
        } catch (exception) {
            return res.send(400, {
                message: exception.message
            });
        }
    }

	syndicate.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(syndicate);
		}
	});
};

/**
 * Delete a Syndicate
 */
exports.delete = function(req, res) {
	var syndicate = req.syndicate ;

	syndicate.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(syndicate);
		}
	});
};

/**
 * List of Syndicates
 */
exports.list = function(req, res) { Syndicate.find().sort('-created').populate('user', 'displayName').exec(function(err, syndicates) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(syndicates);
		}
	});
};

/**
 * Syndicate middleware
 */
exports.syndicateByID = function(req, res, next, id) { Syndicate.findById(id).populate('user', 'displayName').exec(function(err, syndicate) {
		if (err) return next(err);
		if (! syndicate) return next(new Error('Failed to load Syndicate ' + id));
		req.syndicate = syndicate ;
		next();
	});
};

/**
 * Syndicate authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.syndicate.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};