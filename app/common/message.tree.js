/**
 * Created by Michael on 6/25/2014.
 */
'use strict';

var treeIntegrityErrors;

//recurse the tree to find a node by id.
function treeNodeIntegrity(node){
    //rules for ALL nodes.
    if (!node.hasOwnProperty('id')){
        treeIntegrityErrors.push('At least one node missing id');
    }
    if (!node.hasOwnProperty('text')){
        treeIntegrityErrors.push('Node '+node.id+ ' is missing text');
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
    treeNodeIntegrity(tree);
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

exports.nodeById = function(tree, id){
    return findNodeById(tree, id);
};

exports.chooseNext = function(node, userInput){
    if (!node.nodes)
        throw 'No child nodes.';
    for (var i=0; i<node.nodes.length; i++){
        if (node.nodes[i].match.test(userInput))
            return node.nodes[i];
    }
    return null;
};