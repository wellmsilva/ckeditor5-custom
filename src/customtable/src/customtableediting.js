import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CustomTableCommand from './customtablecommand';
import CustomTableRegistry from './customtableregistry';
import { modelToViewAttributeConverter } from '@ckeditor/ckeditor5-image/src/image/converters';
import { downcastInsertTable } from './converters/downcast';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';


export default class CustomTableEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CustomTableEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor(editor) {
		super(editor);

		editor.config.define('customTable', {
			providers: [

			]
		});

		/**
		 * The media registry managing the media providers in the editor.
		 *
		 * @member {module:media-embed/mediaregistry~MediaRegistry} #registry
		 */
		this.registry = new CustomTableRegistry(editor.locale, editor.config.get('customTable'));
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// const t = editor.t;
		// const conversion = editor.conversion;
		// // const renderMediaPreview = editor.config.get( 'mediaEmbed.previewsInData' );
		// const registry = this.registry;

		this._defineSchema();
		this._defineConverters();
		setupCustomAttributeConversion('table', 'table', 'id', editor);

		editor.commands.add('customTable', new CustomTableCommand(editor));
	}

	_defineSchema() {
		const schema = this.editor.model.schema;
		schema.register('custom-table', {
			// Behaves like a self-contained object (e.g. an image).
			inheritAllFrom: '$block',
			isBlock: true,
			isObject: true,
			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block',
			allowAttributes: ['data-table', 'style']
		});

		schema.register('ct-table', {
			isBlock: true,
			allowIn: 'custom-table',
			allowContentOf: '$block'
		});

		schema.register('ct-table-thead', {
			isBlock: true,
			allowIn: 'ct-table',
			allowContentOf: '$block'
		});

		schema.register('ct-table-tr', {
			isBlock: true,
			allowIn: 'ct-table-thead',
			allowContentOf: '$block'
		});

		schema.register('ct-table-th', {
			allowWhere: '$text',
			// The placeholder will act as an inline node:
			isInline: true,
			// The inline widget is self-contained so it cannot be split by the caret and can be selected:
			isObject: true,
			allowIn: 'ct-table-tr',
			allowContentOf: '$block',
			allowAttributes: ['dataField']
		});
	}

	/**
	 * Definições de conversões do Editor
	 */
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.elementToElement({
			model: 'custom-table', view: {
				name: 'div',
				attributes: {
					class: 'ck ck-widget-table',
					style: [
						{ display: 'block' }
					],
					'data-table': null
				}
			}
		});

		conversion.elementToElement({
			model: 'ct-table',
			view: {
				name: 'table',
				attributes: {
					class: 'ck ck-custom-table',
					'data-tabela': true,
					style: 'pointer-events: none'
				}
			}
		});

		conversion.elementToElement({
			model: 'ct-table-thead',
			view: {
				name: 'thead', attributes: {
					style: 'background: #ccc'
				}
			}
		});

		conversion.elementToElement({
			model: 'ct-table-tbody',
			view: {
				name: 'tbody', attributes: {

				}
			}
		});

		conversion.elementToElement({
			model: 'ct-table-tr',
			view: {
				name: 'tr'
			}
		});

		conversion.elementToElement({
			model: 'ct-table-th',
			view: {
				name: 'th',
				attributes: {
					'data-field': '',
					style: 'color: #333'
				}
			}
		});

		conversion.elementToElement({
			model: 'ct-table-td',
			view: {
				name: 'td'
			}
		});

		// conversion.for('upcast').attributeToAttribute({
		// 	view: 'data-field',
		// 	model: 'dataField'
		// });

		conversion.for('downcast')
			.add(modelToViewAttributeConverter('data-field'))
			.add(dispatcher =>
				dispatcher.on('attribute:data-field', (evt, data, conversionApi) => {
					const myModelElement = data.item;
					// Mark element as consumed by conversion.
					conversionApi.consumable.consume(data.item, evt.name);
					// Get mapped view element to update.
					const viewElement = conversionApi.mapper.toViewElement(myModelElement);
					const fieldModel = myModelElement.getAttribute('data-field');
					const tableModel = myModelElement.getAttribute('data-table');
					const fieldView = viewElement['_attrs'];
					fieldView.set('data-table', tableModel);
					fieldView.set('data-field', fieldModel);
				})
			);

		conversion.for('upcast').attributeToAttribute({
			view: {
				name: 'ct-table-td',
				key: 'data-field'
			},
			model: 'data-field'
		});

		// conversion.for('editingDowncast').add(downcastInsertTable({ asWidget: true }));
		// conversion.for('editingDowncast').add(downcastInsertTable({ asWidget: true }));
		conversion.for('editingDowncast')
			.elementToElement({
				model: 'custom-table',
				view: (modelElement, viewWriter) => {
					return toWidgetEditable(modelElement, viewWriter);
				}
			});

		// conversion.for('dataDowncast').elementToElement({
		// 	model: 'custom-table',
		// 	view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
		// });
	}
}


function createPlaceholderView(modelItem, viewWriter) {
	console.log('createPlaceholderView');
	const name = modelItem.getAttribute('data-table');
	const placeholderView = viewWriter.createUiElement('span', {
		class: 'placeholder'
	});

	// Insert the placeholder name (as a text).
	const innerText = viewWriter.createText('{' + name + '}');
	viewWriter.insert(viewWriter.createPositionAt(placeholderView, 0), innerText);

	return placeholderView;
}


/**
 * Sets up a conversion that preserves classes on <img> and <table> elements.
 */
function setupCustomClassConversion(viewElementName, modelElementName, editor) {
	// The 'customClass' attribute stores custom classes from the data in the model so that schema definitions allow this attribute.
	editor.model.schema.extend(modelElementName, { allowAttributes: ['customClass'] });

	// Defines upcast converters for the <img> and <table> elements with a "low" priority so they are run after the default converters.
	editor.conversion.for('upcast').add(upcastCustomClasses(viewElementName), { priority: 'low' });

	// Defines downcast converters for a model element with a "low" priority so they are run after the default converters.
	// Use `downcastCustomClassesToFigure` if you want to keep your classes on <figure> element or `downcastCustomClassesToChild`
	// if you would like to keep your classes on a <figure> child element, i.e. <img>.
	editor.conversion.for('downcast').add(downcastCustomClassesToFigure(modelElementName), { priority: 'low' });
	// editor.conversion.for( 'downcast' ).add( downcastCustomClassesToChild( viewElementName, modelElementName ), { priority: 'low' } );
}

/**
 * Sets up a conversion for a custom attribute on the view elements contained inside a <figure>.
 *
 * This method:
 * - Adds proper schema rules.
 * - Adds an upcast converter.
 * - Adds a downcast converter.
 */
function setupCustomAttributeConversion(viewElementName, modelElementName, viewAttribute, editor) {
	// Extends the schema to store an attribute in the model.
	const modelAttribute = `custom${viewAttribute}`;

	editor.model.schema.extend(modelElementName, { allowAttributes: [modelAttribute] });

	editor.conversion.for('upcast').add(upcastAttribute(viewElementName, viewAttribute, modelAttribute));
	editor.conversion.for('downcast').add(downcastAttribute(modelElementName, viewElementName, viewAttribute, modelAttribute));
}

/**
 * Creates an upcast converter that will pass all classes from the view element to the model element.
 */
function upcastCustomClasses(elementName) {
	return dispatcher => dispatcher.on(`element:${elementName}`, (evt, data, conversionApi) => {
		const viewItem = data.viewItem;
		const modelRange = data.modelRange;

		const modelElement = modelRange && modelRange.start.nodeAfter;

		if (!modelElement) {
			return;
		}

		// The upcast conversion picks up classes from the base element and from the <figure> element so it should be extensible.
		const currentAttributeValue = modelElement.getAttribute('customClass') || [];

		currentAttributeValue.push(...viewItem.getClassNames());

		conversionApi.writer.setAttribute('customClass', currentAttributeValue, modelElement);
	});
}

/**
 * Creates a downcast converter that adds classes defined in the `customClass` attribute to a <figure> element.
 *
 * This converter expects that the view element is nested in a <figure> element.
 */
function downcastCustomClassesToFigure(modelElementName) {
	return dispatcher => dispatcher.on(`insert:${modelElementName}`, (evt, data, conversionApi) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement(modelElement);

		if (!viewFigure) {
			return;
		}

		// The code below assumes that classes are set on the <figure> element.
		// conversionApi.writer.addClass(modelElement.getAttribute('customClass'), viewFigure);
	});
}

/**
 * Creates a downcast converter that adds classes defined in the `customClass` attribute to a <figure> child element.
 *
 * This converter expects that the view element is nested in a <figure> element.
 */
function downcastCustomClassesToChild(viewElementName, modelElementName) {
	return dispatcher => dispatcher.on(`insert:${modelElementName}`, (evt, data, conversionApi) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement(modelElement);

		if (!viewFigure) {
			return;
		}

		// The code below assumes that classes are set on the element inside the <figure>.
		const viewElement = findViewChild(viewFigure, viewElementName, conversionApi);

		conversionApi.writer.addClass(modelElement.getAttribute('customClass'), viewElement);
	});
}

/**
 * Helper method that searches for a given view element in all children of the model element.
 *
 * @param {module:engine/view/item~Item} viewElement
 * @param {String} viewElementName
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
 * @return {module:engine/view/item~Item}
 */
function findViewChild(viewElement, viewElementName, conversionApi) {
	const viewChildren = Array.from(conversionApi.writer.createRangeIn(viewElement).getItems());

	return viewChildren.find(item => item.is('element', viewElementName));
}

/**
 * Returns the custom attribute upcast converter.
 */
function upcastAttribute(viewElementName, viewAttribute, modelAttribute) {
	return dispatcher => dispatcher.on(`element:${viewElementName}`, (evt, data, conversionApi) => {
		const viewItem = data.viewItem;
		const modelRange = data.modelRange;

		const modelElement = modelRange && modelRange.start.nodeAfter;

		if (!modelElement) {
			return;
		}

		conversionApi.writer.setAttribute(modelAttribute, viewItem.getAttribute(viewAttribute), modelElement);
	});
}

/**
 * Returns the custom attribute downcast converter.
 */
function downcastAttribute(modelElementName, viewElementName, viewAttribute, modelAttribute) {
	return dispatcher => dispatcher.on(`insert:${modelElementName}`, (evt, data, conversionApi) => {
		const modelElement = data.item;

		const viewFigure = conversionApi.mapper.toViewElement(modelElement);
		const viewElement = findViewChild(viewFigure, viewElementName, conversionApi);

		if (!viewElement) {
			return;
		}

		conversionApi.writer.setAttribute(viewAttribute, modelElement.getAttribute(modelAttribute), viewElement);
	});
}
