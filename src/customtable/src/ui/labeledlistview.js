import View from '@ckeditor/ckeditor5-ui/src/view';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';

export default class LabeledTableListItemView extends View {
	constructor(locale, caption, element) {
		super(locale);
		this.value = '132313';
		this.element = element;

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: 'table-item-label'
			},
			children: [{
				tag: 'label', attributes: {
					style: 'display: block;'
				},
				children: [caption]
			}, element]
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

		this.listenTo(
			this.element,
			'change',
			(evt, domEvt) => {
				// console.log('this.element', domEvt);
				// domEvt.stopPropagation();
				return 1;
			},
			{ priority: 'high' }
		);
	}
}
