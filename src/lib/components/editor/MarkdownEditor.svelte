<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { activeDocument, updateDocumentContent } from '$lib/stores/appStore';
	
	export let content: string = '';
	export let readonly: boolean = false;
	export let placeholder: string = 'Start writing...';
	
	const dispatch = createEventDispatcher();
	
	let textarea: HTMLTextAreaElement;
	let isDirty = false;
	let saveTimeout: ReturnType<typeof setTimeout>;
	
	$: if ($activeDocument && content !== $activeDocument.content) {
		content = $activeDocument.content;
	}
	
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		content = target.value;
		isDirty = true;
		
		// Update the store
		updateDocumentContent(content);
		
		// Debounced save indicator
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			dispatch('change', content);
		}, 1000);
	}
	
	function handleKeyDown(event: KeyboardEvent) {
		// Handle Tab key for indentation
		if (event.key === 'Tab') {
			event.preventDefault();
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			
			content = content.substring(0, start) + '\t' + content.substring(end);
			
			setTimeout(() => {
				textarea.selectionStart = textarea.selectionEnd = start + 1;
			}, 0);
		}
		
		// Ctrl/Cmd + S to save
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault();
			dispatch('save');
		}
	}
	
	function insertAtCursor(before: string, after: string = '') {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);
		
		content = content.substring(0, start) + before + selectedText + after + content.substring(end);
		
		setTimeout(() => {
			textarea.focus();
			textarea.selectionStart = start + before.length;
			textarea.selectionEnd = start + before.length + selectedText.length;
		}, 0);
		
		updateDocumentContent(content);
		dispatch('change', content);
	}
	
	export function insertMarkdown(type: string) {
		switch (type) {
			case 'bold':
				insertAtCursor('**', '**');
				break;
			case 'italic':
				insertAtCursor('*', '*');
				break;
			case 'heading':
				insertAtCursor('## ');
				break;
			case 'list':
				insertAtCursor('- ');
				break;
			case 'numbered':
				insertAtCursor('1. ');
				break;
			case 'link':
				insertAtCursor('[', '](url)');
				break;
			case 'image':
				insertAtCursor('![alt text](image-url)');
				break;
			case 'table':
				insertAtCursor('| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |');
				break;
			case 'code':
				insertAtCursor('`', '`');
				break;
			case 'quote':
				insertAtCursor('> ');
				break;
		}
	}
	
	onMount(() => {
		if (textarea && content) {
			textarea.value = content;
		}
	});
</script>

<div class="markdown-editor h-full flex flex-col bg-white">
	{#if !readonly}
		<div class="toolbar flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Bold"
				on:click={() => insertMarkdown('bold')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Italic"
				on:click={() => insertMarkdown('italic')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-4 0h8"/>
				</svg>
			</button>
			<div class="w-px h-4 bg-gray-300 mx-1"></div>
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Heading"
				on:click={() => insertMarkdown('heading')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Bullet List"
				on:click={() => insertMarkdown('list')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Numbered List"
				on:click={() => insertMarkdown('numbered')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01"/>
				</svg>
			</button>
			<div class="w-px h-4 bg-gray-300 mx-1"></div>
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Table"
				on:click={() => insertMarkdown('table')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M10 3v18M14 3v18"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Code"
				on:click={() => insertMarkdown('code')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
				title="Quote"
				on:click={() => insertMarkdown('quote')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
				</svg>
			</button>
		</div>
	{/if}
	
	<textarea
		bind:this={textarea}
		value={content}
		on:input={handleInput}
		on:keydown={handleKeyDown}
		{readonly}
		{placeholder}
		class="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed {readonly ? 'bg-gray-50' : ''}"
		spellcheck="true"
	></textarea>
	
	{#if isDirty}
		<div class="absolute bottom-2 right-2 text-xs text-gray-400">
			Unsaved changes...
		</div>
	{/if}
</div>

<style>
	.markdown-editor {
		position: relative;
	}
	
	textarea {
		tab-size: 4;
	}
	
	textarea::placeholder {
		color: #9ca3af;
	}
</style>
