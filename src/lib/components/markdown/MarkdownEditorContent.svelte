<script lang="ts">
	export let value = '';
	export let placeholder = 'Write your markdown here...';
	export let disabled = false;
	export let showPreview = false;
	export let renderMarkdownPreview: (markdown: string) => string = () => '';
	export let handleInput: (e: Event) => void = () => {};
	export let onFocus: () => void = () => {};
	export let onBlur: () => void = () => {};
</script>

<div class="editor-content">
	{#if showPreview}
		<div class="markdown-preview">
			<div class="preview-header">
				<h3>Preview</h3>
			</div>
			<div class="preview-content">
				{@html renderMarkdownPreview(value)}
			</div>
		</div>
	{:else}
		<textarea 
			class="markdown-textarea"
			bind:value
			on:input={handleInput}
			on:focus={onFocus}
			on:blur={onBlur}
			placeholder={placeholder}
			disabled={disabled}
			rows={10}
		/>
	{/if}
</div>

<style>
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
</style>