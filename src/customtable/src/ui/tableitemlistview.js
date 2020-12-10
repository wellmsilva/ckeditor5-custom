import View from '@ckeditor/ckeditor5-ui/src/view';

export default class TableListItemView extends View {
	constructor(locale, options) {
		super(locale);
		const bind = this.bindTemplate;
		// Views define their interface (state) using observable attributes.
		this.set('value', 'bar');

		this.setTemplate({
			tag: 'option',
			attributes: {
				tabindex: -1,
				class: [
					'table-item-option',
					bind.to('selected')
				],
				value: options.value.name
			},
			children: [options.name],
			on: {
				// Views listen to DOM events and propagate them.
				change: bind.to('change')
			}
		});

		this.on( 'change:value', ( evt, propertyName, newValue, oldValue ) => {
			console.log( `${ propertyName } has changed from ${ oldValue } to ${ newValue }` );
		} );
	}

	// ...

	focus() {
		console.log('focus', this.value);
		this.element.focus();
	}


}
