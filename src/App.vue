<script setup>
import { ref , computed , nextTick } from "vue";
import { invoke } from "@tauri-apps/api/core" ;
// CLI plugin to retrieve args
import { getMatches } from '@tauri-apps/plugin-cli';
import { open as openDialog } from '@tauri-apps/plugin-dialog';

import * as bookSource from './lib/bookSource.js' ;
import { fixMediaPaths } from './lib/fixMediaPaths.js' ;

const bookSourceContainer = ref( null ) ;
const bookSourceContent = ref( "<h2>Placeholder</h2>" ) ;



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
		await loadBookSourceFromFileSelector() ;
	}
}



async function loadBookSourceFromFileSelector() {
	const filePath = await openDialog( {
		multiple: false,
		filters: [
			{
				name: 'BookSource',
				extensions: ['bks', 'json', 'kfg']
			}
		]
	} ) ;

	console.log( "Dialog file:" , filePath ) ;
	await loadBookSource( filePath ) ;
}



async function loadBookSource( inputPath ) {
	let doc ;

	try {
		doc = await bookSource.load( inputPath ) ;
	}
	catch ( error ) {
		bookSourceContent.value = "<error>" + error + "</error>" ;
		return ;
	}

	bookSourceContent.value = doc.html ;

	// Vue's nextTick() is triggered after the update
	await nextTick() ;

	// Now we can rebase all the media's URL
	fixMediaPaths( bookSourceContainer.value , doc.baseDir ) ;
}

loadBookSourceFromCLIArgs() ;
</script>

<template>
	<main class="container">
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

body {
	margin: 0;
}

.container {
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.book-source {
	margin: auto;
	/* Padding is mandatory to avoid margin collapse, e.g. on <h1> tags */
	padding: 1em 2em;
	max-width: 80em;
}

.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: 0.75s;
}

.logo.tauri:hover {
	filter: drop-shadow(0 0 2em #24c8db);
}

.row {
	display: flex;
	justify-content: center;
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

input,
button {
	outline: none;
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

</style>
