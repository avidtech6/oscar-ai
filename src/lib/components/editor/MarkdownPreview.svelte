<script lang="ts">
	import { onMount } from 'svelte';
	import MarkdownIt from 'markdown-it';
	
	export let content: string = '';
	export let className: string = '';
	
	let renderedHtml: string = '';
	let md: MarkdownIt;
	
	$: if (content !== undefined && md) {
		renderMarkdown();
	}
	
	function renderMarkdown() {
		if (!content) {
			renderedHtml = '';
			return;
		}
		
		try {
			renderedHtml = md.render(content);
		} catch (error) {
			console.error('Markdown rendering error:', error);
			renderedHtml = `<pre>${content}</pre>`;
		}
	}
	
	onMount(() => {
		md = new MarkdownIt({
			html: true,
			linkify: true,
			typographer: true,
			breaks: true
		});
		
		// Add target="_blank" to all links
		md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
			const aIndex = tokens[idx].attrIndex('target');
			if (aIndex < 0) {
				tokens[idx].attrPush(['target', '_blank']);
			} else {
				tokens[idx].attrs[aIndex][1] = '_blank';
			}
			return self.renderToken(tokens, idx, options);
		};
		
		renderMarkdown();
	});
</script>

<div class="markdown-preview prose prose-sm max-w-none {className}">
	{@html renderedHtml}
</div>

<style>
	.markdown-preview {
		padding: 1rem;
		overflow-y: auto;
		height: 100%;
	}
	
	.markdown-preview :global(h1) {
		font-size: 1.75rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #1f2937;
		border-bottom: 2px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}
	
	.markdown-preview :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #374151;
	}
	
	.markdown-preview :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		color: #4b5563;
	}
	
	.markdown-preview :global(p) {
		margin-bottom: 1rem;
		line-height: 1.7;
		color: #374151;
	}
	
	.markdown-preview :global(ul),
	.markdown-preview :global(ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}
	
	.markdown-preview :global(li) {
		margin-bottom: 0.25rem;
		line-height: 1.6;
	}
	
	.markdown-preview :global(blockquote) {
		border-left: 4px solid #3b82f6;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #6b7280;
		font-style: italic;
		background: #f9fafb;
		padding: 0.75rem 1rem;
		border-radius: 0 0.25rem 0.25rem 0;
	}
	
	.markdown-preview :global(code) {
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875em;
		color: #dc2626;
	}
	
	.markdown-preview :global(pre) {
		background: #1f2937;
		color: #f9fafb;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1rem 0;
	}
	
	.markdown-preview :global(pre code) {
		background: transparent;
		color: inherit;
		padding: 0;
	}
	
	.markdown-preview :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
	}
	
	.markdown-preview :global(th),
	.markdown-preview :global(td) {
		border: 1px solid #e5e7eb;
		padding: 0.5rem 0.75rem;
		text-align: left;
	}
	
	.markdown-preview :global(th) {
		background: #f9fafb;
		font-weight: 600;
	}
	
	.markdown-preview :global(tr:nth-child(even)) {
		background: #f9fafb;
	}
	
	.markdown-preview :global(a) {
		color: #3b82f6;
		text-decoration: underline;
	}
	
	.markdown-preview :global(a:hover) {
		color: #2563eb;
	}
	
	.markdown-preview :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}
	
	.markdown-preview :global(hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 2rem 0;
	}
	
	.markdown-preview :global(strong) {
		font-weight: 600;
		color: #1f2937;
	}
	
	.markdown-preview :global(em) {
		font-style: italic;
	}
</style>
