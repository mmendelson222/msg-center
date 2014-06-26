/**
 * Created by Michael on 6/25/2014.
 */
'use strict';

var treeData;

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