'use strict';

// Syndicates controller
angular.module('syndicates').controller('SyndicatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Syndicates',
	function($scope, $stateParams, $location, Authentication, Syndicates ) {
		$scope.authentication = Authentication;

		// Create new Syndicate
		$scope.create = function() {
			// Create new Syndicate object
			var syndicate = new Syndicates ({
				name: this.name,
                calendar_id: this.calendar_id,
                message_tree: this.message_tree
			});

			// Redirect after save
			syndicate.$save(function(response) {
				$location.path('syndicates/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Syndicate
		$scope.remove = function( syndicate ) {
			if ( syndicate ) {
                syndicate.$remove();
				for (var i in $scope.syndicates ) {
					if ($scope.syndicates [i] === syndicate ) {
						$scope.syndicates.splice(i, 1);
					}
				}
			} else {
				$scope.syndicate.$remove(function() {
					$location.path('syndicates');
				});
			}
		};

		// Update existing Syndicate
		$scope.update = function() {
			var syndicate = $scope.syndicate;
			syndicate.$update(function() {
				$location.path('syndicates/' + syndicate._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Syndicates
		$scope.find = function() {
			$scope.syndicates = Syndicates.query();
		};

		// Find existing Syndicate
		$scope.findOne = function() {
			$scope.syndicate = Syndicates.get({ 
				syndicateId: $stateParams.syndicateId
			}, null,
            function(){
                var o = JSON.parse($scope.syndicate.message_tree);
                $scope.syndicate.message_tree = JSON.stringify(o, null, '\t');
            });
        };
	}
]);