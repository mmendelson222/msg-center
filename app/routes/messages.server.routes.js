'use strict';
var messages = require('../../app/controllers/messages');

module.exports = function(app) {
	// Routing logic
    app.route('/messages')
        .put(messages.send)
	    .get(function(req, res){
            var body = '<h1>Send message service.</h1><p>Invoke this service using PUT.</p>';
            res.type('html').send(body);
        });

    //route through which twilio messages arrive
    app.route('/messages/receive')
        .post(messages.receive)
        .get(function(req, res){
            var body = '<h1>Receive message service.</h1><p>Invoke this service using POST.</p>';
            res.type('html').send(body);
        });
};