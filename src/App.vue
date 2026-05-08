<script setup>
import { ref , computed , nextTick } from 'vue' ;
import { invoke } from '@tauri-apps/api/core' ;
import { getCurrentWindow } from '@tauri-apps/api/window' ;

// CLI plugin to retrieve args
import { getMatches } from '@tauri-apps/plugin-cli' ;
import { message as dialog , open as openDialog , save as saveDialog } from '@tauri-apps/plugin-dialog' ;

import * as bookSource from './lib/bookSource.js' ;
import * as fsUtils from './lib/fsUtils.js' ;
import * as appStorage from './lib/appStorage.js' ;
import { fixMediaPaths } from './lib/fixMediaPaths.js' ;

// Elements
const mainContainer = ref( null ) ;
const bookSourceContainer = ref( null ) ;

const showOpenButton = ref( true ) ;
const bookSourceContent = ref( '' ) ;

let currentDoc = null ;



async function loadBookSourceFromCLIArgs() {
	// Get CLI args (for dev mode, npm requires triple -- after npm in order to pass the argument to the app)
	const matches = await getMatches() ;
	console.log( "matches:" , matches ) ;

	let inputPath = matches.args.input.value ;
	console.log( "input path:" , inputPath ) ;

	if ( inputPath ) {
		await loadBookSource( inputPath ) ;
	}
	else {
		showOpenButton.value = true ;
		//await openBookSourceDialog() ;
		let lastFile = appStorage.get( 'lastFile' ) ;
		if ( lastFile ) {
			await loadBookSource( lastFile ) ;
		}
	}
}



async function openBookSourceDialog() {
	let lastFile = appStorage.get( 'lastFile' ) ;
	let defaultPath = lastFile ? fsUtils.getDirectory( lastFile ) : null ;

	const filePath = await openDialog( {
		multiple: false,
		defaultPath ,
		filters: [
			{
				name: 'BookSource',
				extensions: ['bks', 'json', 'kfg']
			}
		]
	} ) ;

	if ( filePath ) {
		await loadBookSource( filePath ) ;
	}
}



async function loadBookSource( inputPath , noScrollTop ) {
	try {
		currentDoc = await bookSource.load( inputPath ) ;
		//console.log( "HTML:" , currentDoc.html ) ;
	}
	catch ( error ) {
		bookSourceContent.value = "<error>" + error + "</error>" ;
		console.error( error ) ;
		showOpenButton.value = true ;
		return ;
	}

	bookSourceContent.value = currentDoc.html ;
	showOpenButton.value = false ;

	// Vue's nextTick() is triggered after the update
	await nextTick() ;

	if ( ! noScrollTop ) { mainContainer.value.scrollTop = 0 ; }

	// Now we can rebase all the media's URL
	fixMediaPaths( bookSourceContainer.value , currentDoc.baseDir ) ;

	appStorage.set( 'lastFile' , currentDoc.fullPath ) ;
	await appStorage.save() ;

	// Seems to not work on Gnome
	await getCurrentWindow().setTitle( "Book Source Viewer — " + currentDoc.baseName ) ;
}



function reloadBookSource() {
	if ( currentDoc ) {
		return loadBookSource( currentDoc.fullPath , true ) ;
	}
}



function clearBookSource() {
	bookSourceContent.value = '' ;
	showOpenButton.value = true ;
}



// TODO: the HTML here is not stand-alone, currentDoc should probably contains the stand-alone version too
async function saveAsHtml() {
	if ( ! currentDoc ) { return ; }

	let lastFile = appStorage.get( 'lastFile' ) ;
	let defaultPath = lastFile ? fsUtils.getDirectory( lastFile ) : null ;

	const filePath = await saveDialog( {
		defaultPath ,
		filters: [
			{
				name: 'HTML',
				extensions: ['html']
			}
		]
	} ) ;

	if ( ! filePath ) { return ; }

	try {
		await fsUtils.writeTextFile( filePath , currentDoc.html ) ;
		await dialog( "File saved!" , { kind: 'info' } ) ;
	}
	catch ( error ) {
		await dialog( "Error saving the file: " + error , { kind: 'error' } ) ;
	}
}



function printBookSource() {
	if ( ! currentDoc ) { return ; }
	window.print() ;
}



async function startup() {
	await appStorage.load() ;
	loadBookSourceFromCLIArgs() ;
}

startup() ;
</script>

<template>
	<menu class="menu-bar">
		<button @click="openBookSourceDialog"><img src="./assets/open-file.svg" /></button>
		<button @click="reloadBookSource"><img src="./assets/reload.svg" /></button>
		<button @click="saveAsHtml"><img src="./assets/save.svg" /></button>
		<button @click="printBookSource"><img src="./assets/print.svg" /></button>
		<button @click="clearBookSource"><img src="./assets/close.svg" /></button>
	</menu>
	<main ref="mainContainer" class="container" :class="{centered: showOpenButton}">
		<div v-if="showOpenButton" class="idle-big-menu">
			<button @click="openBookSourceDialog">Open</button>
		</div>
		<div ref="bookSourceContainer" v-html="bookSourceContent"></div>
	</main>
</template>

<style>
:root {
	font-family: Inter, Avenir, Helvetica, Arial, sans-serif;

	color: #0f0f0f;
	background-color: #f6f6f6;

	font-synthesis: none;
	text-rendering: optimizeLegibility;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	-webkit-text-size-adjust: 100%;
}

html, body, #app {
	height: 100%;
	margin: 0;
}

#app {
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.menu-bar {
	box-sizing: border-box;
	width: 100vw;
	margin: 0;
	padding: 0.25em 1em;
	flex-shrink: 0;
	background-color: #333;
	display: flex;
	flex-direction: row;
	justify-content: end;
	align-items: end;
	gap: 0.5em;
}

.menu-bar button {
	font-size: 0.6em;
	background-color: #eee;
	padding: 0.2em;
}

.menu-bar button img {
	display: block;
	width: 2em;
}

.idle-big-menu {
	margin: 0;
	padding: 1em;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}

.idle-big-menu button {
	font-size: 2em;
}

.container {
	margin: 0;
	flex: 1;
	overflow: auto;
	display: flex;
	flex-direction: column;
}

.container.centered {
	justify-content: center;
}

.book-source {
	margin: auto;
	/* Padding is mandatory to avoid margin collapse, e.g. on <h1> tags */
	padding: 1em 2em;
	max-width: 80em;
}

a {
	font-weight: 500;
	color: #646cff;
	text-decoration: inherit;
}

a:hover {
	color: #535bf2;
}

h1 {
	text-align: center;
}

input,
button {
	border-radius: 8px;
	border: 1px solid transparent;
	padding: 0.6em 1.2em;
	font-size: 1em;
	font-weight: 500;
	font-family: inherit;
	color: #0f0f0f;
	outline: none;
	background-color: #ffffff;
	transition: border-color 0.25s;
	box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
	cursor: pointer;
}

button:hover {
	border-color: #396cd8;
}

button:active {
	border-color: #396cd8;
	background-color: #e8e8e8;
}

error {
	display: block;
	color: red;
	background-color: #faa;
	font-weight: bold;
	font-size: 1.5em;
	margin: 1.5em;
}

@media (prefers-color-scheme: dark) {
	:root {
		color: #f6f6f6;
		background-color: #2f2f2f;
	}

	a:hover {
		color: #24c8db;
	}

	input,
	button {
		color: #ffffff;
		background-color: #0f0f0f98;
	}
	button:active {
		background-color: #0f0f0f69;
	}
}

@page {
	size: A4;
	margin: 10mm;
}

@media print {
	html, body, #app, container {
		display: block;
		overflow: visible;
		visibility: visible;
		height: auto !important;
	}

	.menu-bar {
		display: none;
		visibility: hidden;
	}

	.book-source {
		font-size: 8pt !important;
	}
}
</style>
