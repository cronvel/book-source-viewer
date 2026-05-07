import { Store } from '@tauri-apps/plugin-store' ;



/*
	storeName: the store filename, default to settings.json
	default: object for default store values, it also defines the available keys and types
*/
export function Storage( params = {} ) {
	this.tauriStore = new Store( params.storeName || 'settings.json' ) ;	// The underlying Tauri store
	this.default = params.default && typeof params.default === 'object' ? params.default : {} ;	// Default storage value with types
	this.cache = null ;	// Get our own copy of the storage
	this.changed = new Set() ;	// Store changed key to be updated
}



function entryType( v ) {
	if ( typeof v !== 'object' ) { return typeof v ; }
	if ( Array.isArray( v ) ) { return 'array' ; }
	return 'object' ;
}



Storage.prototype.load = async function() {
	const entries = await this.tauriStore.entries() ;

	for ( let key of Object.keys( this.default ) ) {
		if ( Object.hasOwn( entries , key ) && entryType( entries[ key ] ) === entryType( this.default[ key ] ) ) {
			this.cache[ key ] = entries[ key ] ;
		}
		else {
			this.cache[ key ] = this.default[ key ] ;
		}
	}
} ;



Storage.prototype.get = function( key ) {
	if ( ! this.cache ) { throw new Error( "The store is not ready, use `await storage.load()` first" ) ; }
	return this.cache[ key ] ;
} ;



Storage.prototype.set = function( key , value ) {
	if ( ! this.cache ) { throw new Error( "The store is not ready, use `await storage.load()` first" ) ; }

	let expectedType = entryType( this.default[ key ] ) ,
		valueType = entryType( value ) ;

	if ( valueType !== expectedType ) {
		throw new Error( "Expected a type of '" + expectedType + "' but got type of '" + valueType + "' for store key '" + key + "'." ) ;
	}

	this.cache[ key ] = value ;
	this.changed.add( key ) ;
} ;



Storage.prototype.save = async function () {
	const promises = [] ;

	for ( let key of this.changed ) {
		promises.push( this.tauriStore.set( key , this.cache[ value ] ) ) ;
	}

	await Promise.all( promises ) ;
	await this.tauriStore.save() ;
	this.changed.clear() ;
} ;

