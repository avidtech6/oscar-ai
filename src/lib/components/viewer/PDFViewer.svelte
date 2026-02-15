<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let src: string | null = null;
	export let fileId: string | null = null;
	
	const dispatch = createEventDispatcher();
	
	let isLoading = true;
	let error: string | null = null;
	
	// Convert Google Drive URL to embed URL
	$: embedUrl = src ? convertToEmbedUrl(src) : null;
	
	function convertToEmbedUrl(url: string): string {
		// If it's a Google Drive URL, convert to embed
		if (url.includes('googleapis.com/drive')) {
			// Extract file ID from URL
			const match = url.match(/files\/([^?]+)/);
			if (match) {
				return `https://drive.google.com/file/d/${match[1]}/preview`;
			}
		}
		return url;
	}
	
	function handleLoad() {
		isLoading = false;
	}
	
	function handleError() {
		isLoading = false;
		error = 'Failed to load PDF';
	}
	
	export function downloadPdf() {
		if (src) {
			// Convert to download URL
			let downloadUrl = src;
			if (src.includes('googleapis.com/drive')) {
				const match = src.match(/files\/([^?]+)/);
				if (match) {
					downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
				}
			}
			
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = 'document.pdf';
			link.target = '_blank';
			link.click();
		}
	}
	
	function handleFullscreen() {
		const iframe = document.querySelector('.pdf-iframe') as HTMLIFrameElement;
		if (iframe) {
			if (iframe.requestFullscreen) {
				iframe.requestFullscreen();
			}
		}
	}
</script>

<div class="pdf-viewer flex flex-col h-full bg-gray-100">
	<!-- Toolbar -->
	<div class="toolbar flex items-center justify-between p-2 bg-white border-b border-gray-200">
		<div class="flex items-center gap-2">
			<button 
				class="p-2 hover:bg-gray-100 rounded text-blue-600"
				on:click={downloadPdf}
				title="Download PDF"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
				</svg>
			</button>
			
			<button 
				class="p-2 hover:bg-gray-100 rounded text-blue-600"
				on:click={handleFullscreen}
				title="Fullscreen"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
				</svg>
			</button>
		</div>
		
		<div class="flex items-center gap-2">
			<span class="text-sm text-gray-600">PDF Viewer</span>
		</div>
	</div>
	
	<!-- PDF Iframe -->
	<div class="flex-1 overflow-hidden bg-gray-200">
		{#if isLoading}
			<div class="flex items-center justify-center h-full">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center h-full p-8">
				<p class="text-red-600 mb-4">{error}</p>
				<button 
					class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
					on:click={downloadPdf}
				>
					Download PDF
				</button>
			</div>
		{:else if embedUrl}
			<iframe
				class="pdf-iframe w-full h-full"
				src={embedUrl}
				title="PDF Viewer"
				on:load={handleLoad}
				on:error={handleError}
				allow="autoplay"
			></iframe>
		{:else}
			<div class="flex items-center justify-center h-full">
				<p class="text-gray-500">No PDF to display</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.pdf-viewer {
		height: 100%;
	}
	
	iframe {
		border: none;
	}
</style>
