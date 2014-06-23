'use strict';
var users = require('../../app/controllers/users'),
    messages = require('../../app/controllers/messages');

module.exports = function(app) {
	// Routing logic
    app.route('/messages')
        .put(messages.subscribe)
	    /*.get(function(req, res){
            var body = '<h1>Send message service.</h1><p>Invoke this service using PUT.</p>';
            res.type('html').send(body);
        })*/
        .get(messages.list);
        //.post(users.requiresLogin, messages.create);

    //route through which twilio messages arrive
    app.route('/messages/receive')
        .post(messages.receive)
        .get(function(req, res){
            var body = '<h1>Receive message service.</h1><p>Invoke this service using POST.</p>';
            res.type('html').send(body);
        });
};