'use strict';

// Configuring the Articles module
angular.module('messages').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Messages', 'messages', 'dropdown', '/messages(/send)?');
		Menus.addSubMenuItem('topbar', 'messages', 'List Messages', 'messages/list');
		Menus.addSubMenuItem('topbar', 'messages', 'Send Message', 'messages/send');
	}
]);