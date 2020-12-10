import { toWidget, toWidgetEditable, setHighlightHandling } from '@ckeditor/ckeditor5-widget/src/utils';

export function downcastInsertTable(options = {}) {
	return dispatcher => dispatcher.on('insert:table', (evt, data, conversionApi) => {
		const table = data.item;

		if (!conversionApi.consumable.consume(table, 'insert')) {
			return;
		}
		// conversionApi.consumable.consume(table, 'attribute:headingRows:table');
		// conversionApi.consumable.consume(table, 'attribute:headingColumns:table');

		const asWidget = options && options.asWidget;

		const figureElement = conversionApi.writer.createContainerElement('figure', { class: 'table' });
		const tableElement = conversionApi.writer.createContainerElement('table');
		conversionApi.writer.insert(conversionApi.writer.createPositionAt(figureElement, 0), tableElement);

		let tableWidget;

		// if (asWidget) {
		// 	tableWidget = toTableWidget(figureElement, conversionApi.writer);
		// }

		const viewPosition = conversionApi.mapper.toViewPosition(data.range.start);

		conversionApi.mapper.bindElements(table, asWidget ? tableWidget : figureElement);
		conversionApi.writer.insert(viewPosition, asWidget ? tableWidget : figureElement);
	}
	);
}

