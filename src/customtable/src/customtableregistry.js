export default class CustomTableRegistry {
	constructor( locale, config ) {
		const providers = config.providers;
		const extraProviders = config.extraProviders || [];
		const removedProviders = new Set( config.removeProviders );
		const providerDefinitions = providers
			.concat( extraProviders )
			.filter( provider => {
				const name = provider.name;

				if ( !name ) {
					// /**
					//  * One of the providers (or extra providers) specified in the media embed configuration
					//  * has no name and will not be used by the editor. In order to get this media
					//  * provider working, double check your editor configuration.
					//  *
					//  * @warning media-embed-no-provider-name
					//  */
					// console.warn( attachLinkToDocumentation(
					// 	'media-embed-no-provider-name: The configured media provider has no name and cannot be used.'
					// ), { provider } );

					return false;
				}

				return !removedProviders.has( name );
			} );

		/**
		 * The {@link module:utils/locale~Locale} instance.
		 *
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = locale;

		/**
		 * The media provider definitions available for the registry. Usually corresponding with the
		 * {@link module:media-embed/mediaembed~MediaEmbedConfig media configuration}.
		 *
		 * @member {Array}
		 */
		this.providerDefinitions = providerDefinitions;
	}
}
