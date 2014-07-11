'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var mongoose = require('mongoose'),
    Syndicate = mongoose.model('Syndicate'),
    Subscription = mongoose.model('Subscription'),
    Tree = require('../common/message.tree');

exports.parseCommand = function(msg_text, number, callback){
    //console.dir('checking tree for '+msg_text+ ' ' + number);
    var numFound = 0;
    var numProcessed = 0;
    var treeSuccess = false;

    //see if there's a match for this command.
    //find all subscriptions
    Subscription.find({'number':number}).stream ()
        .on ('error', function (error){
        console.dir('error');
    })
        .on ('data', function (subscription){
        numFound++;
        //console.dir('found '+JSON.stringify(subscription));

        Syndicate.findOne({'name': subscription.syndicate}, function(err, syndicate){
            //console.dir('found '+syndicate.name);
            numProcessed++;

            if (syndicate.message_tree) {
                //find the user's current node (or the tree root)
                var node = Tree.nodeById(JSON.parse(syndicate.message_tree), subscription.tree_state);
                console.dir('found node: '+node.id);
                //use the command to determine the action.
                node = Tree.chooseNext(node, msg_text);  //test match.
                if (node) {
                    treeSuccess = true;
                    //request matched this node.
                    var conditions = {number:number, syndicate:syndicate.name};
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

            if (numFound === numProcessed && !treeSuccess){
                //if all found items have been processed, but no match yet.
                return callback({
                    'action': 'next',
                    'data': null,
                    'message': 'no valid tree action'
                });
            }
        });
    })
        .on ('close', function (){
        if (numFound===0) {
            return callback({
                'action': 'next',
                'data': null,
                'message': 'no subscriptions'
            });
        }
    });
};




