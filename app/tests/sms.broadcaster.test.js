'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Article = mongoose.model('Article');

var Broadcaster = require('../common/sms.broadcaster');

/**
 * Globals
 */
var user, article;

/**
 * Unit tests
 */
describe('Article Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() {
			article = new Article({
				title: 'Article Title',
				content: 'Article Content',
				user: user
			});

			done();
		});
	});

	describe('SMS Broadcaster functions: ', function() {
		it.skip('should be able to send a message', function(done) {
            var message =  {
                'text': 'Test message',
                'number': 3037154487,
                'sentFrom': 7203167666
            };

            Broadcaster.sendMessage(message,
                function (err, messageInfo){
                    // The HTTP request to Twilio will run asynchronously. This callback
                    // function will be called when a response is received from Twilio
                    // The 'error" variable will contain error information, if any.
                    // If the request was successful, this value will be "falsy"

                    if (err) {
                        //console.dir('Failure: '+JSON.stringify(err));
                        (err === null).should.equal(true, JSON.stringify(err));
                    } else {
                        // The second argument to the callback will contain the information
                        // sent back by Twilio for the request. In this case, it is the
                        // information about the text messsage you just sent:
                        console.dir(JSON.stringify(messageInfo));
                    }
                    done();
                }
            );
		});
	});

	afterEach(function(done) {
		Article.remove().exec();
		User.remove().exec();
		done();
	});
});