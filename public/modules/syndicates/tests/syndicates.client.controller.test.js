'use strict';

(function() {
	// Syndicates Controller Spec
	describe('Syndicates Controller Tests', function() {
		// Initialize global variables
		var SyndicatesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Syndicates controller.
			SyndicatesController = $controller('SyndicatesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Syndicate object fetched from XHR', inject(function(Syndicates) {
			// Create sample Syndicate using the Syndicates service
			var sampleSyndicate = new Syndicates({
				name: 'New Syndicate'
			});

			// Create a sample Syndicates array that includes the new Syndicate
			var sampleSyndicates = [sampleSyndicate];

			// Set GET response
			$httpBackend.expectGET('syndicates').respond(sampleSyndicates);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.syndicates).toEqualData(sampleSyndicates);
		}));

		it('$scope.findOne() should create an array with one Syndicate object fetched from XHR using a syndicateId URL parameter', inject(function(Syndicates) {
			// Define a sample Syndicate object
			var sampleSyndicate = new Syndicates({
				name: 'New Syndicate'
			});

			// Set the URL parameter
			$stateParams.syndicateId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/syndicates\/([0-9a-fA-F]{24})$/).respond(sampleSyndicate);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.syndicate).toEqualData(sampleSyndicate);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Syndicates) {
			// Create a sample Syndicate object
			var sampleSyndicatePostData = new Syndicates({
				name: 'New Syndicate'
			});

			// Create a sample Syndicate response
			var sampleSyndicateResponse = new Syndicates({
				_id: '525cf20451979dea2c000001',
				name: 'New Syndicate'
			});

			// Fixture mock form input values
			scope.name = 'New Syndicate';

			// Set POST response
			$httpBackend.expectPOST('syndicates', sampleSyndicatePostData).respond(sampleSyndicateResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Syndicate was created
			expect($location.path()).toBe('/syndicates/' + sampleSyndicateResponse._id);
		}));

		it('$scope.update() should update a valid Syndicate', inject(function(Syndicates) {
			// Define a sample Syndicate put data
			var sampleSyndicatePutData = new Syndicates({
				_id: '525cf20451979dea2c000001',
				name: 'New Syndicate'
			});

			// Mock Syndicate in scope
			scope.syndicate = sampleSyndicatePutData;

			// Set PUT response
			$httpBackend.expectPUT(/syndicates\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/syndicates/' + sampleSyndicatePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid syndicateId and remove the Syndicate from the scope', inject(function(Syndicates) {
			// Create new Syndicate object
			var sampleSyndicate = new Syndicates({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Syndicates array and include the Syndicate
			scope.syndicates = [sampleSyndicate];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/syndicates\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSyndicate);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.syndicates.length).toBe(0);
		}));
	});
}());