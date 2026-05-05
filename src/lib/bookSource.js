import * as bookSource from 'book-source' ;
import HtmlRenderer from 'book-source-html-renderer' ;
import highlight from 'highlight.js' ;

// Invoke Rust methods
import { invoke } from "@tauri-apps/api/core" ;
// FS plugin
import { readTextFile } from '@tauri-apps/plugin-fs' ;
// Path resolver (FS method do not accept relative path)
//import { resolve , join } from '@tauri-apps/api/path' ;



export async function load( inputPath ) {
	inputPath = await invoke( 'resolve_cli_path' , { input: inputPath } ) ;

	// Resolve the path (relative pass are forbidden)
	//inputPath = await resolve( inputPath ) ;
	console.log( "resolved input path:" , inputPath ) ;

	let extension = getExtension( inputPath ) ;
	console.log( "extension:" , extension ) ;

	switch ( extension ) {
		case 'bks' :
			break ;
		case 'kfg' :
			break ;
		case 'json' :
			break ;
		default :
			throw new Error( "Extension '" + extension + "' not supported" ) ;
	}

	const rawContent = await readTextFile( inputPath ) ;
	//console.log( "rawContent:" , rawContent ) ;

	const coreCss = await loadText( '/core.css' ) ;
	const codeCss = await loadText( '/code.css' ) ;

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



// Utilities



// Load a text file
async function loadText( path ) {
	const text = await ( await fetch( path ) ).text() ;
	return text ;
}



function getExtension( filepath ) {
	let match = filepath.match( /\.([^.]+)$/ ) ;
	return match ? match[ 1 ].toLowerCase() : "" ;
}

