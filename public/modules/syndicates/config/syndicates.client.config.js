'use strict';

// Configuring the Articles module
angular.module('syndicates').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Syndicates', 'syndicates', 'dropdown', '/syndicates(/create)?');
		Menus.addSubMenuItem('topbar', 'syndicates', 'List Syndicates', 'syndicates');
		Menus.addSubMenuItem('topbar', 'syndicates', 'New Syndicate', 'syndicates/create');
	}
]);