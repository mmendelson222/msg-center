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

var data = require('./data/tree.sample.json');
var biergarten = require('./data/bier.json');

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
describe('Message Tree Processor Unit Tests (processor.tree.test.js):', function() {

    describe('Data: tree.sample', function() {

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

        describe('Tree request - match expected', function() {
            it('process a tree request', function (done) {
                Processor.processMessage('START TREE', test_number, function (result) {
                    result.action.should.equal('START');

                    //TODO: assert that the return message is the one from the Syndicate, not the tree.
                    //result.message.should.startwith("You have subscribed");
                    Processor.processMessage('YES', test_number, function (result) {
                        result.action.should.equal('tree');
                        assertHasTreeState(test_syndicate, test_number, 'yesState', function (state) {
                            done();
                        });
                    });
                });
            });

            it('process two tree requests', function (done) {
                Processor.processMessage('START TREE', test_number, function (result) {
                    result.action.should.equal('START');
                    Processor.processMessage('MAYBE', test_number, function (result) {
                        result.action.should.equal('tree');
                        assertHasTreeState(test_syndicate, test_number, 'maybeState', function (state) {
                            Processor.processMessage('OK', test_number, function (result) {
                                assertHasTreeState(test_syndicate, test_number, 'okState', function (state) {
                                    done();
                                });
                            });
                        });
                    });
                });
            });

            it('user subscribed to a tree and a non-tree', function (done) {
                Processor.processMessage('START NOT_TREE', test_number, function (result) {
                    result.action.should.equal('START');
                    Processor.processMessage('START TREE', test_number, function (result) {
                        result.action.should.equal('START');
                        Processor.processMessage('YES', test_number, function (result) {
                            result.action.should.equal('tree');
                            assertHasTreeState(test_syndicate, test_number, 'yesState', function (state) {
                                done();
                            });
                        });
                    });
                });
            });

            it('process a tree request, then a RESET request', function (done) {
                Processor.processMessage('START TREE', test_number, function (result) {
                    result.action.should.equal('START');
                    Processor.processMessage('MAYBE', test_number, function (result) {
                        result.action.should.equal('tree');
                        assertHasTreeState(test_syndicate, test_number, 'maybeState', function (state) {
                            Processor.processMessage('RESET', test_number, function (result) {
                                result.message.should.startWith('Reset was successful.');
                                result.action.should.equal('tree');
                                assertHasTreeState(test_syndicate, test_number, biergarten.id, function (state) {
                                    done();
                                });
                            });
                        });
                    });
                });
            });

            it('process two tree requests, then a BACK request', function (done) {
                Processor.processMessage('START TREE', test_number, function (result) {
                    result.action.should.equal('START');
                    Processor.processMessage('MAYBE', test_number, function (result) {
                        assertHasTreeState(test_syndicate, test_number, 'maybeState', function (state) {
                            Processor.processMessage('OK', test_number, function (result) {
                                assertHasTreeState(test_syndicate, test_number, 'okState', function (state) {
                                    Processor.processMessage('BACK', test_number, function (result) {
                                        assertHasTreeState(test_syndicate, test_number, 'maybeState', function (state) {
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

            it('resets to the root, if next node encountered has no children', function (done) {
                Processor.processMessage('START TREE', test_number, function (result) {
                    result.action.should.equal('START');
                    Processor.processMessage('MAYBE', test_number, function (result) {
                        assertHasTreeState(test_syndicate, test_number, 'maybeState', function (state) {
                            Processor.processMessage('NO', test_number, function (result) {
                                assertHasTreeState(test_syndicate, test_number, 'root', function (state) {
                                      done();
                                });
                            });
                        });
                    });
                });
            });

            //TODO: found that having a subscription which points to a nonexistent syndicate broke tree parsing.  Fixed the issue but maybe should have a test.
        });

        describe('Tree request - NO match expected', function() {

            it('user subscribed to a tree but no match', function (done) {
                Processor.processMessage('START TREE', test_number, function (result) {
                    result.action.should.equal('START');
                    Processor.processMessage('ASDF', test_number, function (result) {
                        result.action.should.equal('help');
                        done();
                    });
                });
            });

            it('user not subscribed to a tree', function (done) {
                Processor.processMessage('START NOT_TREE', test_number, function (result) {
                    result.action.should.equal('START');
                    Processor.processMessage('YES', test_number, function (result) {
                        result.action.should.equal('help');
                        done();
                    });
                });
            });

            it('user not subscribed to anything', function (done) {
                Processor.processMessage('YES', test_number, function (result) {
                    result.action.should.equal('help');
                    done();
                });
            });
        });
    });

    describe('Data: biergarten', function() {
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
                    message_tree:  biergarten

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
        it('greets us with the first node on the tree', function (done) {
            Processor.processMessage('START TREE', test_number, function (result) {
                result.message.should.startWith('Welcome to the Biergarten');
                done();
            });
        });

        it('process a bounceback request (show a message but stay on the same node)', function (done) {
            Processor.processMessage('START TREE', test_number, function (result) {
                result.action.should.equal('START');
                Processor.processMessage('beer', test_number, function (result) {
                    assertHasTreeState(test_syndicate, test_number, 'Beer', function (state) {
                        Processor.processMessage('adsf', test_number, function (result) {
                            //console.dir(JSON.stringify(result));
                            result.message.should.startWith('You need to choose from the menu.');
                            assertHasTreeState(test_syndicate, test_number, 'Beer', function (state) {
                                 done();
                            });
                        });
                    });
                });
            });
        });

        it('process a forward request (move to node, show message, then go another node as defined by \'next\')', function (done) {
            Processor.processMessage('START TREE', test_number, function (result) {
                result.action.should.equal('START');
                Processor.processMessage('beer', test_number, function (result) {
                    Processor.processMessage('Pils', test_number, function (result) {
                        //console.dir(JSON.stringify(result));
                        result.message.should.startWith('This beer is good');
                        result.message.should.endWith('Or perhaps you\'re Done.');
                        assertHasTreeState(test_syndicate, test_number, 'root', function (state) {
                            Processor.processMessage('RESET', test_number, function (result) {
                                result.message.should.startWith('Reset was successful.');
                                result.action.should.equal('tree');
                                assertHasTreeState(test_syndicate, test_number, biergarten.id, function (state) {
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('show the title message at the end of Reset', function (done) {
            Processor.processMessage('START TREE', test_number, function (result) {
                result.action.should.equal('START');
                Processor.processMessage('RESET', test_number, function (result) {
                    result.message.should.startWith('Reset was successful.');
                    result.message.should.endWith(biergarten.text);
                    result.action.should.equal('tree');
                    assertHasTreeState(test_syndicate, test_number, biergarten.id, function (state) {
                        done();
                    });
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