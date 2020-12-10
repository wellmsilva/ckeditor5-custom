import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
import { getSelectedMediaModelWidget } from './utils';


export default class CustomTableCommand extends Command {

	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {Array.<String>} modelElements Names of the element which this command can apply in the model.
	 */
	constructor(editor, modelElements) {
		super(editor);

		/**
		 * If the selection starts in a heading (which {@link #modelElements is supported by this command})
		 * the value is set to the name of that heading model element.
		 * It is  set to `false` otherwise.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean|String} #value
		 */

		/**
		 * Set of defined model's elements names that this command support.
		 * See {@link module:heading/heading~HeadingOption}.
		 *
		 * @readonly
		 * @member {Array.<String>}
		 */
		this.modelElements = modelElements;
	}


	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const position = selection.getFirstPosition();
		const selected = getSelectedMediaModelWidget(selection);

		let parent = position.parent;

		if (parent != parent.root) {
			parent = parent.parent;
		}

		this.value = selected ? selected.getAttribute('url') : null;

		// console.log(parent)
		this.isEnabled = !schema.checkChild(parent, 'custom-table');
	}


	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean} The current value.
	 */
	_getValue() {
		const selection = this.editor.model.document.selection;

		const firstBlock = first(selection.getSelectedBlocks());

		// In the current implementation, the block quote must be an immediate parent of a block element.
		return !!(firstBlock && findQuote(firstBlock));
	}


	/**
	 *
	 * @param {*} options
	 */
	execute(valueInput = '') {
		//	console.log('execute', this.value = document.getElementsByClassName('table-select')[0].value);
		const model = this.editor.model;
		const document = model.document;
		const position = document.selection.getFirstPosition();

		const jsObjects = this.editor.config.get('customTable.items');

		const result = jsObjects.filter(obj => {
			return obj.name === valueInput;
		});

		if (result[0] == null)
			return;

		model.change(writer => {
			const name = result[0].name;
			const labels = result[0].labels;
			const fields = result[0].fields;

			const element = createCustomTable(writer, position, name, labels, fields);
			model.createPositionBefore(element);
		}
		);
	}
}

function createCustomTable(writer, position, name, labels, fields) {
	const customTable = writer.createElement('custom-table', {
		style: {'display': 'block' }
	});
	const ctTable = writer.createElement('ct-table', {
		'data-table': name
	});
	const ctTableThead = writer.createElement('ct-table-thead');
	const ctTableTbody = writer.createElement('ct-table-tbody');
	const ctTableTr = writer.createElement('ct-table-tr');

	writer.append(ctTable, customTable);
	writer.append(ctTableThead, ctTable);
	writer.append(ctTableTr, ctTableThead);

	for (let i = 0; i < labels.length; i++) {
		const value = labels[i];
		const _field = fields[i];

		const ctTableTh = writer.createElement('ct-table-th', {
			'data-table': name,
			'data-field': _field
		}
		);

		writer.append(ctTableTh, ctTableTr);
		writer.appendText(value, ctTableTh);
	}
	writer.append(ctTableTbody, ctTable);

	writer.append(customTable, position, 'after');

	writer.setSelection(customTable, 'on');

	return customTable;
}
