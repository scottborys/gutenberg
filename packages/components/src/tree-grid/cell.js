/**
 * WordPress dependencies
 */
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import RovingTabIndexItem from './roving-tab-index-item';

export default forwardRef( function TreeGridCell(
	{ children, ...props },
	ref
) {
	return (
		<td { ...props } role="gridcell">
			<RovingTabIndexItem ref={ ref }>{ children }</RovingTabIndexItem>
		</td>
	);
} );
