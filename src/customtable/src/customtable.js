import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
// CustomTable
import CustomTableTableUI from './customtableui';
import CustomTableEditing from './customtableediting';

export default class CustomTable extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CustomTable';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CustomTableEditing, CustomTableTableUI, Widget ];
	}
}
