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
var biergarten = require('./data/bier.json');

//uncomment below to examine errors.
function showErrors(errors){
    if (!errors.length) return;
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
                    {id: 'node', text: 'this is the node', match: 'mmm'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(0);
            done();
        });

        it('is invalid because node missing id, but with child nodes', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {text: 'this is the node', match:'x', nodes: []}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            errors[0].should.startWith('Found a node missing id');
            done();
        });

        it('is invalid because node id is used more than once', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'root', text: 'this is the node', match: 'x'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            errors[0].should.endWith('is used more than once');
            done();
        });

        it('is invalid because node needs either text or a \'next\' property', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'hello', match: 'x'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            errors[0].should.endWith('either text or a \'next\' property.');
            done();
        });

        it('is invalid because node contains an invalid action', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'hello', next: 'root', match:'x', action: 'blah'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            errors[0].should.startWith('Node hello has an invalid action');
            done();
        });

        it('is invalid \'next\' directive does not point to a valid node', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'hello', match:'x', next: 'blah'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            errors[0].should.startWith('The \'next\' directive');
            done();
        });

        it('is invalid because it will never be reached', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'hello', next: 'root'}
                ]
            };
            var errors = Tree.treeIntegrity(tree);
            showErrors(errors);
            errors.length.should.equal(1);
            errors[0].should.startWith('Node hello will never be reached');
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

    describe('Biergarten tests tests', function() {
        it('is valid ', function (done) {
            var errors = Tree.treeIntegrity(biergarten);
            showErrors(errors);
            errors.length.should.equal(0);
            done();
        });
    });

    afterEach(function(done) {
        done();
    });
});

