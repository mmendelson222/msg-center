'use strict';

angular.module('messages').controller('MessagesController', ['$scope', 'Messages', '$location',
	function($scope, Messages, $location) {
        $scope.create = function() {
            var message = new Messages({
                text: this.text
            });
            message.$send(message, function(response) {
                $location.path('messages');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            this.text = '';
        };
	}
]);