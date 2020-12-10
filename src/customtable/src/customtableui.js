/* eslint-disable space-in-parens */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
//
import CustomTableFormView from './ui/customtableformview';
import CustomTableEditing from './customtableediting';

// import mediaIcon from '../theme/icons/customTable.svg';
import mediaIcon from '@ckeditor/ckeditor5-core/theme/icons/three-vertical-dots.svg';

export default class CustomTableUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [CustomTableEditing];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CustomTableUI';
	}

	init() {
		const editor = this.editor;
		const command = editor.commands.get('customTable');
		const registry = editor.plugins.get(CustomTableEditing).registry;

		// Setup `imageUpload` button.
		editor.ui.componentFactory.add('customTable', locale => {
			const dropdown = createDropdown(locale);
			const mediaForm = new CustomTableFormView(this.editor, getFormValidators(editor.t, registry), editor.locale);
			this._setUpDropdown(dropdown, mediaForm, command, editor);
			this._setUpForm(dropdown, mediaForm, command);

			return dropdown;
		});
	}

	_setUpDropdown(dropdown, form, command) {
		const editor = this.editor;
		const t = editor.t;
		const button = dropdown.buttonView;
		const select = form.tabelaInputView;
		dropdown.render();

		dropdown.bind('isEnabled').to(command);
		dropdown.panelView.children.add(form);
		button.set({
			label: t('Inserir tabela'),
			icon: mediaIcon,
			tooltip: true,
			withText: true,
			withIcon: true
		});

		// Note: Use the low priority to make sure the following listener starts working after the
		// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
		// invisible form/input cannot be focused/selected.
		button.on('open', () => {

		}, { priority: 'low' });

		dropdown.on('submit', () => {
			if (form.isValid()) {
				const value = document.getElementsByClassName('table-select')[0].value;

				editor.execute('customTable', value);
				closeUI();
			}
		});

		dropdown.on('change:isOpen', () => form.resetFormStatus());
		dropdown.on('cancel', () => closeUI());

		function closeUI() {
			editor.editing.view.focus();
			dropdown.isOpen = false;
		}
	}

	_setUpForm(dropdown, form, command) {
		form.delegate('submit', 'cancel').to(dropdown);
		form.tabelaInputView.bind('value').to(command, 'value');


		form.saveButtonView.bind('isEnabled').to(command);
	}
}

function getFormValidators(t, registry) {
	return [
		form => {
			if (!form.url.length) {
				return t('Campo obrigatório.');
			}
		},
		form => {
			if (!registry.hasMedia(form.url)) {
				return t('This media URL is not supported.');
			}
		}
	];
}
