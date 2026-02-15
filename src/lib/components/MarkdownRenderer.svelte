<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import mermaid from 'mermaid';
	
	export let content: string = '';
	
	let container: HTMLDivElement;
	let renderedHtml: string = '';
	
	// Initialize mermaid
	onMount(() => {
		mermaid.initialize({
			startOnLoad: false,
			theme: 'default',
			securityLevel: 'strict',
			fontFamily: 'sans-serif'
		});
	});
	
	// Render markdown and process mermaid diagrams
	async function renderContent() {
		if (!content) {
			renderedHtml = '';
			return;
		}
		
		// Parse markdown
		const rawHtml = await marked.parse(content);
		
		// Sanitize HTML
		renderedHtml = DOMPurify.sanitize(rawHtml, {
			ADD_TAGS: ['iframe'],
			ADD_ATTR: ['target', 'rel']
		});
		
		// Wait for DOM update then render mermaid diagrams
		await new Promise(resolve => setTimeout(resolve, 100));
		renderMermaidDiagrams();
	}
	
	// Render all mermaid code blocks
	async function renderMermaidDiagrams() {
		if (!container) return;
		
		const mermaidBlocks = container.querySelectorAll('.mermaid');
		
		for (let i = 0; i < mermaidBlocks.length; i++) {
			const block = mermaidBlocks[i] as HTMLElement;
			const code = block.getAttribute('data-code') || block.textContent || '';
			
			if (code.trim()) {
				try {
					const id = `mermaid-${Date.now()}-${i}`;
					const { svg } = await mermaid.render(id, code);
					block.innerHTML = svg;
					block.classList.add('mermaid-rendered');
				} catch (error) {
					console.error('Mermaid render error:', error);
					block.innerHTML = `<pre class="text-red-500 text-sm">${code}</pre>`;
				}
			}
		}
	}
	
	// Reactive rendering
	$: if (content !== undefined) {
		renderContent();
	}
	
	afterUpdate(() => {
		renderMermaidDiagrams();
	});
</script>

<div class="markdown-content" bind:this={container}>
	{@html renderedHtml}
</div>

<style>
	.markdown-content {
		line-height: 1.6;
	}
	
	.markdown-content :global(h1) {
		font-size: 1.75rem;
		font-weight: 700;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}
	
	.markdown-content :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: #374151;
	}
	
	.markdown-content :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 0.75rem;
		margin-bottom: 0.5rem;
		color: #4b5563;
	}
	
	.markdown-content :global(h4),
	.markdown-content :global(h5),
	.markdown-content :global(h6) {
		font-size: 1rem;
		font-weight: 600;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		color: #6b7280;
	}
	
	.markdown-content :global(p) {
		margin-bottom: 0.75rem;
	}
	
	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin-left: 1.5rem;
		margin-bottom: 0.75rem;
	}
	
	.markdown-content :global(li) {
		margin-bottom: 0.25rem;
	}
	
	.markdown-content :global(blockquote) {
		border-left: 4px solid #2f5233;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #6b7280;
		font-style: italic;
		background: #f9fafb;
		padding: 0.75rem;
		border-radius: 0 0.5rem 0.5rem 0;
	}
	
	.markdown-content :global(code) {
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.875rem;
	}
	
	.markdown-content :global(pre) {
		background: #1f2937;
		color: #f9fafb;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1rem 0;
	}
	
	.markdown-content :global(pre code) {
		background: transparent;
		padding: 0;
		color: inherit;
	}
	
	.markdown-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
	}
	
	.markdown-content :global(th),
	.markdown-content :global(td) {
		border: 1px solid #e5e7eb;
		padding: 0.5rem;
		text-align: left;
	}
	
	.markdown-content :global(th) {
		background: #f9fafb;
		font-weight: 600;
	}
	
	.markdown-content :global(tr:nth-child(even)) {
		background: #f9fafb;
	}
	
	.markdown-content :global(a) {
		color: #2f5233;
		text-decoration: underline;
	}
	
	.markdown-content :global(a:hover) {
		color: #234026;
	}
	
	.markdown-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}
	
	.markdown-content :global(.mermaid) {
		background: white;
		padding: 1rem;
		border-radius: 0.5rem;
		margin: 1rem 0;
		text-align: center;
	}
	
	.markdown-content :global(.mermaid-rendered) {
		background: transparent;
		padding: 0;
	}
	
	.markdown-content :global(hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 1.5rem 0;
	}
	
	.markdown-content :global(strong) {
		font-weight: 600;
		color: #1f2937;
	}
	
	.markdown-content :global(em) {
		font-style: italic;
	}
</style>
