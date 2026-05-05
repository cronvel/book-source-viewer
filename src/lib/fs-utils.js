
// Load a text file located in the 'public' directory
export async function loadPublicText( filePath ) {
	const text = await ( await fetch( filePath ) ).text() ;
	return text ;
}



// Get the extension from a filename or file path, return empty string if none
export function getExtension( filePath ) {
	let match = filePath.match( /\.([^.]+)$/ ) ;
	return match ? match[ 1 ].toLowerCase() : "" ;
}



// Get the directory of a path, it should be already resolved, return null if none
export function getDirectory( filePath ) {
	// Normalize
	filePath = filePath.replace( /\\/g , '/' ).replace( /\/+/g , '/' ) ;

	// Remove trailing slash
	if ( filePath[ filePath.length - 1 ] === '/' ) { filePath = filePath.slice( -1 ) ; }

	let indexOf = filePath.lastIndexOf( '/' ) ;
	if ( indexOf === -1 ) { return null ; }

	return filePath.slice( 0 , indexOf ) ;
}

