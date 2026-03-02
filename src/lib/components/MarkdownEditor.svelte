<script lang="ts">
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
</script>

<div class="markdown-editor" class:focused={isFocused} class:disabled={disabled}>
	{#if label}
		<label class="editor-label">{label}</label>
	{/if}
	
	<div class="editor-toolbar">
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('# {text}')} title="Heading 1">
				H1
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('## {text}')} title="Heading 2">
				H2
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('### {text}')} title="Heading 3">
				H3
			</button>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('**{text}**')} title="Bold">
				<b>B</b>
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('*{text}*')} title="Italic">
				<i>I</i>
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('`{text}`')} title="Code">
				<code>C</code>
			</button>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('- {text}')} title="Bullet List">
				• List
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('1. {text}')} title="Numbered List">
				1. List
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('> {text}')} title="Blockquote">
				❝
			</button>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('[link text](https://example.com)')} title="Insert Link">
				🔗
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertMarkdown('![alt text](image.jpg)')} title="Insert Image">
				🖼️
			</button>
		</div>
		
		<div class="toolbar-group">
			<button 
				type="button" 
				class="toolbar-button {showPreview ? 'active' : ''}" 
				on:click={() => showPreview = !showPreview}
				title="Toggle Preview"
			>
				{showPreview ? '📝 Edit' : '👁️ Preview'}
			</button>
		</div>
	</div>
	
	<div class="editor-content">
		{#if showPreview}
			<div class="markdown-preview">
				<div class="preview-header">
					<h3>Preview</h3>
				</div>
				<div class="preview-content" bind:innerHTML={renderMarkdownPreview(value)} />
			</div>
		{:else}
			<textarea 
				class="markdown-textarea"
				bind:value
				on:input={handleInput}
				on:focus={() => isFocused = true}
				on:blur={() => isFocused = false}
				placeholder={placeholder}
				disabled={disabled}
				rows={10}
			/>
		{/if}
	</div>
	
	<div class="editor-footer">
		<div class="character-count">
			{#if value}
				{value.length} characters, {value.split(/\s+/).filter(Boolean).length} words
			{:else}
				0 characters, 0 words
			{/if}
		</div>
		<div class="editor-hint">
			Markdown supported: # headings, **bold**, *italic*, `code`, - lists, > quotes
		</div>
	</div>
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
	
	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f3f4f6;
		background: #f9fafb;
	}
	
	.toolbar-group {
		display: flex;
		gap: 0.25rem;
		padding-right: 0.75rem;
		border-right: 1px solid #e5e7eb;
	}
	
	.toolbar-group:last-child {
		border-right: none;
	}
	
	.toolbar-button {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		padding: 0.375rem 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.toolbar-button:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}
	
	.toolbar-button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	
	.toolbar-button:active {
		background: #e5e7eb;
	}
	
	.editor-content {
		min-height: 200px;
	}
	
	.markdown-textarea {
		width: 100%;
		min-height: 200px;
		padding: 1rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #111827;
		border: none;
		outline: none;
		resize: vertical;
		background: transparent;
	}
	
	.markdown-textarea:focus {
		outline: none;
	}
	
	.markdown-textarea::placeholder {
		color: #9ca3af;
	}
	
	.markdown-preview {
		height: 100%;
	}
	
	.preview-header {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f3f4f6;
		background: #f9fafb;
	}
	
	.preview-header h3 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}
	
	.preview-content {
		padding: 1rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #111827;
		overflow-y: auto;
		max-height: 300px;
	}
	
	.preview-content h1 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0.5rem 0;
	}
	
	.preview-content h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.5rem 0;
	}
	
	.preview-content h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0.5rem 0;
	}
	
	.preview-content strong {
		font-weight: 600;
	}
	
	.preview-content em {
		font-style: italic;
	}
	
	.preview-content code {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		background: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}
	
	.preview-content ul, .preview-content ol {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}
	
	.preview-content blockquote {
		border-left: 3px solid #e5e7eb;
		padding-left: 1rem;
		margin: 0.5rem 0;
		color: #6b7280;
	}
	
	.editor-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-top: 1px solid #f3f4f6;
		background: #f9fafb;
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.character-count {
		font-weight: 500;
	}
	
	.editor-hint {
		font-style: italic;
	}
</style>