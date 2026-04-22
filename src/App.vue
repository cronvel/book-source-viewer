<script setup>
import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";

// CLI plugin to retrieve args
import { getMatches } from '@tauri-apps/plugin-cli';

// FS plugin
import { readTextFile } from '@tauri-apps/plugin-fs';

// Path resolver (FS method do not accept relative path)
import { resolve , join } from '@tauri-apps/api/path';

import * as bookSource from './lib/bookSource.js' ;

let book_source_content = ref( "<h2>Placeholder</h2>" ) ;



async function loadText( path ) {
  const text = await ( await fetch( path ) ).text() ;
  return text ;
}



async function test() {
  // Get the CWD, it's a Rust method created in src-tauri/src/lib.rs
  const cwd = await invoke( 'get_cwd' ) ;
  console.log( "CWD:" , cwd ) ;

  // Get CLI args (for dev mode, npm requires triple -- after npm in order to pass the argument to the app)
  const matches = await getMatches() ;
  console.log( "matches:" , matches ) ;

  let inputPath = matches.args.input.value ;
  console.log( "input path:" , inputPath ) ;
  inputPath = await invoke( 'resolve_cli_path' , { input: inputPath } ) ;
  // Resolve the path (relative pass are forbidden)
  //inputPath = await resolve( inputPath ) ;
  console.log( "resolved input path:" , inputPath ) ;
  
  const rawContent = await readTextFile( inputPath ) ;
  console.log( "rawContent:" , rawContent ) ;

  const coreCss = await loadText( '/core.css' ) ;
  const codeCss = await loadText( '/code.css' ) ;
  console.log( "coreCss:" , coreCss ) ;

  book_source_content.value = bookSource.bookSourceToHtml( rawContent , { coreCss, codeCss } ) ;
}

test() ;

</script>

<template>
  <main class="container">
    <div v-html="book_source_content"></div>
  </main>
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}

</style>
<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
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

#greet-input {
  margin-right: 5px;
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
