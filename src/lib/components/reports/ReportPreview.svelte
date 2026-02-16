<script lang="ts">
	import type { Template } from '$lib/services/templateService';
	import type { Project } from '$lib/db';

	export let selectedTemplate: Template | null = null;
	export let selectedProject: Project | undefined;
	export let generatedReport = '';
	export let safeGeneratedReport = '';

	export let copyToClipboard: () => void;
	export let downloadAsHtml: () => void;
	export let downloadAsPdf: () => void;
	export let downloadAsWord: () => void;
	export let downloadAsPlainText: () => void;
	export let startOver: () => void;
</script>

<div class="card">
	<div class="p-4 border-b border-gray-200 flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold">Generated Report</h2>
			<p class="text-sm text-gray-500">{selectedTemplate?.name} - {selectedProject?.name}</p>
		</div>
		<div class="flex gap-2">
			<button
				on:click={copyToClipboard}
				class="btn btn-secondary text-sm"
			>
				Copy HTML
			</button>
			<button
				on:click={downloadAsHtml}
				class="btn btn-primary text-sm"
			>
				HTML
			</button>
			<button
				on:click={downloadAsPdf}
				class="btn btn-primary text-sm"
			>
				PDF
			</button>
			<button
				on:click={downloadAsWord}
				class="btn btn-primary text-sm"
			>
				Word
			</button>
			<button
				on:click={downloadAsPlainText}
				class="btn btn-secondary text-sm"
			>
				TXT
			</button>
			<button
				on:click={startOver}
				class="btn btn-secondary text-sm"
			>
				New Report
			</button>
		</div>
	</div>
	
	<div class="p-6">
		<div class="mb-4 text-sm text-gray-600">
			Report generated successfully. Export in multiple formats:
		</div>
		
		<!-- Export Options -->
		<div class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
			<button
				on:click={downloadAsHtml}
				class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
			>
				<div class="text-2xl mb-2">📄</div>
				<div class="font-medium">HTML</div>
				<div class="text-xs text-gray-500">Web format</div>
			</button>
			<button
				on:click={downloadAsPdf}
				class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
			>
				<div class="text-2xl mb-2">📊</div>
				<div class="font-medium">PDF</div>
				<div class="text-xs text-gray-500">Print-ready</div>
			</button>
			<button
				on:click={downloadAsWord}
				class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
			>
				<div class="text-2xl mb-2">📝</div>
				<div class="font-medium">Word</div>
				<div class="text-xs text-gray-500">Editable</div>
			</button>
			<button
				on:click={downloadAsPlainText}
				class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
			>
				<div class="text-2xl mb-2">📃</div>
				<div class="font-medium">Plain Text</div>
				<div class="text-xs text-gray-500">Simple format</div>
			</button>
		</div>
		
		<!-- Report Preview -->
		<div class="border rounded-lg overflow-hidden">
			<div class="bg-gray-100 px-4 py-2 border-b text-sm font-medium">
				Report Preview
			</div>
			<div class="p-4 max-h-[600px] overflow-auto">
				{#if generatedReport.includes('<!DOCTYPE html>') || generatedReport.includes('<html>')}
					<iframe
						srcdoc={safeGeneratedReport}
						class="w-full h-[500px] border-0"
						title="Report Preview"
					></iframe>
				{:else}
					<pre class="whitespace-pre-wrap font-sans text-sm text-gray-700">{generatedReport}</pre>
				{/if}
			</div>
		</div>
		
		<div class="mt-6 text-sm text-gray-500">
			<strong>Note:</strong> HTML format is best for web viewing, PDF for printing, Word for editing, and plain text for simple sharing.
		</div>
	</div>
</div>

<style>
	.card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
	}
	
	.btn-primary {
		background-color: #059669;
		color: white;
	}
	
	.btn-primary:hover {
		background-color: #047857;
	}
	
	.btn-primary:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
	
	.btn-secondary {
		background-color: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.btn-secondary:hover {
		background-color: #f9fafb;
	}
</style>