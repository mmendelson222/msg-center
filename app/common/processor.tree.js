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
            //console.dir('found '+JSON.stringify(subscription));

            Syndicate.findOne({'name': subscription.syndicate}, function (err, syndicate) {
                //console.dir('found '+syndicate.name);
                numProcessed++;
                if (syndicate) {  //undefined if sydicate indicated has been removed.
                    if (syndicate.message_tree) {
                        //find the user's current node (or the tree root)
                        var node = Tree.nodeById(syndicate.message_tree, subscription.tree_state);
                        //console.dir('found node: '+node.id);
                        //use the command to determine the action.
                        node = Tree.chooseNext(node, msg_text);  //test match.
                        if (node) {
                            treeSuccess = true;
                            //request matched this node.
                            var conditions = {number: number, syndicate: syndicate.name};
                            var update = { $set: { tree_state: node.id}};
                            Subscription.update(conditions, update, function (err, count) {
                                return callback({
                                    'action': 'tree',
                                    'data': node.id,
                                    'message': node.text
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

function handleReset(number, callback){
    //remove tree state for all subscriptions.
    var conditions = {number: number};
    var update = { $set: { tree_state: ''}};
    Subscription.update(conditions, update, function (err, count) {
        if (err){
            return callback({
                'action': 'tree',
                'data': 'reset',
                'message': 'Reset error: '+err.message
            });
        } else {
            return callback({
                'action': 'tree',
                'data': 'reset',
                'message': 'Reset was successful.'
            });
        }
    });
}

exports.parseCommand = function(msg_text, number, callback){
    //check for reserved command(s) related to tree.
    if (msg_text.trim().toUpperCase() === 'RESET'){
        handleReset(number, callback);
    } else {
        parseTreeDirective(msg_text, number, callback);
    }
};




