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
				<button v-if="item.children?.length" class="toggle" @click="toggle(item.href)">
					{{ isOpen(item.href) ? '−' : '+' }}
				</button>
				<span v-else class="toggle-placeholder" />
				<a :href="item.href">{{ item.title }}</a>
			</div>

			<!-- Recursive nesting -->
			<TableOfContents v-if="item.children?.length && isOpen(item.href)" :items="item.children" />
		</li>
	</ul>
</template>

<style scoped>
.toc-row {
	display: flex;
	align-items: center;
	gap: 0.5em;
}

.toggle,
.toggle-placeholder {
	padding: 0.1em;
	width: 1.2em;
	flex-shrink: 0;
}

.toggle {
	cursor: pointer;
}

ul {
  list-style: none;
  padding-left: 0;
}

ul ul {
  padding-left: 0.8em;
}

li:nth-child(even),
li:nth-child(even) li:nth-child(even),
li:nth-child(odd) li:nth-child(odd)
{
	background-color: #d88;
}

li:nth-child(odd),
li:nth-child(even) li:nth-child(odd),
li:nth-child(odd) li:nth-child(even)
{
	background-color: #8d8;
}

a {
  text-decoration: none;
  color: #333;
}

a:hover {
  text-decoration: underline;
}
</style>
