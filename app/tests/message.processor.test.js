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
var test_number = '000-000-0000';

function assertSubscriptionInDB(syndicate, number, shouldExist, done){
    Subscription.find({'syndicate':syndicate, 'number':number}, function(err, results){
       (err === null).should.equal(true);
       if (shouldExist){
           results.length.should.equal(1);
           done();
       } else {
           results.length.should.equal(0);
           done();
       }
    });
}


function assertSubscriptionNamed(syndicate, number, shouldExist, done){
    (0).should.equal(1, 'unimplemented');
    done();
}

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
            Processor.processMessage('START TEST', test_number, function (result){
                should.exist(result);
                result.message.should.startWith('You have subscribed');
                result.action.should.equal('START');
                assertSubscriptionInDB('TEST', test_number, true, done);
            });
       });

        it('unsubscribe request', function(done) {
            Processor.processMessage('START TEST', test_number, function () {
                Processor.processMessage('STOP TEST', test_number, function (result) {
                    should.exist(result);
                    result.message.should.startWith('You have unsubscribed');
                    result.action.should.equal('STOP');
                    assertSubscriptionInDB('TEST', test_number, false, done);  //although we might merely deactivate in the future.
                });
            });
        });

        it('respond with an error if group does not exist', function(done) {
            Processor.processMessage('START TEST123', test_number, function (result){
                should.exist(result);
                result.message.should.startWith('Sorry');
                result.action.should.equal('error');
                done();
            });
        });

        it('respond with an error if we try subscribing twice.', function(done) {
            Processor.processMessage('START TEST', test_number, function () {
                Processor.processMessage('START TEST', test_number, function (result) {
                    should.exist(result);
                    result.message.should.startWith('You are already subscribed');
                    result.action.should.equal('START');
                    done();
                });
            });
        });

        it('invalid command returns help', function(done) {
            Processor.processMessage('asdf', test_number, function (result){
                should.exist(result);
                result.action.should.equal('help');
                done();
            });
        });

        it('process a NAME request', function(done) {
            (false).should.equal(true, 'unimplemented');
            assertSubscriptionNamed('TEST', '000-000-0000', false, done);
        });

    });


    afterEach(function(done) {
        Subscription.remove().exec();
        Syndicate.remove().exec();
        User.remove().exec();
        done();
    });
});