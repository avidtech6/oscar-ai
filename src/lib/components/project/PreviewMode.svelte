<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { projectComponents, currentProject } from '$lib/stores/appStore';
	import MarkdownIt from 'markdown-it';
	
	export let isOpen: boolean = false;
	export let markdown: string = '';
	
	const dispatch = createEventDispatcher();
	
	let md: MarkdownIt;
	
	// Initialize markdown-it
	$: {
		md = new MarkdownIt({
			html: true,
			linkify: true,
			typographer: true,
			breaks: true
		});
	}
	
	// Process markdown to HTML
	$: renderedHtml = markdown ? md.render(markdown) : '';
	
	// Detect orientation blocks and process them
	$: processedHtml = processOrientationBlocks(renderedHtml);
	
	function processOrientationBlocks(html: string): string {
		// Process ::: landscape blocks
		let result = html;
		
		// Match landscape blocks
		const landscapeRegex = /::: landscape\s*([\s\S]*?):::/g;
		result = result.replace(landscapeRegex, (match, content) => {
			return `<div class="page-landscape">${content}</div>`;
		});
		
		// Match portrait blocks (default)
		const portraitRegex = /::: portrait\s*([\s\S]*?):::/g;
		result = result.replace(portraitRegex, (match, content) => {
			return `<div class="page-portrait">${content}</div>`;
		});
		
		return result;
	}
	
	function close() {
		dispatch('close');
	}
	
	// Get current date for header
	const currentDate = new Date().toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
</script>

{#if isOpen}
	<div class="preview-mode fixed inset-0 z-50 bg-gray-800 flex flex-col">
		<!-- Header -->
		<div class="h-14 bg-gray-900 px-4 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button 
					class="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
					on:click={close}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
				<h3 class="text-white font-semibold">Preview Mode</h3>
				<span class="text-sm text-gray-400">Near-final HTML</span>
			</div>
			
			<div class="flex items-center gap-2">
				<button 
					class="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg flex items-center gap-2"
					on:click={() => window.print()}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
					</svg>
					Print / Export PDF
				</button>
			</div>
		</div>
		
		<!-- Preview Content -->
		<div class="flex-1 overflow-auto bg-gray-700 p-8">
			<div class="max-w-[210mm] mx-auto bg-white shadow-2xl">
				<!-- A4 Document -->
				<div class="document-page">
					<!-- Cover Page -->
					<div class="cover-page">
						<div class="cover-logo">🌳</div>
						<h1 class="cover-title">{$currentProject?.name || 'Project Report'}</h1>
						<div class="cover-subtitle">Arboricultural Report</div>
						<div class="cover-meta">
							<p><strong>Date:</strong> {currentDate}</p>
							<p><strong>Reference:</strong> {$currentProject?.id || 'N/A'}</p>
						</div>
					</div>
					
					<!-- Page Break -->
					<div class="page-break"></div>
					
					<!-- Document Content -->
					<div class="document-content">
						{@html processedHtml}
					</div>
					
					<!-- Components (Photos, Maps, Diagrams) -->
					{#if $projectComponents.length > 0}
						<div class="page-break"></div>
						
						<div class="components-section">
							<h2>Figures and Appendices</h2>
							
							{#each $projectComponents as component, index}
								<div class="component-figure {component.meta.orientation === 'landscape' ? 'landscape' : 'portrait'}">
									<div class="figure-number">Figure {index + 1}: {component.type}</div>
									
									{#if component.src}
										<img src={component.src} alt={component.meta.caption || component.type} />
									{:else}
										<div class="figure-placeholder">
											{component.type} component
										</div>
									{/if}
									
									{#if component.meta.caption}
										<div class="figure-caption">{component.meta.caption}</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Chat Input for Revisions -->
		<div class="h-16 bg-gray-900 px-4 flex items-center gap-3">
			<input
				type="text"
				placeholder="Ask Oscar to make revisions..."
				class="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						// Send to chat for revision
						const input = e.target;
						const value = input.value;
						dispatch('revise', { prompt: value });
						input.value = '';
					}
				}}
			/>
			<button 
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				Send
			</button>
		</div>
	</div>
{/if}

<style>
	/* A4 Page Settings */
	.document-page {
		width: 210mm;
		min-height: 297mm;
		padding: 20mm;
		margin: 0 auto;
		background: white;
		box-sizing: border-box;
	}
	
	/* Cover Page */
	.cover-page {
		min-height: 277mm;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 40px;
		background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
		color: white;
	}
	
	.cover-logo {
		font-size: 80px;
		margin-bottom: 20px;
	}
	
	.cover-title {
		font-size: 36px;
		font-weight: 700;
		margin-bottom: 10px;
	}
	
	.cover-subtitle {
		font-size: 24px;
		font-weight: 300;
		opacity: 0.8;
		margin-bottom: 40px;
	}
	
	.cover-meta {
		font-size: 14px;
		line-height: 2;
		opacity: 0.7;
	}
	
	/* Page Break */
	.page-break {
		page-break-after: always;
		break-after: page;
		height: 0;
		margin: 20px 0;
		border-top: 1px dashed #ccc;
	}
	
	/* Document Content */
	.document-content {
		font-family: 'Times New Roman', serif;
		font-size: 12pt;
		line-height: 1.6;
		color: #333;
	}
	
	.document-content :global(h1) {
		font-size: 24pt;
		font-weight: 700;
		margin: 24pt 0 12pt;
		color: #1e3a5f;
		border-bottom: 2px solid #1e3a5f;
		padding-bottom: 8px;
	}
	
	.document-content :global(h2) {
		font-size: 18pt;
		font-weight: 600;
		margin: 18pt 0 10pt;
		color: #1e3a5f;
	}
	
	.document-content :global(h3) {
		font-size: 14pt;
		font-weight: 600;
		margin: 14pt 0 8pt;
		color: #374151;
	}
	
	.document-content :global(p) {
		margin: 10pt 0;
		text-align: justify;
	}
	
	.document-content :global(ul),
	.document-content :global(ol) {
		margin: 10pt 0;
		padding-left: 20pt;
	}
	
	.document-content :global(li) {
		margin: 4pt 0;
	}
	
	.document-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 14pt 0;
		font-size: 10pt;
	}
	
	.document-content :global(th),
	.document-content :global(td) {
		border: 1px solid #333;
		padding: 8pt;
		text-align: left;
	}
	
	.document-content :global(th) {
		background: #f3f4f6;
		font-weight: 600;
	}
	
	.document-content :global(img) {
		max-width: 100%;
		height: auto;
		margin: 10pt 0;
	}
	
	/* Orientation Blocks */
	:global(.page-landscape) {
		page-break-after: always;
		break-after: page;
		width: 297mm;
		margin-left: -44mm;
		padding: 20mm;
		background: white;
	}
	
	:global(.page-portrait) {
		margin: 10pt 0;
	}
	
	/* Components Section */
	.components-section {
		margin-top: 30pt;
	}
	
	.components-section h2 {
		font-size: 18pt;
		color: #1e3a5f;
		margin-bottom: 20pt;
	}
	
	.component-figure {
		margin: 20pt 0;
		padding: 15pt;
		border: 1px solid #e5e7eb;
		background: #f9fafb;
	}
	
	.component-figure.landscape {
		width: 277mm;
		margin-left: -35mm;
		page-break-inside: avoid;
	}
	
	.component-figure.portrait {
		page-break-inside: avoid;
	}
	
	.figure-number {
		font-size: 10pt;
		color: #6b7280;
		margin-bottom: 8pt;
	}
	
	.component-figure img {
		width: 100%;
		max-height: 150mm;
		object-fit: contain;
	}
	
	.figure-placeholder {
		height: 100mm;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #e5e7eb;
		color: #6b7280;
	}
	
	.figure-caption {
		margin-top: 8pt;
		font-size: 10pt;
		color: #4b5563;
		font-style: italic;
	}
	
	/* Print Styles */
	@media print {
		.document-page {
			margin: 0;
			box-shadow: none;
		}
		
		.page-break {
			border-top: none;
		}
		
		.page-landscape {
			page-orientation: landscape;
		}
	}
</style>
