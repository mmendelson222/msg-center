'use strict';
/**
 * Created by Michael on 6/24/2014.
 */

var mongoose = require('mongoose'),
    Syndicate = mongoose.model('Syndicate'),
    Subscription = mongoose.model('Subscription'),
    Tree = require('../common/message.tree');


exports.parseCommand = function(msg_text, number, callback){
    console.dir("checking tree for "+msg_text+ " " + number);

    Subscription.find({'number':number}, function(err, subscriptions) {
        if (subscriptions.length==0)
            return callback({
                'action': 'next',
                'data': null,
                'message': 'no subscriptions'
            });

        var qCount = 0;
        for(var i=0; i<subscriptions.length; i++) {
            console.dir(JSON.stringify(subscriptions[i]));
            qCount++;
            var treeState =  subscriptions[i].tree_state;
            Syndicate.findOne({'name': subscriptions[i].syndicate}, function (err, syndicate) {
                console.dir(JSON.stringify(syndicate));
                if (syndicate.message_tree) {
                    console.dir('investigating tree');
                    //see if there's a match for this command.
                    //find the current node, if applicable
                    var node = Tree.nodeById(JSON.parse(syndicate.message_tree), treeState);
                    console.dir(node);
                    //test match.  if match, bail out.
                    node = Tree.chooseNext(node, msg_text);
                    console.dir(node);
                    if (node) {
                        console.dir('ues');
                        return callback({
                            'action': 'tree',
                            'data': node.id,
                            'message': node.text
                        });
                    }
                }

                if (qCount == subscriptions.length) {
                    return callback({
                        'action': 'next',
                        'data': null,
                        'message': 'no tree solutions found'
                    });
                }
            });

        }
    });
};

