'use strict';

/**
 * Module dependencies.
 */
var should = require('should');
var Processor = require('../common/message.processor'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Syndicate = mongoose.model('Syndicate'),
    Subscription = mongoose.model('Subscription');

var user, syndicate;

/**
 * Unit tests
 */
describe('Message Processor Unit Tests:', function() {
    beforeEach(function(done) {
        user = new User({
            firstName: 'First',
            lastName: 'Last',
            displayName: 'First Last',
            email: 'test@test.com',
            username: 'username',
            password: 'password'
        });

        user.save(function() {
            syndicate = new Syndicate({
                name: 'TEST',
                user: user
            });
            syndicate.save(function(err) {
                done();
            });
        });
    });

    describe('Message Parsing', function() {
        it('parse a subscribe request', function(done) {
            Processor.parseMessage('START TEST', function (result){
                should.exist(result);
                result.message.should.startWith('You have subscribed');
                result.action.should.equal('START');
                done();
            });
       });

        it('unsubscribe request', function(done) {
            Processor.parseMessage('STOP TEST', function (result){
                should.exist(result);
                result.message.should.startWith('You have unsubscribed');
                result.action.should.equal('STOP');
                done();
            });
        });

        it('invalid command returns help', function(done) {
            Processor.parseMessage('asdf', function (result){
                should.exist(result);
                result.action.should.equal('help');
                done();
            });
        });
    });


    afterEach(function(done) {
        Subscription.remove().exec();
        Syndicate.remove().exec();
        User.remove().exec();
        done();
    });
});