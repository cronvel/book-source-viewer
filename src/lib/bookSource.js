import * as fsUtils from './fs-utils.js'

import * as bookSource from 'book-source' ;
import HtmlRenderer from 'book-source-html-renderer' ;
import { default as kfgParse } from '../externals/kfgParse.esm.js' ;
import highlight from 'highlight.js' ;

// Invoke Rust methods
import { invoke } from "@tauri-apps/api/core" ;
// FS plugin
import { readTextFile } from '@tauri-apps/plugin-fs' ;
// Path resolver (FS method do not accept relative path)
//import { resolve , join } from '@tauri-apps/api/path' ;



export async function load( inputPath ) {
	// Resolve the path (relative pass are forbidden)
	//inputPath = await resolve( inputPath ) ;
	inputPath = await fsUtils.resolve( inputPath ) ;
	console.log( "resolved input path:" , inputPath ) ;


	let package_ ,
		rawContent = '' ,
		isPackage = false ,
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
				packageSourceText = await readTextFile( inputPath ) ;
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
				packageSourceText = await readTextFile( inputPath ) ;
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

	let basePath = fsUtils.getDirectory( inputPath ) ;

	/*
	for ( let sourcePath of package_.sources ) {
		let sourceContent ,
			fullPath = sourcePath ;

		if ( ! path.isAbsolute( fullPath ) ) { fullPath = path.join( baseDir , fullPath ) ; }
		if ( ! path.extname( fullPath ) ) { fullPath += '.bks' ; }

		try {
			sourceContent = fs.readFileSync( fullPath , 'utf8' ) ;
		}
		catch ( error ) {
			throw new Error( "Error reading source file '" + sourcePath + "':" , error ) ;
		}
		if ( rawContent ) { rawContent += '\n' ; }
		rawContent += sourceContent ;
	}

    var structuredDocument = bookSource.parse( rawContent , {
        metadataParser: kungFig.parse
    } ) ;
    */

	rawContent = await readTextFile( inputPath ) ;
	//console.log( "rawContent:" , rawContent ) ;

	const coreCss = await fsUtils.loadPublicText( '/core.css' ) ;
	const codeCss = await fsUtils.loadPublicText( '/code.css' ) ;

	return bookSourceToHtml( rawContent , { coreCss, codeCss } ) ;
}



export function bookSourceToHtml( rawContent , params = {} ) {
	let structuredDocument = bookSource.parse( rawContent ) ;
	//console.log( "structuredDocument:" , structuredDocument ) ;

	let html = renderHtml( structuredDocument , {
		theme: new bookSource.Theme() ,
		coreCss: params.coreCss ,
		codeCss: params.codeCss
	} ) ;

	//console.log( "html:" , html ) ;
	return html ;
}



function renderHtml( structuredDocument , params = {} ) { // , package_ ) {
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

