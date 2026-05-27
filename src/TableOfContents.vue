<script setup>
// This is a recursive template

import { ref } from 'vue' ;

defineProps( {
	items: {
		type: Array,
		required: true
	}
} ) ;



const opened = ref( new Set() ) ;

function isOpen( href ) {
	return opened.value.has( href ) ;
}

function toggle( href ) {
	if ( opened.value.has( href ) ) { opened.value.delete( href ) ; }
	else { opened.value.add( href ) ; }
}
</script>

<template>
	<ul>
		<li v-for="item in items" :key="item.href">
			<div class="toc-row">
				<div v-if="item.children?.length" class="toggle" @click="toggle(item.href)">
					<img v-if="isOpen(item.href)" src="./assets/chevron-down.svg" />
					<img v-else src="./assets/chevron-right.svg" />
				</div>
				<div v-else class="toggle-placeholder" />
				<a :href="item.href">{{ item.title }}</a>
			</div>

			<!-- Recursive nesting -->
			<TableOfContents v-if="item.children?.length && isOpen(item.href)" :items="item.children" />
		</li>
	</ul>
</template>

<style scoped>
ul {
	list-style: none;
	padding-left: 0;
	margin-block: 0;
	border: 1px solid #333;
}

ul ul {
	padding-left: 1.5em;
}

li {
	display: block;
	box-sizing: border-box;
	padding: 0;
	margin: 0;
	border-top: 1px solid #333;
}

li:first-child {
	border-top: none;
}

li:nth-child(even),
li:nth-child(even) li:nth-child(even),
li:nth-child(odd) li:nth-child(odd) {
	background-color: #77d;
}

li:nth-child(even):has(> div > a:hover),
li:nth-child(even) li:nth-child(even):has(> div > a:hover),
li:nth-child(odd) li:nth-child(odd):has(> div > a:hover) {
	background-color: #ddf;
}

li:nth-child(odd),
li:nth-child(even) li:nth-child(odd),
li:nth-child(odd) li:nth-child(even) {
	background-color: #66d;
}

li:nth-child(odd):has(> div > a:hover),
li:nth-child(even) li:nth-child(odd):has(> div > a:hover),
li:nth-child(odd) li:nth-child(even):has(> div > a:hover) {
	background-color: #ddf;
}

.toc-row {
	display: flex;
	align-items: stretch;
	gap: 0;
	padding: 0;
	margin: 0;
}

.toggle,
.toggle-placeholder {
	flex-shrink: 0;

	display: flex;
	align-items: center;  
	box-sizing: border-box;
	padding: 0.1em;
	width: 1.5em;
	background-color: #cccccc80;
}

.toggle {
	cursor: pointer;
}

.toggle img {
	margin: 0;
	padding: 0;
	display: block;
}

li a {
	display: block;
	box-sizing: border-box;
	padding: 0.3em;
	width: 100%;
	min-height: 1.5em;
	text-decoration: none;
	color: #333;
}

</style>
