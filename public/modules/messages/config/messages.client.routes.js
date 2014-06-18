'use strict';

//Setting up route
angular.module('messages').config(['$stateProvider',
    function($stateProvider) {
        // Messages state routing
        $stateProvider
            .state('messages/list', {
                url: '/messages/list',
                templateUrl: 'modules/messages/views/list-messages.client.view.html'
            })
            .state('messages/send', {
                url: '/messages/send',
                templateUrl: 'modules/messages/views/send-messages.client.view.html'
            });
    }
]);