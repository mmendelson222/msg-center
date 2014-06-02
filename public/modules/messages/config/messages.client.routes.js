'use strict';

//Setting up route
angular.module('messages').config(['$stateProvider',
	function($stateProvider) {
		// Messages state routing
		$stateProvider.
		state('messages', {
			url: '/messages',
			templateUrl: 'modules/messages/views/messages.client.view.html'
		});
	}
]);