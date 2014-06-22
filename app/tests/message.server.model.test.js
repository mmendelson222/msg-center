'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Message = mongoose.model('Message');

/**
 * Globals
 */
var message;

/**
 * Unit tests
 */
describe('Message Model Unit Tests:', function() {
	beforeEach(function(done) {
		message = new Message({
		    'text': 'Unit test',
            'number':'3037154487',
            'outgoing': true
		});

       message.save(function() {
			message = new Message({
				// Add model fields
				// ...
			});
		});
        done();
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return message.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Message.remove().exec();
		done();
	});
});