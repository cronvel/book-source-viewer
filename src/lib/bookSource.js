
import * as bookSource from 'book-source' ;
import HtmlRenderer from 'book-source-html-renderer' ;
import highlight from 'highlight.js' ;



export function bookSourceToHtml( rawContent , params = {} ) {
	let structuredDocument = bookSource.parse( rawContent ) ;
	console.log( "structuredDocument:" , structuredDocument ) ;

	let html = renderHtml( structuredDocument , {
		theme: new bookSource.Theme() ,
		coreCss: params.coreCss ,
		codeCss: params.codeCss
	} ) ;

	console.log( "html:" , html ) ;
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

