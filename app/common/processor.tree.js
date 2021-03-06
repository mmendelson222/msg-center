'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var mongoose = require('mongoose'),
    Syndicate = mongoose.model('Syndicate'),
    Subscription = mongoose.model('Subscription'),
    Tree = require('../common/message.tree');

function parseTreeDirective(msg_text, number, callback){
    //console.dir('checking tree for '+msg_text+ ' ' + number);
    var numFound = 0;
    var numProcessed = 0;
    var treeSuccess = false;

    //see if there's a match for this command.
    //find all subscriptions
    Subscription.find({'number': number}).stream()
        .on('error', function (error) {
            console.dir('error');
        })
        .on('data', function (subscription) {
            numFound++;

            Syndicate.findOne({'name': subscription.syndicate}, function (err, syndicate) {
                numProcessed++;
                if (syndicate) {  //undefined if syndicate indicated has been removed.
                    if (syndicate.message_tree) {
                        var node;
                        var rtnMessage;

                        //second-level commands - tree related.
                        if (msg_text === 'BACK') {
                            node = Tree.findParentNode(syndicate.message_tree, subscription.tree_state);
                            rtnMessage = node.text;
                        } else if (msg_text === 'RESET') {
                            //reset to the root node.
                            node  = syndicate.message_tree;
                            rtnMessage = 'Reset was successful.  '+node.text;
                        } else {
                            //find the user's current node (or the tree root)
                            node = Tree.nodeById(syndicate.message_tree, subscription.tree_state);
                            //find node based on text
                            var matchedNode = Tree.chooseNext(node, msg_text);

                            if (matchedNode) {
                                rtnMessage = matchedNode.text;
                                //if below is false, we stay on the parent node (bounceback)
                                //NOTE: without an ID, we can't stay here!
                                if (matchedNode.id || matchedNode.next) {
                                    node = matchedNode;
                                }
                                //show message and stay (!node.id); is handled below.
                            } else {
                                //no match - issue a generic message
                                node = null;
                            }
                        }

                        if (node) {
                            treeSuccess = true;
                            //handle cases here:

                            //use message from current node but navigate to new node (action=usenodes)
                            while (node.next)  {
                                var nextNode = Tree.nodeById(syndicate.message_tree, node.next);
                                if (node.action  !== 'usenodes'){
                                    rtnMessage += ' ' + nextNode.text;
                                }
                                node = nextNode;
                            }

                            //if we're returning a node that has no children, reset to the top!
                            //this avoids us having to send another message for an error, or for reset.
                            if (!node.nodes){
                                //reset to the root node.
                                node  = syndicate.message_tree;
                                rtnMessage = rtnMessage + ' -> '+node.text;
                            }

                            //request matched this node.
                            var conditions = {number: number, syndicate: syndicate.name};
                            var update = { $set: { tree_state: node.id}};
                            Subscription.update(conditions, update, function (err, count) {
                                return callback({
                                    'action': 'tree',
                                    'data': node.id,
                                    'message': rtnMessage
                                });
                            });
                        }
                    }
                }

                if (numFound === numProcessed && !treeSuccess) {
                    //if all found items have been processed, but no match yet.
                    return callback({
                        'action': 'next',
                        'data': null,
                        'message': 'no valid tree action'
                    });
                }
            });
        })
        .on('close', function () {
            if (numFound === 0) {
                return callback({
                    'action': 'next',
                    'data': null,
                    'message': 'no subscriptions'
                });
            }
        });

}

exports.parseCommand = function(msg_text, number, callback){
    //check for reserved command(s) related to tree.
    var msg = msg_text.trim().toUpperCase();
    parseTreeDirective(msg, number, callback);
};




