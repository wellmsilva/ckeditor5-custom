import View from '@ckeditor/ckeditor5-ui/src/view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import TableItemListView from './tableitemlistview';

import '../../theme/customtablelistview.css';

export default class TableListView extends View {
	constructor(locale, options) {
		super(locale);

		// The view collection containing items of the list.
		this.items = this.createCollection();
		this.set('value', '') ;
		// The instance of the focus tracker that tracks focus in #items.
		this.focusTracker = new FocusTracker();

		// The keystroke handler that will help the focus cycler respond to the keystrokes.
		this.keystrokes = new KeystrokeHandler();

		// The focus cycler that glues it all together.
		this.focusCycler = new FocusCycler({
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate list items backward using the arrow up key.
				focusPrevious: 'arrowup',

				// Navigate toolbar items forward using the arrow down key.
				focusNext: 'arrowdown'
			}
		});

		for (const option of options) {
			const itemOption = new TableItemListView(locale, option);
			itemOption.on( 'change', () => {
				console.log( 'The view has been clicked!' );
			} );
			this.items.add(itemOption);
		}


		this.setTemplate({
			tag: 'select',
			attributes: {
				class: 'table-select',
				style: 'width: 100%;border: 1px solid #ccc;padding: 5px;border-radius: 2px;'
			},
			children: this.items
		});
	}

	render() {
		super.render();

		// ...

		// Items added before rendering should be known to the #focusTracker.
		for (const item of this.items) {
			this.focusTracker.add(item.element);
		}

		// Make sure items added to the collection are recognized by the #focusTracker.
		this.items.on('add', (evt, item) => {
			this.focusTracker.add(item.element);
		});

		// Make sure items removed from the collection are ignored by the #focusTracker.
		this.items.on('remove', (evt, item) => {
			this.focusTracker.remove(item.element);
		});

		this.on('onchange', (evt, item) => {
			console.log('change1',evt, item );
		});


		// Start listening for the keystrokes coming from #element, which will allow
		// the #focusCycler to handle the keyboard navigation.
		this.keystrokes.listenTo(this.element);

		this.listenTo(
			this,
			'change',
			(evt, domEvt) => {
				console.log("change2");
				domEvt.stopPropagation();
			},
			{ priority: 'high' }
		);
	}

	// ...
}
