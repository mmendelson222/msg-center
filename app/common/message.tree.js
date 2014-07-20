/**
 * Created by Michael on 6/25/2014.
 */
'use strict';

var treeIntegrityErrors;
var allNodes;
var nextIds;

//recurse the tree to find a node by id.
function treeNodeIntegrity(node){
    if (allNodes.join().indexOf(node.id)>-1)
        treeIntegrityErrors.push('Node id '+node.id+ ' is used more than once');

    //rules for ALL nodes.

    //if no id, then this node is simply for message display - we can't reside here or go further.
    //there should be no child nodes.
    if (!node.hasOwnProperty('id')){
        if (node.nodes) {
            treeIntegrityErrors.push('Found a node node missing id, but with child nodes');
        }
    }

    //if a node doesn't have text, it must route to a next (a valid id)
    if (!node.hasOwnProperty('text')){
        if (!node.next) {
            treeIntegrityErrors.push('Node ' + node.id + ' is missing text');
        }
    }

    if (node.next){
        nextIds.push(node.next);  //so we can check for validity later.
        if (node.nodes) {
            treeIntegrityErrors.push('A node with a "next" property has child nodes (which will never be hit)');
        }
    }

    if (node.nodes) {
        for (var i = 0; i < node.nodes.length; i++) {
            //rules for non-top level nodes
            if (!node.nodes[i].hasOwnProperty('match')) {
                treeIntegrityErrors.push('Node '+node.nodes[i].id+' needs a match pattern');
            }
            treeNodeIntegrity(node.nodes[i]);
        }
    }
}

exports.treeIntegrity = function(tree){
    treeIntegrityErrors = [];
    allNodes = [];
    nextIds = [];
    treeNodeIntegrity(tree);
    //check nextIds for validity.
    if (treeIntegrityErrors.length === 0)
        return null;
    else
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