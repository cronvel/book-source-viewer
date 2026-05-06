// Invoke Rust methods
import { invoke } from "@tauri-apps/api/core" ;
// Filesystem plugin
import * as fs from '@tauri-apps/plugin-fs' ;
// Node.js path module
import * as path from "path-browserify" ;



// Path-related

//export function isAbsolute( filePath ) { return /^(?:[a-zA-Z]:[\\/]|[\\/]{2}|\/)/.test( filePath ) ; }
export function isAbsolute( filePath ) { return path.isAbsolute( filePath ) ; }
export function join( ... args ) { return path.join( ... args ) ; }



export function getDirectory( filePath ) { return path.dirname( filePath ) ; }

// Get the directory of a path, it should be already resolved, return null if none
export function getDirectory_deprecated( filePath ) {
	// Normalize
	filePath = filePath.replace( /\\/g , '/' ).replace( /\/+/g , '/' ) ;

	// Remove trailing slash
	if ( filePath[ filePath.length - 1 ] === '/' ) { filePath = filePath.slice( -1 ) ; }

	let indexOf = filePath.lastIndexOf( '/' ) ;
	if ( indexOf === -1 ) { return null ; }

	return filePath.slice( 0 , indexOf ) ;
}



// Get the extension from a filename or file path, return empty string if none
export function getExtension( filePath ) {
	let match = filePath.match( /\.([^.]+)$/ ) ;
	return match ? match[ 1 ].toLowerCase() : "" ;
}



// Resolve the path
export async function resolve( filePath ) {
	return await invoke( 'resolve_cli_path' , { input: filePath } ) ;
}



// File-related

// Read (ASYNC) a file as text
export function readTextFile( filePath ) { return fs.readTextFile( filePath ) ; }



// Load a text file located in the 'public' directory
export async function readPublicText( filePath ) {
	const text = await ( await fetch( filePath ) ).text() ;
	return text ;
}

