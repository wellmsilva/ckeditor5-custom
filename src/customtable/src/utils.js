/**
 * Lista de options
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Array.<module:heading/heading~HeadingOption>}.
 */
export function getOptions(editor) {
	// console.log("getConfigs", options );

	return editor.config.get('customTable.items').map(option => {
		option = Object.assign({}, option, { title: option.name, value: option });
		return option;
	});
}

export function insertMedia( model, url, insertPosition ) {
	console.log('insertMedia', model);
	model.change( writer => {
		const mediaElement = writer.createElement( 'customTable', { url } );

		model.insertContent( mediaElement, insertPosition );

		// writer.setSelection( mediaElement, 'on' );
	} );
}

/**
 * Returns a selected media element in the model, if any.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {module:engine/model/element~Element|null}
 */
export function getSelectedMediaModelWidget( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'custom-table' ) ) {
		return selectedElement;
	}

	return null;
}
