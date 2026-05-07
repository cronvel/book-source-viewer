import { Storage } from './Storage.js' ;

const storage = new Storage( {
	storeName: 'settings.json' ,
	default: {
		lastFile: ''
	}
} ) ;

export function load() { return storage.load() ; }
export function save() { return storage.save() ; }
export function get( key ) { return storage.get( key ) ; }
export function set( key , value ) { return storage.set( key , value ) ; }

