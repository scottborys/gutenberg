/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEntityBlockEditor } from '@wordpress/core-data';
import { useEffect, useState } from '@wordpress/element';

export const DRAFT_POST_ID = 'navigation-post';

export function useStubPost( initialBlocks ) {
	const { receiveEntityRecords } = useDispatch( 'core' );
	const [ hydrated, setHydrated ] = useState( false );

	useEffect( () => {
		if ( ! initialBlocks?.length ) {
			setHydrated( false );
		}
		receiveEntityRecords(
			'root',
			'postType',
			[
				{
					id: DRAFT_POST_ID,
					slug: DRAFT_POST_ID,
					generated_slug: DRAFT_POST_ID,
					status: 'draft',
					type: 'page',
					blocks: initialBlocks,
				},
			],
			null,
			false
		).then( () => {
			setHydrated( true );
		} );
	}, [ initialBlocks ] );

	return hydrated;
}

export default function useNavigationBlockEditor( ) {
	const [ blocks, onInput, onChange ] = useEntityBlockEditor(
		'root',
		'postType',
		{ id: DRAFT_POST_ID }
	);

	return [ blocks, onInput, onChange ];
}
