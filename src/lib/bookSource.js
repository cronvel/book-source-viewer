import * as fsUtils from './fsUtils.js'

import * as bookSource from 'book-source' ;
import HtmlRenderer from 'book-source-html-renderer' ;
import { default as kfgParse } from '../externals/kfgParse.esm.js' ;
import highlight from 'highlight.js' ;



export async function load( fullPath , params = {} ) {
	// Resolve the path (relative pass are forbidden)
	fullPath = await fsUtils.resolve( fullPath ) ;
	//console.log( "resolved input path:" , fullPath ) ;

	let package_ ,
		bks = '' ,
		isPackage = false ,
		textPostFilters = [] ,
		postProcess = {} ,
		theme = null ,
		baseName = fsUtils.getBasename( fullPath ) ,
		baseDir = fsUtils.getDirectory( fullPath ) ,
		extension = fsUtils.getExtension( fullPath ) ;

	switch ( extension ) {
		case 'bks' : {
            package_ = {
                sources: [ fullPath ]
            } ;
			break ;
		}
		case 'kfg' : {
			isPackage = true ;
			let packageSourceText ;

			try {
				packageSourceText = await fsUtils.readTextFile( fullPath ) ;
			}
			catch ( error ) {
				throw new Error( "Can't read package source file: " + fullPath ) ;
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
				packageSourceText = await fsUtils.readTextFile( fullPath ) ;
			}
			catch ( error ) {
				throw new Error( "Can't read package source file: " + fullPath ) ;
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
		if ( bks ) { bks += '\n' ; }
		bks += sourceContent ;
	}

	//console.log( "bks:" , bks ) ;

	const standaloneCss = await fsUtils.readPublicText( '/standalone.css' ) ;
	const coreCss = await fsUtils.readPublicText( '/core.css' ) ;
	const codeCss = await fsUtils.readPublicText( '/code.css' ) ;

	// Text post-filters
	// Add package text post-filters first, then command line text post-filters
	if ( Array.isArray( package_.textPostFilters ) ) { textPostFilters.push( ... package_.textPostFilters ) ; }
	if ( Array.isArray( params.textPostFilters ) ) { textPostFilters.push( ... params.textPostFilters ) ; }

	// Post-process
	// Add package post-process first, then command line post-process
	if ( package_.postProcess && typeof package_.postProcess === 'object' ) { Object.assign( postProcess , package_.postProcess ) ; }
    if ( params.postProcess && typeof params.postProcess === 'object' ) { Object.assign( postProcess , params.postProcess ) ; }

	let data = {
		fullPath ,
		baseDir ,
		baseName ,
		bks ,
		standaloneCss ,
		coreCss ,
		codeCss ,
		textPostFilters ,
		postProcess ,
		theme: package_.theme ,
		structuredDocument: null ,
		html: '' ,
		summaryMenuHtml: '' ,
		standaloneHtml: ''
	} ;

	bookSourceToHtml( data , true ) ;

	return data ;
}



export function bookSourceToHtml( data , renderStandalone = false ) {
	data.structuredDocument = bookSource.parse( data.bks , {
		metadataParser: kfgParse
	} ) ;

	// Text post-filters
	if ( data.textPostFilters.length ) { data.structuredDocument.textPostFilter( data.textPostFilters ) ; }

	// Post-process
	if ( Object.keys( data.postProcess ).length ) { data.structuredDocument.postProcess( data.postProcess ) ; }

	let theme = data.theme || data.structuredDocument.theme ;
	theme = ! theme || typeof theme !== 'object' ? new bookSource.Theme() : new bookSource.Theme( theme ) ;

	//console.log( "structuredDocument:" , data.structuredDocument ) ;

	data.html = renderHtml( data.structuredDocument , {
		theme ,
		coreCss: data.coreCss ,
		codeCss: data.codeCss ,
		idAttribute: true
	} ) ;

	data.summaryMenuHtml = renderSummaryMenuHtml( data.structuredDocument , { theme } ) ;

	if ( renderStandalone ) {
		data.standaloneHtml = renderStandaloneHtml( data.structuredDocument , {
			theme ,
			standaloneCss: data.standaloneCss ,
			coreCss: data.coreCss ,
			codeCss: data.codeCss ,
			idAttribute: true
		} ) ;
	}

	//console.log( "html:" , data.html ) ;
	return data.html ;
}



function renderHtml( structuredDocument , params = {} ) {
	var htmlRenderer = new HtmlRenderer(
		params.theme ,
		{
			shipCss: true ,
			coreCss: params.coreCss ,
			codeCss: params.codeCss ,
			idAttribute: params.idAttribute ,
			codeHighlighter: ( text , lang ) => highlight.highlight( text , { language: lang } ).value
		}
	) ;

	return structuredDocument.render( htmlRenderer ) ;
}



function renderStandaloneHtml( structuredDocument , params = {} ) {
	var htmlRenderer = new HtmlRenderer(
		params.theme ,
		{
			standalone: true ,
			standaloneCss: params.standaloneCss ,
			coreCss: params.coreCss ,
			codeCss: params.codeCss ,
			idAttribute: params.idAttribute ,
			codeHighlighter: ( text , lang ) => highlight.highlight( text , { language: lang } ).value
		}
	) ;

	return structuredDocument.render( htmlRenderer ) ;
}



function renderSummaryMenuHtml( structuredDocument , params = {} ) {
	var htmlRenderer = new HtmlRenderer(
		params.theme ,
		{
			shipCss: false ,
			noContainer: true
		}
	) ;

	return structuredDocument.render( htmlRenderer , 'summary' ) ;
}

