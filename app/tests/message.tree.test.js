'use strict';

/**
 * Module dependencies.
 */
var should = require('should');
var Tree = require('../common/message.tree');

/**
 * Globals
 */
var tree;
var data = require('./data/tree.sample.json');

//uncomment below to examine errors.
function showErrors(errors){
    if (!errors) return;
    console.error(errors.join(', '));
}

/**
 * Unit tests
 */
describe('Message Tree structure tests', function() {
    beforeEach(function(done) {
        //Initiate the tree.
        //guess we don't need to do this.
        done();
    });

    describe('Validation method tests', function() {
        it('is valid root with node', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'node', text: 'this is the node', match: /mmm/}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            var junk = (errors === null).should.be.true;
            done();
        });

        it('is invalid because node has no match', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'myID', text: 'this is the node'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            done();
        });

        it('is invalid because node id is reused', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'root', text: 'this is the node'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            done();
        });

        it('is invalid because node missing everything', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(3);
            done();
        });
    });

    it('gets the appropriate tree node.', function(done) {
        var node = Tree.nodeById(data, 'yesState');
        node.text.should.equal('You chose yes');

        node = Tree.nodeById(data, 'noState');
        node.text.should.equal('You chose no');

        node = Tree.nodeById(data, 'okState');
        node.text.should.equal('Good job!');

        //return the root node if null or undefined.
        node = Tree.nodeById(data, null);
        node.id.should.equal('root');
        done();
    });

    it('gets the parent tree node.', function(done) {
        var node = Tree.findParentNode(data, 'okState');
        node.id.should.equal('maybeState');

        //if attempting to move back from the root, just return the root.
        node = Tree.findParentNode(data, 'root');
        node.id.should.equal('root');
        done();
    });


    it('chooses the next node based on user input', function(done) {
        var node = data; //this is the root node
        node = Tree.chooseNext(node, 'noState');
        if (!node)
            throw 'Choice does not match.';
        ('You chose no').should.equal(node.text);

        var maybeNode = Tree.nodeById(data, 'maybeState');
        var okNode = Tree.chooseNext(maybeNode, 'okState');
        ('Good job!').should.equal(okNode.text);

        var failNode = Tree.chooseNext(maybeNode, 'oh no');
        ('Too bad').should.equal(failNode.text);

        done();
    });

    afterEach(function(done) {
        done();
    });
});

