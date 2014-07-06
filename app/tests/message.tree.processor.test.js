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
            match: /yes/i
        },
        {
            id: 'no',
            text: 'You chose no',
            match: /no/i
        },
        {
            id: 'maybe',
            text: 'This is your last chance - ok or you\'re done',
            match: /maybe/i,
            nodes: [
                {
                    id: 'lastchance',
                    text: 'Good job!',
                    match: /ok/i
                },
                {
                    id: 'blewit',
                    text: 'Too bad',
                    match: /.*/i
                }
            ]
        }
    ]
};


function assertHasTreeState(syndicate, number, shouldExist, getTreeState){
    Subscription.find({'syndicate':syndicate, 'number':number}, function(err, results){
       (err === null).should.equal(true);
       (results.tree_state === null).should.equal(shouldExist);
        return getTreeState(results.tree_state);
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
                message_tree: data
            });
            syndicate.save(function(err) {
                done();
            });
        });
    });

    it('process a tree request', function (done) {
        Processor.processMessage('START TREE', test_number, function (result) {
            result.action.should.equal('START');
            Processor.processMessage('YES', test_number, function (result) {
                assertHasTreeState(test_syndicate, test_number, true, function (state) {
                    console.dir(state);
                    done();
                });
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