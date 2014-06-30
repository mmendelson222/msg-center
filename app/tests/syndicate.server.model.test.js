'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Syndicate = mongoose.model('Syndicate');

/**
 * Globals
 */
var user, syndicate;

/**
 * Unit tests
 */
describe('Syndicate Model Unit Tests:', function() {
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
			syndicate = new Syndicate({
				name: 'Syndicate Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return syndicate.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should fail when attempting to save without name', function(done) {
			syndicate.name = '';

			return syndicate.save(function(err) {
				should.exist(err);
				done();
			});
		});

        describe('Tree validation when saving', function() {
            it('should fail when attempting to save invalid JSON', function (done) {
                syndicate.message_tree = 'asdf';

                return syndicate.save(function (err) {
                    should.exist(err);
                    done();
                });
            });

            it('should fail when attempting to save non-compliant JSON ', function (done) {
                syndicate.message_tree = '{"JSON": true}';
                return syndicate.save(function (err) {
                    should.exist(err);
                    done();
                });
            });

            it('should succeed when saving a valid tree ', function (done) {
                syndicate.message_tree = '{"id": "root", "text":"here is some text"}';
                return syndicate.save(function (err) {
                    should.not.exist(err);
                    done();
                });
            });
        });

    });

	afterEach(function(done) { 
		Syndicate.remove().exec();
		User.remove().exec();

		done();
	});
});