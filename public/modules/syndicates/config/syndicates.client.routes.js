'use strict';

//Setting up route
angular.module('syndicates').config(['$stateProvider',
	function($stateProvider) {
		// Syndicates state routing
		$stateProvider.
		state('listSyndicates', {
			url: '/syndicates',
			templateUrl: 'modules/syndicates/views/list-syndicates.client.view.html'
		}).
		state('createSyndicate', {
			url: '/syndicates/create',
			templateUrl: 'modules/syndicates/views/create-syndicate.client.view.html'
		}).
		state('viewSyndicate', {
			url: '/syndicates/:syndicateId',
			templateUrl: 'modules/syndicates/views/view-syndicate.client.view.html'
		}).
		state('editSyndicate', {
			url: '/syndicates/:syndicateId/edit',
			templateUrl: 'modules/syndicates/views/edit-syndicate.client.view.html'
		});
	}
]);