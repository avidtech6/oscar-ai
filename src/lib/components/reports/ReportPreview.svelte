<script lang="ts">
	import { onMount } from 'svelte';
	import type { Template, TemplateData } from '$lib/services/templateService';
	import type { Project } from '$lib/db';
	import { TemplateServiceIntegration } from '../../../report-intelligence/visual-rendering/integration/TemplateServiceIntegration';

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

	// Phase 15 integration
	let templateServiceIntegration: TemplateServiceIntegration | null = null;
	let enhancedPreviewAvailable = false;
	let enhancedPreviewLoading = false;
	let enhancedPreviewError = '';
	let enhancedHtml = '';
	let enhancedCss = '';
	let enhancedSnapshotUrl = '';
	let enhancedPdfUrl = '';
	let showEnhancedPreview = false;

	onMount(async () => {
		// Initialize Phase 15 integration
		try {
			templateServiceIntegration = new TemplateServiceIntegration();
			await templateServiceIntegration.initialize();
			enhancedPreviewAvailable = true;
		} catch (error) {
			console.warn('Phase 15 integration not available:', error);
			enhancedPreviewAvailable = false;
		}
	});

	// Generate enhanced preview using Phase 15 rendering engine
	async function generateEnhancedPreview() {
		if (!templateServiceIntegration || !selectedTemplate || !selectedProject) {
			return;
		}

		enhancedPreviewLoading = true;
		enhancedPreviewError = '';

		try {
			// Prepare template data (simplified for now)
			const templateData: TemplateData = {
				project: {
					...selectedProject,
					siteAddress: selectedProject.location || 'Not specified',
					reference: `PROJ-${selectedProject.id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}`
				},
				trees: [],
				notes: [],
				survey: {
					date: new Date().toLocaleDateString('en-GB'),
					surveyor: 'Surveyor Name',
					qualification: 'Arboricultural Consultant'
				},
				company: {
					name: 'Oscar AI Arboricultural Services',
					address: '123 Tree Street, Forest City, FC1 2TR',
					phone: '+44 1234 567890',
					email: 'reports@oscar-ai.app'
				},
				recommendations: {
					retainedTrees: [],
					removedTrees: [],
					management: []
				}
			};

			// Generate enhanced preview
			const result = await templateServiceIntegration.getTemplatePreview(
				selectedTemplate.id,
				templateData
			);

			enhancedHtml = result.html;
			enhancedCss = result.css;
			enhancedSnapshotUrl = result.snapshotUrl || '';
			showEnhancedPreview = true;

		} catch (error) {
			enhancedPreviewError = `Failed to generate enhanced preview: ${error}`;
			console.error('Enhanced preview error:', error);
		} finally {
			enhancedPreviewLoading = false;
		}
	}

	// Download enhanced PDF
	async function downloadEnhancedPdf() {
		if (!templateServiceIntegration || !selectedTemplate || !selectedProject) {
			return;
		}

		try {
			// Prepare template data (simplified for now)
			const templateData: TemplateData = {
				project: {
					...selectedProject,
					siteAddress: selectedProject.location || 'Not specified',
					reference: `PROJ-${selectedProject.id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}`
				},
				trees: [],
				notes: [],
				survey: {
					date: new Date().toLocaleDateString('en-GB'),
					surveyor: 'Surveyor Name',
					qualification: 'Arboricultural Consultant'
				},
				company: {
					name: 'Oscar AI Arboricultural Services',
					address: '123 Tree Street, Forest City, FC1 2TR',
					phone: '+44 1234 567890',
					email: 'reports@oscar-ai.app'
				},
				recommendations: {
					retainedTrees: [],
					removedTrees: [],
					management: []
				}
			};

			const result = await templateServiceIntegration.exportTemplateToPDF(
				selectedTemplate.id,
				templateData
			);

			// Download the PDF
			const a = document.createElement('a');
			a.href = result.url;
			a.download = result.filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

		} catch (error) {
			alert(`Failed to generate enhanced PDF: ${error}`);
			console.error('Enhanced PDF export error:', error);
		}
	}

	// Toggle between original and enhanced preview
	function toggleEnhancedPreview() {
		if (!showEnhancedPreview && enhancedPreviewAvailable) {
			generateEnhancedPreview();
		} else {
			showEnhancedPreview = false;
		}
	}
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
		
		<!-- Phase 15 Enhanced Preview Toggle -->
		{#if enhancedPreviewAvailable}
			<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="font-medium text-blue-800">Phase 15: Enhanced Rendering Available</h3>
						<p class="text-sm text-blue-700">Use the new HTML Rendering & Visual Reproduction Engine for better layout and PDF quality.</p>
					</div>
					<button
						on:click={toggleEnhancedPreview}
						class="btn btn-primary text-sm"
						disabled={enhancedPreviewLoading}
					>
						{#if enhancedPreviewLoading}
							Loading...
						{:else if showEnhancedPreview}
							Show Original Preview
						{:else}
							Show Enhanced Preview
						{/if}
					</button>
				</div>
				{#if enhancedPreviewError}
					<div class="mt-2 text-sm text-red-600">{enhancedPreviewError}</div>
				{/if}
			</div>
		{/if}
		
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
			{#if enhancedPreviewAvailable}
				<button
					on:click={downloadEnhancedPdf}
					class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-green-50 border-green-200"
				>
					<div class="text-2xl mb-2">🚀</div>
					<div class="font-medium">Enhanced PDF</div>
					<div class="text-xs text-gray-500">Phase 15 Engine</div>
				</button>
			{:else}
				<button
					on:click={downloadAsWord}
					class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
				>
					<div class="text-2xl mb-2">📝</div>
					<div class="font-medium">Word</div>
					<div class="text-xs text-gray-500">Editable</div>
				</button>
			{/if}
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
			<div class="bg-gray-100 px-4 py-2 border-b text-sm font-medium flex justify-between items-center">
				<div>
					Report Preview
					{#if showEnhancedPreview}
						<span class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Phase 15 Enhanced</span>
					{/if}
				</div>
				{#if enhancedSnapshotUrl && showEnhancedPreview}
					<a
						href={enhancedSnapshotUrl}
						target="_blank"
						class="text-xs text-blue-600 hover:text-blue-800"
					>
						View Snapshot
					</a>
				{/if}
			</div>
			<div class="p-4 max-h-[600px] overflow-auto">
				{#if showEnhancedPreview && enhancedHtml}
					<!-- Enhanced Preview with Phase 15 -->
					<iframe
						srcdoc={`<!DOCTYPE html><html><head><style>${enhancedCss}</style></head><body>${enhancedHtml}</body></html>`}
						class="w-full h-[500px] border-0"
						title="Enhanced Report Preview"
					></iframe>
				{:else if generatedReport.includes('<!DOCTYPE html>') || generatedReport.includes('<html>')}
					<!-- Original Preview -->
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
			{#if enhancedPreviewAvailable}
				<br>
				<strong>Phase 15 Enhanced:</strong> Uses advanced layout engine for better typography, page breaks, and PDF quality.
			{/if}
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