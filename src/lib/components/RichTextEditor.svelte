<script lang="ts">
	export let value = '';
	export let placeholder = 'Start typing...';
	export let label = '';
	export let disabled = false;
	
	let isFocused = false;
	
	function handleInput(e: Event) {
		const target = e.target as HTMLDivElement;
		value = target.innerHTML;
	}
	
	function formatText(command: string, value?: string) {
		document.execCommand(command, false, value);
		const editor = document.querySelector('.editor-content') as HTMLDivElement;
		if (editor) {
			value = editor.innerHTML;
		}
	}
	
	function insertTemplate(template: string) {
		const editor = document.querySelector('.editor-content') as HTMLDivElement;
		if (editor) {
			editor.innerHTML += template;
			value = editor.innerHTML;
		}
	}
</script>

<div class="rich-text-editor" class:focused={isFocused} class:disabled={disabled}>
	{#if label}
		<label class="editor-label">{label}</label>
	{/if}
	
	<div class="editor-toolbar">
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => formatText('bold')} title="Bold">
				<b>B</b>
			</button>
			<button type="button" class="toolbar-button" on:click={() => formatText('italic')} title="Italic">
				<i>I</i>
			</button>
			<button type="button" class="toolbar-button" on:click={() => formatText('underline')} title="Underline">
				<u>U</u>
			</button>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => formatText('formatBlock', '<h1>')} title="Heading 1">
				H1
			</button>
			<button type="button" class="toolbar-button" on:click={() => formatText('formatBlock', '<h2>')} title="Heading 2">
				H2
			</button>
			<button type="button" class="toolbar-button" on:click={() => formatText('formatBlock', '<p>')} title="Paragraph">
				P
			</button>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => formatText('insertUnorderedList')} title="Bullet List">
				• List
			</button>
			<button type="button" class="toolbar-button" on:click={() => formatText('insertOrderedList')} title="Numbered List">
				1. List
			</button>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => insertTemplate('<p><strong>Tree Species:</strong> </p>')} title="Insert Tree Species">
				🌳
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertTemplate('<p><strong>Location:</strong> </p>')} title="Insert Location">
				📍
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertTemplate('<p><strong>Observation:</strong> </p>')} title="Insert Observation">
				👁️
			</button>
		</div>
	</div>
	
	<div 
		class="editor-content" 
		contenteditable={!disabled}
		on:input={handleInput}
		on:focus={() => isFocused = true}
		on:blur={() => isFocused = false}
		bind:innerHTML={value}
		data-placeholder={placeholder}
		role="textbox"
		aria-multiline="true"
	/>
	
	<div class="editor-footer">
		<div class="character-count">
			{#if value}
				{value.replace(/<[^>]*>/g, '').length} characters
			{:else}
				0 characters
			{/if}
		</div>
		<div class="editor-hint">
			Use toolbar for formatting, or type Markdown shortcuts
		</div>
	</div>
</div>

<style>
	.rich-text-editor {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.2s ease;
	}
	
	.rich-text-editor.focused {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.rich-text-editor.disabled {
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
	
	.toolbar-button:active {
		background: #e5e7eb;
	}
	
	.editor-content {
		min-height: 200px;
		max-height: 400px;
		overflow-y: auto;
		padding: 1rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #111827;
		outline: none;
	}
	
	.editor-content:empty:before {
		content: attr(data-placeholder);
		color: #9ca3af;
	}
	
	.editor-content:focus {
		outline: none;
	}
	
	.editor-content h1, .editor-content h2, .editor-content h3 {
		margin: 0.5rem 0;
		font-weight: 600;
	}
	
	.editor-content h1 {
		font-size: 1.5rem;
	}
	
	.editor-content h2 {
		font-size: 1.25rem;
	}
	
	.editor-content p {
		margin: 0.5rem 0;
	}
	
	.editor-content ul, .editor-content ol {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
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