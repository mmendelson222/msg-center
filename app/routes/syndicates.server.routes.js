'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var syndicates = require('../../app/controllers/syndicates');

	// Syndicates Routes
	app.route('/syndicates')
		.get(syndicates.list)
		.post(users.requiresLogin, syndicates.create);

	app.route('/syndicates/:syndicateId')
		.get(syndicates.read)
		.put(users.requiresLogin, syndicates.hasAuthorization, syndicates.update)
		.delete(users.requiresLogin, syndicates.hasAuthorization, syndicates.delete);

	// Finish by binding the Syndicate middleware
	app.param('syndicateId', syndicates.syndicateByID);
};