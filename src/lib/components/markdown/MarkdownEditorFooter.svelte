<script lang="ts">
	export let value = '';
</script>

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

<style>
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