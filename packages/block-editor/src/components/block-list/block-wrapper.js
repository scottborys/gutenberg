/**
 * External dependencies
 */
import classnames from 'classnames';
import { first, last, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { useRef, useEffect, useContext, forwardRef } from '@wordpress/element';
import { focus, isTextField, placeCaretAtHorizontalEdge } from '@wordpress/dom';
import { BACKSPACE, DELETE, ENTER } from '@wordpress/keycodes';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { isInsideRootBlock } from '../../utils/dom';
import useMovingAnimation from '../use-moving-animation';
import { Context, SetBlockNodes } from './root-container';
import { BlockListBlockContext } from './block';
import ELEMENTS from './block-wrapper-elements';

/**
 * This hook is used to lighly mark an element as a block element. Call this
 * hook and pass the returned props to the element to mark as a block. If you
 * define a ref for the element, it is important to pass the ref to this hook,
 * which the hooks in turn will pass to the component through the props it
 * returns. Optionally, you can also pass any other props through this hook, and
 * they will be merged and returned.
 *
 * @param {Object} props   Optional. Props to pass to the element. Must contain
 *                         the ref if one is defined.
 * @param {Object} options Options for internal use only.
 *
 * @return {Object} Props to pass to the element to mark as a block.
 */
export function useBlockProps( props = {}, { __unstableIsHtml } = {} ) {
	const fallbackRef = useRef();
	const ref = props.ref || fallbackRef;
	const onSelectionStart = useContext( Context );
	const setBlockNodes = useContext( SetBlockNodes );
	const {
		clientId,
		rootClientId,
		isSelected,
		isFirstMultiSelected,
		isLastMultiSelected,
		isMultiSelecting,
		isNavigationMode,
		isPartOfMultiSelection,
		enableAnimation,
		index,
		className,
		isLocked,
		name,
		mode,
		blockTitle,
		wrapperProps = {},
	} = useContext( BlockListBlockContext );
	const { initialPosition } = useSelect(
		( select ) => {
			if ( ! isSelected ) {
				return {};
			}

			return {
				initialPosition: select(
					'core/block-editor'
				).getSelectedBlocksInitialCaretPosition(),
			};
		},
		[ isSelected ]
	);
	const { removeBlock, insertDefaultBlock } = useDispatch(
		'core/block-editor'
	);

	// Provide the selected node, or the first and last nodes of a multi-
	// selection, so it can be used to position the contextual block toolbar.
	// We only provide what is necessary, and remove the nodes again when they
	// are no longer selected.
	useEffect( () => {
		if ( isSelected || isFirstMultiSelected || isLastMultiSelected ) {
			const node = ref.current;
			setBlockNodes( ( nodes ) => ( {
				...nodes,
				[ clientId ]: node,
			} ) );
			return () => {
				setBlockNodes( ( nodes ) => omit( nodes, clientId ) );
			};
		}
	}, [ isSelected, isFirstMultiSelected, isLastMultiSelected ] );

	// translators: %s: Type of block (i.e. Text, Image etc)
	const blockLabel = sprintf( __( 'Block: %s' ), blockTitle );

	// Handing the focus of the block on creation and update

	/**
	 * When a block becomes selected, transition focus to an inner tabbable.
	 */
	const focusTabbable = () => {
		// Focus is captured by the wrapper node, so while focus transition
		// should only consider tabbables within editable display, since it
		// may be the wrapper itself or a side control which triggered the
		// focus event, don't unnecessary transition to an inner tabbable.
		if (
			document.activeElement &&
			isInsideRootBlock( ref.current, document.activeElement )
		) {
			return;
		}

		// Find all tabbables within node.
		const textInputs = focus.tabbable
			.find( ref.current )
			.filter( isTextField )
			// Exclude inner blocks and block appenders
			.filter(
				( node ) =>
					isInsideRootBlock( ref.current, node ) &&
					! node.closest( '.block-list-appender' )
			);

		// If reversed (e.g. merge via backspace), use the last in the set of
		// tabbables.
		const isReverse = -1 === initialPosition;
		const target =
			( isReverse ? last : first )( textInputs ) || ref.current;

		placeCaretAtHorizontalEdge( target, isReverse );
	};

	useEffect( () => {
		if ( ! isMultiSelecting && ! isNavigationMode && isSelected ) {
			focusTabbable();
		}
	}, [ isSelected, isMultiSelecting, isNavigationMode ] );

	// Block Reordering animation
	useMovingAnimation(
		ref,
		isSelected || isPartOfMultiSelection,
		isSelected || isFirstMultiSelected,
		enableAnimation,
		index
	);

	useEffect( () => {
		/**
		 * Interprets keydown event intent to remove or insert after block if key
		 * event occurs on wrapper node. This can occur when the block has no text
		 * fields of its own, particularly after initial insertion, to allow for
		 * easy deletion and continuous writing flow to add additional content.
		 *
		 * @param {KeyboardEvent} event Keydown event.
		 */
		function onKeyDown( event ) {
			const { keyCode, target } = event;

			if (
				keyCode !== ENTER &&
				keyCode !== BACKSPACE &&
				keyCode !== DELETE
			) {
				return;
			}

			if ( target !== ref.current || isTextField( target ) ) {
				return;
			}

			event.preventDefault();

			if ( keyCode === ENTER ) {
				insertDefaultBlock( {}, rootClientId, index + 1 );
			} else {
				removeBlock( clientId );
			}
		}

		function onMouseLeave( { which, buttons } ) {
			// The primary button must be pressed to initiate selection. Fall back
			// to `which` if the standard `buttons` property is falsy. There are
			// cases where Firefox might always set `buttons` to `0`.
			// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
			// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/which
			if ( ( buttons || which ) === 1 ) {
				onSelectionStart( clientId );
			}
		}

		if ( isSelected ) {
			// Only allow shortcuts when a blocks is selected and not locked.
			if ( ! isLocked ) {
				ref.current.addEventListener( 'keydown', onKeyDown );
			}

			// Only allow selection to be started from a selected block.
			ref.current.addEventListener( 'mouseleave', onMouseLeave );
		}

		return () => {
			if ( isSelected ) {
				if ( ! isLocked ) {
					ref.current.removeEventListener( 'keydown', onKeyDown );
				}

				ref.current.removeEventListener( 'mouseleave', onMouseLeave );
			}
		};
	}, [
		isSelected,
		isLocked,
		insertDefaultBlock,
		removeBlock,
		onSelectionStart,
	] );

	const htmlSuffix = mode === 'html' && ! __unstableIsHtml ? '-visual' : '';

	return {
		...wrapperProps,
		...props,
		ref,
		id: `block-${ clientId }${ htmlSuffix }`,
		tabIndex: 0,
		role: 'group',
		'aria-label': blockLabel,
		'data-block': clientId,
		'data-type': name,
		'data-title': blockTitle,
		className: classnames(
			'wp-block',
			className,
			props.className,
			wrapperProps.className
		),
		style: { ...wrapperProps.style, ...props.style },
	};
}

const BlockComponent = forwardRef(
	(
		{ children, tagName: TagName = 'div', __unstableIsHtml, ...props },
		wrapper
	) => {
		const wrapperProps = useBlockProps(
			{ ref: wrapper },
			{ __unstableIsHtml }
		);
		const isAligned = wrapperProps && !! wrapperProps[ 'data-align' ];
		const blockWrapper = (
			<TagName
				// Overrideable props.
				aria-label={ wrapperProps[ 'aria-label' ] }
				role={ wrapperProps.role }
				{ ...props }
				{ ...omit( wrapperProps, [ 'data-align' ] ) }
				className={ classnames(
					props.className,
					wrapperProps.className,
					{ 'wp-block': ! isAligned }
				) }
				style={ {
					...( wrapperProps.style || {} ),
					...( props.style || {} ),
				} }
			>
				{ children }
			</TagName>
		);

		// For aligned blocks, provide a wrapper element so the block can be
		// positioned relative to the block column.
		if ( isAligned ) {
			const alignmentWrapperProps = {
				'data-align': wrapperProps[ 'data-align' ],
			};
			return (
				<div className="wp-block" { ...alignmentWrapperProps }>
					{ blockWrapper }
				</div>
			);
		}

		return blockWrapper;
	}
);

const ExtendedBlockComponent = ELEMENTS.reduce( ( acc, element ) => {
	acc[ element ] = forwardRef( ( props, ref ) => {
		return <BlockComponent { ...props } ref={ ref } tagName={ element } />;
	} );
	return acc;
}, BlockComponent );

export const Block = ExtendedBlockComponent;
