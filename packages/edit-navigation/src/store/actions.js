export function setMenuItemsToClientIdMapping( mapping ) {
	return {
		type: 'SET_MENU_ITEMS_TO_CLIENT_ID_MAPPING',
		mapping,
	};
}

export function assignMenuItemIdToClientId( menuItemId, clientId ) {
	return {
		type: 'ASSIGN_MENU_ITEM_ID_TO_CLIENT_ID',
		menuItemId, clientId,
	};
}
