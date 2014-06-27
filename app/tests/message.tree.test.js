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

function showErrors(errors){
    for (var i; i<errors.length; i++) console.error(errors[i]);
}

/**
 * Unit tests
 */
describe('Tree structure tests', function() {
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
            errors.length.should.equal(0);
            done();
        });

        it('is invalid because node has no match', function (done) {
            var tree = {
                id: 'root',
                text: 'Welcome.  Yes or no?',
                nodes: [
                    {id: 'node', text: 'this is the node'}
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
        var node = Tree.nodeById(data, 'yes');
        node.text.should.equal('You chose yes');

        node = Tree.nodeById(data, 'no');
        node.text.should.equal('You chose no');

        node = Tree.nodeById(data, 'lastchance');
        node.text.should.equal('Good job!');
        done();
    });

    it('chooses the next node based on user input', function(done) {
        var node = data; //this is the root node
        node = Tree.chooseNext(node, 'no');
        if (!node)
            throw 'Choice does not match.';
        ('You chose no').should.equal(node.text);

        var maybeNode = Tree.nodeById(data, 'maybe');
        var okNode = Tree.chooseNext(maybeNode, 'ok');
        ('Good job!').should.equal(okNode.text);

        var failNode = Tree.chooseNext(maybeNode, 'oh no');
        ('Too bad').should.equal(failNode.text);

        done();
    });

    afterEach(function(done) {
        done();
    });
});

