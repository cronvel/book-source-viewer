import { convertFileSrc } from "@tauri-apps/api/core";

export function fixMediaPaths( $element , baseDir ) {
	$element.querySelectorAll( 'img' ).forEach( img => {
		let src = img.getAttribute( 'src' ) ;
		if ( ! src || src.startsWith( 'http') || src.startsWith( 'asset:' ) ) { return ; }
		let absolute = baseDir + '/' + src ;
		let converted = convertFileSrc( absolute ) ;
		console.log( "Converted media path from '" + src + "' to '" + converted + "'" ) ;
		img.src = convertFileSrc( absolute ) ;
	} ) ;
}

