/**
 * WordPress dependencies
 */
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';
import { useMemo, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useMenuItems from './use-menu-items';
import useNavigationBlocks from './use-navigation-blocks';
import MenuEditorShortcuts from './shortcuts';
import BlockEditorArea from './block-editor-area';
import NavigationStructureArea from './navigation-structure-area';
import useNavigationBlockEditor, {
	useStubPost,
} from './use-navigation-block-editor';

// const DRAFT_POST_ID = 'navigation-post';

export default function MenuEditorWrapper( {
	menuId,
	blockEditorSettings,
	onDeleteMenu,
} ) {
	const query = useMemo( () => ( { menus: menuId, per_page: -1 } ), [
		menuId,
	] );
	const {
		menuItems,
		eventuallySaveMenuItems,
		createMissingMenuItems,
	} = useMenuItems( query );
	const { blocks, setBlocks, menuItemsRef } = useNavigationBlocks(
		menuItems
	);
	const saveMenuItems = () => eventuallySaveMenuItems( blocks, menuItemsRef );
	const stubPostReady = useStubPost( blocks );

	if ( ! stubPostReady ) {
		return <div>Loading...</div>;
	}

	return (
		<MenuEditor
			blockEditorSettings={ blockEditorSettings }
			onDeleteMenu={ onDeleteMenu }
			onSaveMenu={ saveMenuItems }
			menuId={ menuId }
			query={ query }
		/>
	);
}

const MenuEditor = ( {
	menuId,
	blockEditorSettings,
	initialBlocks,
	onSaveMenu,
	onDeleteMenu,
} ) => {
	const isLargeViewport = useViewportMatch( 'medium' );
	const [ blocks, onInput, onChange ] = useNavigationBlockEditor();

	return (
		<div className="edit-navigation-menu-editor">
			<BlockEditorKeyboardShortcuts.Register />
			<MenuEditorShortcuts.Register />

			<BlockEditorProvider
				value={ blocks }
				onInput={ ( updatedBlocks ) => onInput( updatedBlocks ) }
				onChange={ ( updatedBlocks ) => {
					// createMissingMenuItems( updatedBlocks, menuItemsRef );
					onChange( updatedBlocks );
				} }
				settings={ {
					...blockEditorSettings,
					templateLock: 'all',
					hasFixedToolbar: true,
				} }
			>
				<BlockEditorKeyboardShortcuts />
				<MenuEditorShortcuts saveBlocks={ onSaveMenu } />
				<NavigationStructureArea
					blocks={ blocks }
					initialOpen={ isLargeViewport }
				/>
				<BlockEditorArea
					saveBlocks={ onSaveMenu }
					menuId={ menuId }
					onDeleteMenu={ onDeleteMenu }
				/>
			</BlockEditorProvider>
		</div>
	);
};
