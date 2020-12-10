import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { getOptions } from '../utils';

import { createLabeledInputText, createLabeledDropdown } from '@ckeditor/ckeditor5-ui/src/labeledfield/utils';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import '../../theme/customtableform.css';

import TableListView from './tablelistview';

import LabeledTableListItemView from './labeledlistview';

export default class CustomTableFormView extends View {
	/**
	 * @param {Array.<Function>} validators Form validators used by {@link #isValid}.
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 */
	constructor(editor, validators, locale) {
		super(locale);

		this.editor = editor;
		const t = locale.t;
		const options = getOptions(editor);
		this.value = '';


		/**
		 * Tracks information about DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		// /**
		//  * The URL input view.
		//  *
		//  * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		//  */
		// this.urlInputView = this._createUrlInput('Tabela', 'Nome da tabela');


		this.tabelaInputView = this._createDropdown('Tabela 1', 'Nome da tabela 3', options);

		/**
		 * The Save button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.saveButtonView = this._createButton(t('Save'), checkIcon, 'ck-button-save');
		this.saveButtonView.type = 'submit';

		/**
				 * The Cancel button view.
				 *
				 * @member {module:ui/button/buttonview~ButtonView}
				 */
		this.cancelButtonView = this._createButton(t('Cancel'), cancelIcon, 'ck-button-cancel', 'cancel');

		/**
				 * A collection of views that can be focused in the form.
				 *
				 * @readonly
				 * @protected
				 * @member {module:ui/viewcollection~ViewCollection}
				 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler({
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		});

		/**
	 * An array of form validators used by {@link #isValid}.
	 *
	 * @readonly
	 * @protected
	 * @member {Array.<Function>}
	 */
		this._validators = validators;

		this.setTemplate({
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-custom-table-form'
				],

				tabindex: '-1'
			},

			children: [
				//	this.urlInputView,
				this.tabelaInputView,
				this.saveButtonView,
				this.cancelButtonView
			]
		});
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		submitHandler({
			view: this
		});

		const childViews = [
			//	this.urlInputView,
			this.tabelaInputView,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach((v) => {
			// Register the view as focusable.
			this._focusables.add(v);

			// Register the view in the focus tracker.
			this.focusTracker.add(v.element);
		});

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo(this.element);

		const stopPropagation = (data) => data.stopPropagation();

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set('arrowright', stopPropagation);
		this.keystrokes.set('arrowleft', stopPropagation);
		this.keystrokes.set('arrowup', stopPropagation);
		this.keystrokes.set('arrowdown', stopPropagation);

		// Intercept the "selectstart" event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView.
		// TODO: blocking "selectstart" in the #panelView should be configurable per–drop–down instance.
		this.listenTo(
			this.tabelaInputView.element,
			'change',
			(evt, domEvt) => {
				this.value = document.getElementsByClassName('table-select')[0].value;
				domEvt.stopPropagation();
			},
			{ priority: 'high' }
		);
	}

	/**
 * Creates a labeled input view.
 *
 * @private
 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled input view instance.
 */
	_createUrlInput(label, placeholder) {
		const t = this.locale.t;

		const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
		const inputField = labeledInput.fieldView;

		this._urlInputViewInfoDefault = t('Paste the media URL in the input.');
		this._urlInputViewInfoTip = t('Informe no nome da tabela que deseja inserir');

		labeledInput.label = label;
		labeledInput.infoText = this._urlInputViewInfoDefault;
		inputField.placeholder = placeholder;

		inputField.on('input', () => {
			// Display the tip text only when there's some value. Otherwise fall back to the default info text.
			labeledInput.infoText = inputField.element.value ? this._urlInputViewInfoTip : this._urlInputViewInfoDefault;
		});

		return labeledInput;
	}


	_createDropdown(label, infoText, options) {
		const list = new TableListView(this.editor.locale, options);

		// Render the list and put it in the DOM.
		list.render();
		const labeled = new LabeledTableListItemView(this.editor.locale, label, list);
		labeled.render();

		return labeled;
	}



	_createCollectionDropdown(titles, options, headingCommand, paragraphCommand, commands) {
		const itemDefinitions = new Collection();

		for (const option of options) {
			const def = {
				type: 'button',
				model: new Model({
					label: option.title,
					class: option.class,
					withText: true
				})
			};

			if (option.model === 'paragraph') {
				def.model.bind('isOn').to(paragraphCommand, 'value');
				def.model.set('commandName', 'paragraph');
				commands.push(paragraphCommand);
			} else {
				def.model.bind('isOn').to(headingCommand, 'value', value => value === option.model);
				def.model.set({
					commandName: 'heading',
					commandValue: option.model
				});
			}

			// Add the option to the collection.
			itemDefinitions.add(def);

			titles[option.model] = option.title;
		}
		return itemDefinitions;
	}

	/**
 * Creates a button view.
 *
 * @private
 * @param {String} label The button label.
 * @param {String} icon The button icon.
 * @param {String} className The additional button CSS class name.
 * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
 */
	_createButton(label, icon, className, eventName) {
		const button = new ButtonView(this.locale);

		button.set({
			label,
			icon,
			tooltip: true
		});

		button.extendTemplate({
			attributes: {
				class: className
			}
		});

		if (eventName) {
			button.delegate('execute').to(this, eventName);
		}
		return button;
	}


	/**
	 * Cleans up the supplementary error and information text of the {@link #urlInputView}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	resetFormStatus() {
		// this.urlInputView.errorText = null;
		// this.urlInputView.infoText = this._urlInputViewInfoDefault;
	}

	/**
 * Validates the form and returns `false` when some fields are invalid.
 *
 * @returns {Boolean}
 */
	isValid() {
	//	this.resetFormStatus();

		// for (const validator of this._validators) {
		// 	const errorText = validator(this);

		// 	// One error per field is enough.
		// 	if (errorText) {
		// 		// Apply updated error.
		// 		this.urlInputView.errorText = errorText;

		// 		return false;
		// 	}
		// }

		return true;
	}
}
