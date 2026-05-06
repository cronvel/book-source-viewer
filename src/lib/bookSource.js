import * as fsUtils from './fs-utils.js'

import * as bookSource from 'book-source' ;
import HtmlRenderer from 'book-source-html-renderer' ;
import { default as kfgParse } from '../externals/kfgParse.esm.js' ;
import highlight from 'highlight.js' ;



export async function load( inputPath , params = {} ) {
	// Resolve the path (relative pass are forbidden)
	//inputPath = await resolve( inputPath ) ;
	inputPath = await fsUtils.resolve( inputPath ) ;
	console.log( "resolved input path:" , inputPath ) ;


	let package_ ,
		rawContent = '' ,
		isPackage = false ,
		postFilters = [] ,
		theme = null ,
		baseDir = fsUtils.getDirectory( inputPath ) ,
		extension = fsUtils.getExtension( inputPath ) ;

	console.log( "extension:" , extension ) ;


	switch ( extension ) {
		case 'bks' : {
            package_ = {
                sources: [ inputPath ]
            } ;
			break ;
		}
		case 'kfg' : {
			isPackage = true ;
			let packageSourceText ;

			try {
				packageSourceText = await fsUtils.readTextFile( inputPath ) ;
			}
			catch ( error ) {
				throw new Error( "Can't read package source file: " + inputPath ) ;
			}

			try {
				package_ = kfgParse( packageSourceText ) ;
			}
			catch ( error ) {
				throw new Error( "Package source file is not a valid KFG: " + error ) ;
			}
			break ;
		}
		case 'json' : {
			isPackage = true ;
			let packageSourceText ;

			try {
				packageSourceText = await fsUtils.readTextFile( inputPath ) ;
			}
			catch ( error ) {
				throw new Error( "Can't read package source file: " + inputPath ) ;
			}

			try {
				package_ = JSON.parse( packageSourceText ) ;
			}
			catch ( error ) {
				throw new Error( "Package source file is not a valid JSON: " + error ) ;
			}
			break ;
		}
		default :
			throw new Error( "Extension '" + extension + "' not supported" ) ;
	}

	if ( ! Array.isArray( package_.sources ) || ! package_.sources.length ) {
		throw new Error( "No source specified in the package." ) ;
	}

	for ( let sourcePath of package_.sources ) {
		let sourceContent ,
			fullPath = sourcePath ;

		if ( ! fsUtils.isAbsolute( fullPath ) ) { fullPath = fsUtils.join( baseDir , fullPath ) ; }
		if ( ! fsUtils.getExtension( fullPath ) ) { fullPath += '.bks' ; }

		try {
			sourceContent = await fsUtils.readTextFile( fullPath ) ;
		}
		catch ( error ) {
			throw new Error( "Error reading source file '" + sourcePath + "':" , error ) ;
		}
		if ( rawContent ) { rawContent += '\n' ; }
		rawContent += sourceContent ;
	}

	console.log( "rawContent:" , rawContent ) ;

	const coreCss = await fsUtils.readPublicText( '/core.css' ) ;
	const codeCss = await fsUtils.readPublicText( '/code.css' ) ;

	// Post-filters
	// Add package post-filters first, then command line post-filters
	if ( Array.isArray( package_.postFilters ) ) { postFilters.push( ... package_.postFilters ) ; }
	if ( Array.isArray( params.postFilters ) ) { postFilters.push( ... params.postFilters ) ; }

	let html = bookSourceToHtml( rawContent , { coreCss, codeCss , postFilters , theme: package_.theme } ) ;

	return { html , baseDir } ;
}



export function bookSourceToHtml( rawContent , params = {} ) {
	let structuredDocument = bookSource.parse( rawContent , {
		metadataParser: kfgParse
	} ) ;

	if ( params.postFilters.length ) { structuredDocument.textPostFilter( postFilters ) ; }

	let theme = params.theme || structuredDocument.theme ;
	theme = ! theme || typeof theme !== 'object' ? new bookSource.Theme() : new bookSource.Theme( theme ) ;

	//console.log( "structuredDocument:" , structuredDocument ) ;

	let html = renderHtml( structuredDocument , {
		theme ,
		coreCss: params.coreCss ,
		codeCss: params.codeCss
	} ) ;

	//console.log( "html:" , html ) ;
	return html ;
}



function renderHtml( structuredDocument , params = {} ) {
	var htmlRenderer = new HtmlRenderer(
		params.theme ,
		{
			shipCss: true ,
			coreCss: params.coreCss ,
			codeCss: params.codeCss ,
			codeHighlighter: ( text , lang ) => highlight.highlight( text , { language: lang } ).value
		}
	) ;

	return structuredDocument.render( htmlRenderer ) ;
} ;

