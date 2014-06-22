'use strict';

// Configuring the Articles module
angular.module('subscriptions').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Subscriptions', 'subscriptions', 'dropdown', 'subscriptions');
		Menus.addSubMenuItem('topbar', 'subscriptions', 'List Subscriptions', 'subscriptions');
	}
]);