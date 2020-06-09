/**
 * Returns a block's name given its client ID, or null if no block exists with
 * the client ID.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {string} Block name.
 */
export function getMenuItemId( state, clientId ) {
	return state.menuItemIdByClientId[ clientId ];
}
/**
 * Returns a block's name given its client ID, or null if no block exists with
 * the client ID.
 *
 * @param {Object} state    Editor state.
 * @param {string} clientId Block client ID.
 *
 * @return {string} Block name.
 */
export function getMenuItemIdsByClientId( state ) {
	return state.mappings.menuItemIdByClientId;
}

export function getClientIdsByMenuId( state ) {
	return state.mappings.clientIdByMenuItemId;
}
