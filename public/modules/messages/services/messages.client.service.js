'use strict';

angular.module('messages').factory('Messages', ['$resource',
    function($resource) {
        return $resource('messages', {
        }, {
            send : {
                method: 'PUT'
            }
        });
    }
]);