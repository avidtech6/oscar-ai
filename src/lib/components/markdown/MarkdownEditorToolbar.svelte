<script lang="ts">
	export let insertMarkdown: (syntax: string) => void = () => {};
	export let showPreview = false;
	export let onTogglePreview: () => void = () => {};
</script>

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
			on:click={onTogglePreview}
			title="Toggle Preview"
		>
			{showPreview ? '📝 Edit' : '👁️ Preview'}
		</button>
	</div>
</div>

<style>
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
</style>