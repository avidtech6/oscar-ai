<script lang="ts">
	import MarkdownEditorToolbar from './markdown/MarkdownEditorToolbar.svelte';
	import MarkdownEditorContent from './markdown/MarkdownEditorContent.svelte';
	import MarkdownEditorFooter from './markdown/MarkdownEditorFooter.svelte';

	export let value = '';
	export let placeholder = 'Write your markdown here...';
	export let label = '';
	export let disabled = false;
	export let showPreview = false;
	
	let isFocused = false;
	
	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
	}
	
	function insertMarkdown(syntax: string) {
		const textarea = document.querySelector('.markdown-textarea') as HTMLTextAreaElement;
		if (!textarea) return;
		
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		
		let newText = '';
		if (selectedText) {
			newText = syntax.replace('{text}', selectedText);
		} else {
			newText = syntax.replace('{text}', '');
		}
		
		const before = value.substring(0, start);
		const after = value.substring(end);
		value = before + newText + after;
		
		textarea.focus();
		setTimeout(() => {
			textarea.selectionStart = start + newText.length;
			textarea.selectionEnd = start + newText.length;
		}, 0);
	}
	
	function renderMarkdownPreview(markdown: string): string {
		// Simple markdown rendering for preview
		let html = markdown
			.replace(/^# (.*$)/gm, '<h1>$1</h1>')
			.replace(/^## (.*$)/gm, '<h2>$1</h2>')
			.replace(/^### (.*$)/gm, '<h3>$1</h3>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/`(.*?)`/g, '<code>$1</code>')
			.replace(/^- (.*$)/gm, '<li>$1</li>')
			.replace(/\n/g, '<br>');
		
		// Wrap list items
		if (html.includes('<li>')) {
			html = html.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
		}
		
		return html;
	}

	function handleTogglePreview() {
		showPreview = !showPreview;
	}

	function handleFocus() {
		isFocused = true;
	}

	function handleBlur() {
		isFocused = false;
	}
</script>

<div class="markdown-editor" class:focused={isFocused} class:disabled={disabled}>
	{#if label}
		<label class="editor-label">{label}</label>
	{/if}
	
	<MarkdownEditorToolbar
		insertMarkdown={insertMarkdown}
		showPreview={showPreview}
		onTogglePreview={handleTogglePreview}
	/>
	
	<MarkdownEditorContent
		bind:value
		{placeholder}
		{disabled}
		{showPreview}
		renderMarkdownPreview={renderMarkdownPreview}
		handleInput={handleInput}
		onFocus={handleFocus}
		onBlur={handleBlur}
	/>
	
	<MarkdownEditorFooter {value} />
</div>

<style>
	.markdown-editor {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.2s ease;
	}
	
	.markdown-editor.focused {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.markdown-editor.disabled {
		background: #f9fafb;
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.editor-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		padding: 0.75rem 1rem 0.5rem;
		border-bottom: 1px solid #f3f4f6;
	}
</style>