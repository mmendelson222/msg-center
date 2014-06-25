'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Subscription = mongoose.model('Subscription');

/**
 * Globals
 */
var user, subscription;

/**
 * Unit tests
 */
describe('Subscription Model Unit Tests:', function() {
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
			subscription = new Subscription({
				syndicate: 'TEST',
                number: '235',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return subscription.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

        it('should be able to show an error when try to save without number', function(done) {
            subscription.number = '';

            return subscription.save(function(err) {
                should.exist(err);
                ('ValidationError').should.equal(err.name);
                done();
            });
        });

        it('should fail to add the same number/syndicate combination again', function(done) {
            subscription.save(function(err) {
                should.not.exist(err);

                var duplicate = new Subscription({
                    syndicate: 'TEST',
                    number: '235'
                });

                duplicate.save(function(err) {
                    should.exist(err);
                    (11000).should.equal(err.code);
                    done();
                });

            });


        });
 	});


	afterEach(function(done) {
		Subscription.remove().exec();
		User.remove().exec();

		done();
	});
});