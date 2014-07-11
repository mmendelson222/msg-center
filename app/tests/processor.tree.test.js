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
var test_syndicate = 'TREE';

var data =
{
    id: 'root',
    text: 'Welcome.  Yes or no?',
    nodes: [
        {
            id : 'yes',
            text: 'You chose yes',
            match: 'yes'
        },
        {
            id: 'no',
            text: 'You chose no',
            match: 'no'
        },
        {
            id: 'maybe',
            text: 'This is your last chance - ok or you\'re done',
            match: 'maybe',
            nodes: [
                {
                    id: 'lastchance',
                    text: 'Good job!',
                    match: 'ok'
                },
                {
                    id: 'blewit',
                    text: 'Too bad',
                    match: '.*'
                }
            ]
        }
    ]
};

function assertHasTreeState(syndicate, number, expectedValue, getTreeState){
    Subscription.findOne({'syndicate':syndicate, 'number':number}, function(err, subscription){
        if (err)
            console.dir(JSON.stringify(err));
        (err === null).should.equal(true);
        (subscription.tree_state).should.equal(expectedValue, 'saved tree state should be '+expectedValue + ', ' +JSON.stringify(subscription));
        return getTreeState(subscription.tree_state);
    });
}

/**
 * Unit tests
 */
describe('Message Tree Processor Unit Tests:', function() {
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
                name: test_syndicate,
                user: user,
                message_tree: JSON.stringify(data)
            });
            syndicate.save(function(err) {

                syndicate = new Syndicate({
                    name: 'NOT_TREE',
                    user: user
                });
                syndicate.save(function(err) {
                    done();
                });

            });
        });

    });

    it('process a tree request', function (done) {
        Processor.processMessage('START TREE', test_number, function (result) {
            result.action.should.equal('START');
            Processor.processMessage('YES', test_number, function (result) {
                result.action.should.equal('tree');
                assertHasTreeState(test_syndicate, test_number, 'yes', function (state) {
                    done();
                });
            });
        });
    });

    it('process a tree request (when subscribed to a non-tree syndicate too)', function (done) {
        Processor.processMessage('START NOT_TREE', test_number, function (result) {
            result.action.should.equal('START');
            Processor.processMessage('START TREE', test_number, function (result) {
                result.action.should.equal('START');
                Processor.processMessage('YES', test_number, function (result) {
                    result.action.should.equal('tree');
                    assertHasTreeState(test_syndicate, test_number, 'yes', function (state) {
                        done();
                    });
                });
            });
        });
    });

    it('process a tree request (when no tree subscribed to)', function (done) {
        Processor.processMessage('START NOT_TREE', test_number, function (result) {
            result.action.should.equal('START');
            Processor.processMessage('YES', test_number, function (result) {
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