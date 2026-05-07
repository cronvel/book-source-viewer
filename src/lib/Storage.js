import { Store } from '@tauri-apps/plugin-store' ;



/*
	storeName: the store filename, default to settings.json
	default: object for default store values, it also defines the available keys and types
*/
export function Storage( params = {} ) {
	this.storeName = params.storeName || 'settings.json' ;
	this.default = params.default && typeof params.default === 'object' ? params.default : {} ;

	this.tauriStore = null ;	// The underlying tauri store
	this.cache = {} ;	// Get our own copy of the storage
	this.changed = new Set() ;	// Store changed key to be updated
}



function entryType( v ) {
	if ( typeof v !== 'object' ) { return typeof v ; }
	if ( Array.isArray( v ) ) { return 'array' ; }
	return 'object' ;
}



Storage.prototype.load = async function() {
	this.tauriStore = await Store.load( this.storeName ) ;
	//console.log( "this.tauriStore entries:" , await this.tauriStore.entries() ) ;
	const entries = await this.tauriStore.entries() ;
	const toDelete = new Set() ;

	for ( let [ key , value ] of entries ) {
		if ( Object.hasOwn( this.default , key ) ) {
			if ( entryType( value ) === entryType( this.default[ key ] ) ) {
				this.cache[ key ] = value ;
			}
			else {
				this.cache[ key ] = this.default[ key ] ;
			}
		}
		else {
			toDelete.add( key ) ;
		}
	}

	for ( let key of Object.keys( this.default ) ) {
		if ( ! Object.hasOwn( this.cache , key ) ) {
			this.cache[ key ] = this.default[ key ] ;
		}
	}

	// Purge extraneous entries
	if ( toDelete.size ) {
		let promises = [] ;

		for ( let key of toDelete ) {
			promises.push( this.tauriStore.delete( key ) ) ;
		}

		await Promise.all( promises ) ;
	}

	console.log( "Final store values:" , this.cache ) ;
} ;



Storage.prototype.get = function( key ) {
	if ( ! this.tauriStore ) { throw new Error( "The store is not ready, use `await storage.load()` first" ) ; }
	return this.cache[ key ] ;
} ;



Storage.prototype.set = function( key , value ) {
	if ( ! this.tauriStore ) { throw new Error( "The store is not ready, use `await storage.load()` first" ) ; }

	if ( ! Object.hasOwn( this.default , key ) ) {
		throw new Error( "Unexistent store key '" + key + "'." ) ;
	}

	let expectedType = entryType( this.default[ key ] ) ,
		valueType = entryType( value ) ;

	if ( valueType !== expectedType ) {
		throw new Error( "Expected a type of '" + expectedType + "' but got type of '" + valueType + "' for store key '" + key + "'." ) ;
	}

	this.cache[ key ] = value ;
	this.changed.add( key ) ;
} ;



Storage.prototype.save = async function () {
	if ( ! this.tauriStore ) { throw new Error( "The store is not ready, use `await storage.load()` first" ) ; }

	const promises = [] ;

	for ( let key of this.changed ) {
		promises.push( this.tauriStore.set( key , this.cache[ key ] ) ) ;
	}

	await Promise.all( promises ) ;
	await this.tauriStore.save() ;
	this.changed.clear() ;
} ;

