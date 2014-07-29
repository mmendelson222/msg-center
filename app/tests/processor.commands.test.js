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
var test_name = 'John Doe X';

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

function assertSubscriptionNamed(number, expectedName, done){
    Subscription.find({'number':number}, function(err, results){
        (err === null).should.equal(true);
        results.length.should.equal(1);
        (expectedName).should.equal(results[0].fullName);
        ('John').should.equal(results[0].firstName);  //hard-coded shortcut
        done();
    });
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

    describe('START (subscribe) requests', function() {
        it('process a subscribe request', function (done) {
            Processor.processMessage('START TEST', test_number, function (result) {
                should.exist(result);
                result.message.should.startWith('You have subscribed');
                result.action.should.equal('START');
                assertSubscriptionInDB('TEST', test_number, true, function () {
                    done();
                });
            });
        });

        it('respond with an error if group does not exist (START)', function (done) {
            Processor.processMessage('START TEST123', test_number, function (result) {
                should.exist(result);
                result.message.should.startWith('Sorry');
                result.action.should.equal('error');
                done();
            });
        });

        it('respond with an error if we try subscribing twice.', function (done) {
            Processor.processMessage('START TEST', test_number, function () {
                Processor.processMessage('START TEST', test_number, function (result) {
                    should.exist(result);
                    result.message.should.startWith('You are already subscribed');
                    result.action.should.equal('error');
                    done();
                });
            });
        });

        it('respond with an error if we subscribe to two tree .', function (done) {
            Processor.processMessage('START TEST', test_number, function () {
                Processor.processMessage('START TEST', test_number, function (result) {
                    should.exist(result);
                    result.message.should.startWith('You are already subscribed');
                    result.action.should.equal('error');
                    done();
                });
            });
        });
    });

    describe('STOP (unsubscribe) requests', function() {
        it('process an unsubscribe request', function (done) {
            Processor.processMessage('START TEST', test_number, function () {
                Processor.processMessage('STOP TEST', test_number, function (result) {
                    should.exist(result);
                    result.message.should.startWith('You have unsubscribed');
                    result.action.should.equal('STOP');
                    assertSubscriptionInDB('TEST', test_number, false, function () {
                        done();
                    });  //although we might merely deactivate in the future.
                });
            });
        });

        it('respond with an error if group does not exist (STOP)', function (done) {
            Processor.processMessage('STOP TEST123', test_number, function (result) {
                should.exist(result);
                result.message.should.startWith('You are not a member');
                result.action.should.equal('error');
                done();
            });
        });

        it('respond with an error if we\'re not actually subscribed', function (done) {
            Processor.processMessage('STOP TEST', test_number, function (result) {
                should.exist(result);
                result.message.should.startWith('You are not a member');
                result.action.should.equal('error');
                done();
            });
        });
    });

    describe('NAME requests', function() {
        it('process a NAME request', function(done) {
            Processor.processMessage('START TEST', test_number, function () {
                Processor.processMessage('NAME '+test_name, test_number, function (result) {
                    assertSubscriptionNamed(test_number, test_name, function () {
                        done();
                    });
                });
            });
        });

        it('respond with an error if no subscriptions were found', function(done) {
            Processor.processMessage('NAME '+test_name, test_number, function (result) {
                should.exist(result);
                result.action.should.equal('error');
                result.message.should.startWith('No subscriptions found');
                done();
            });
        });

        it('respond with an error if no name given', function(done) {
            Processor.processMessage('START TEST', test_number, function () {
                Processor.processMessage('NAME ', test_number, function (result) {
                    result.action.should.equal('error');
                    result.message.should.startWith('No name');
                    done();
                });
            });
        });

    });

    describe('Other requests', function() {
        it('invalid command returns help', function (done) {
            Processor.processMessage('asdf', test_number, function (result) {
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