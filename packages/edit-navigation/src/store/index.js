/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import * as selectors from './selectors';
import * as actions from './actions';

/**
 * Module Constants
 */
const MODULE_KEY = 'core/edit-navigation';

/**
 * Block editor data store configuration.
 *
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/data/README.md#registerStore
 *
 * @type {Object}
 */
export const storeConfig = {
	reducer,
	selectors,
	actions,
};

const store = registerStore( MODULE_KEY, {
	...storeConfig,
	persist: [ 'preferences' ],
} );

export default store;
