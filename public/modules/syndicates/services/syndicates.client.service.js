'use strict';

//Syndicates service used to communicate Syndicates REST endpoints
angular.module('syndicates').factory('Syndicates', ['$resource',
	function($resource) {
		return $resource('syndicates/:syndicateId', { syndicateId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);