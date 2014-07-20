/**
 * Created by Michael on 6/25/2014.
 */
'use strict';

var treeIntegrityErrors;
var allNodes;
var nextIds;
var noMatchIds;
var validActions = ['usenodes'];

//recurse the tree to find a node by id.
function treeNodeIntegrity(node){
    if (allNodes.indexOf(node.id)>-1)
        treeIntegrityErrors.push('Node id '+node.id+ ' is used more than once');

    //rules for ALL nodes.
    if (node.hasOwnProperty('id')) {
        allNodes.push(node.id);
        //if there's an id, the state can be saved.
        //this rule would enforce that there's no "end of the road."  Always somewhere to go.
        if (!(node.nodes || node.next)){
            var x=1;  //circumvent lint error.
            //treeIntegrityErrors.push('Node ' + node.id + ' needs subnodes or a \'next\' directive.');
        }
    } else {
        //if no id, then this node is simply for message display - we can't reside here or go further.
        //there should be no child nodes.
        if (node.nodes) {
            treeIntegrityErrors.push('Found a node missing id, but with child nodes');
        }
    }

    //if a node doesn't have text, it must route to a next (a valid id)
    if (!node.hasOwnProperty('text')){
        if (!node.next) {
            treeIntegrityErrors.push('Node ' + node.id + ' needs either text or a \'next\' property.');
        }
    }

    //if there's an action, make sure it's valid.
    if (node.hasOwnProperty('action')){
        if (validActions.indexOf(node.action)<0){
            treeIntegrityErrors.push('Node ' + node.id + ' has an invalid action.  Valid actions are '+validActions.join(', '));
        }
    }

    //Later check that all jumps are valid
    if (node.hasOwnProperty('next')){
        nextIds.push(node);  //so we can check for validity later.
        if (node.nodes) {
            treeIntegrityErrors.push('Node ' + node.id + ' has both a \'next\' property and child nodes (which will never be hit).');
        }
    }

    //recurse through all child nodes.
    if (node.nodes) {
        for (var i = 0; i < node.nodes.length; i++) {
            var childNode =  node.nodes[i];

            //Note: validation in here does not apply to the root node.
            //Later check that all nodes without match patterns, have a jump that points to them.
            if (!childNode.match){
                noMatchIds.push(childNode.id);  //so we can check for validity later.
            }

            treeNodeIntegrity(childNode);
        }
    }
}

exports.treeIntegrity = function(tree){
    treeIntegrityErrors = [];  allNodes = [];  nextIds = [];  noMatchIds = [];

    treeNodeIntegrity(tree);

    var jumpIds = [];
   for (var i=0; i<nextIds.length; i++){
        var node = nextIds[i];
        jumpIds.push(node.next);
        if (allNodes.indexOf(node.next)<0){
            treeIntegrityErrors.push('The \'next\' directive for node ' + node.id + ' does not point to a valid node.');
        }
    }

    for (var j=0; j<noMatchIds.length; j++){
        if (jumpIds.indexOf(noMatchIds[j])<0){
            treeIntegrityErrors.push('Node ' + noMatchIds[j] + ' will never be reached (no match and no other nodes pointing to it with \'next\' ');
        }
    }


    //check nextIds for validity.
    return treeIntegrityErrors;
};



//recurse the tree to find a node by id.
function findNodeById(node, id){
    if (node.id === id) {
        return node;
    } else {
        if (!node.nodes) return null;  //make sure this has nodes
        for (var i=0; i<node.nodes.length; i++){
            var foundNode = findNodeById(node.nodes[i], id);
            if (foundNode) return foundNode;
        }
    }
    return null; //not found.
}

//recurse the tree to find a node by id, then return the PARENT.
//to support the back command
exports.findParentNode = function (node, id, parent){
    if (node.id === id) {
        if (parent) {
            return parent;
        } else {
            //'There is no parent for this node.';
            return node;
        }
    } else {
        if (!node.nodes) return null;  //make sure this has nodes
        for (var i=0; i<node.nodes.length; i++){
            var foundNode = exports.findParentNode(node.nodes[i], id, node);
            if (foundNode) return foundNode;
        }
    }
    return null; //not found.
};

exports.nodeById = function(tree, id){
    if (!id)
        return tree;
    return findNodeById(tree, id);
};

exports.chooseNext = function(node, userInput){
    if (!node.nodes)
        throw 'You have nowhere to go from here.  Your options are RESET or BACK.';
    for (var i=0; i<node.nodes.length; i++){
        var reg = new RegExp(node.nodes[i].match, 'i');
        if (reg.test(userInput))
            return node.nodes[i];
    }
    return null;
};