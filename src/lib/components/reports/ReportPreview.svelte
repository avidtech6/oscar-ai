<script lang="ts">
	import { quickComplianceCheck, validateReportCompliance } from '$lib/services/complianceValidatorService';
	import { analyzeRenderingQuality, quickRenderPreview } from '$lib/services/visualRenderingService';
	import { renderReport, convertTemplateDataToReportData, type ReportData } from '$lib/reportTemplate/renderReport';
	import { prepareTemplateData, type Template } from '$lib/services/templateService';
	import type { Project } from '$lib/db';
	
	export let selectedTemplate: Template | null = null;
	export let selectedProject: Project | undefined = undefined;
	export let generatedReport = '';
	export let safeGeneratedReport = '';
	export let copyToClipboard = () => {};
	export let downloadAsHtml = () => {};
	export let downloadAsPdf = () => {};
	export let downloadAsWord = () => {};
	export let downloadAsPlainText = () => {};
	export let downloadAsPrintTemplate = () => {};
	export let startOver = () => {};
	
	// Compliance validation state
	let complianceProcessing = false;
	let complianceResult: any = null;
	let showComplianceResults = false;
	let complianceIssues: any[] = [];
	
	// Visual rendering analysis state
	let renderingAnalyzing = false;
	let renderingAnalysisResult: any = null;
	let showRenderingAnalysis = false;
	let renderPreview: any = null;
	
	// Print template preview state
	let previewTab: 'original' | 'print' = 'original';
	let printPreviewHtml = '';
	let printPreviewLoading = false;
	let printPreviewError = '';
	
	// Function to generate print preview
	async function generatePrintPreview() {
		if (!selectedTemplate || !generatedReport) return;
		
		printPreviewLoading = true;
		printPreviewError = '';
		printPreviewHtml = '';
		
		try {
			// First, try to get project data
			let reportData: ReportData;
			
			if (selectedProject?.id) {
				// We have a project, prepare template data
				const templateData = await prepareTemplateData(selectedProject.id);
				
				// Convert to report data format
				reportData = convertTemplateDataToReportData(
					templateData,
					`report-${Date.now()}`,
					{} // No sections from decompiler for now
				);
			} else {
				// No project, create generic report data
				reportData = {
					id: `report-${Date.now()}`,
					title: selectedTemplate?.name || 'Arboricultural Report',
					subtitle: 'Professional Assessment and Recommendations',
					date: new Date().toLocaleDateString('en-GB'),
					project: {
						id: '',
						name: 'Generic Report',
						client: 'Not specified',
						location: 'Not specified'
					},
					sections: {},
					trees: [],
					notes: [],
					generatedDate: new Date().toLocaleDateString('en-GB')
				};
			}
			
			// Render the report using our new template
			const rendered = await renderReport(reportData);
			printPreviewHtml = rendered;
			
		} catch (error) {
			console.error('Failed to generate print preview:', error);
			printPreviewError = error instanceof Error ? error.message : 'Unknown error generating print preview';
			
			// Fallback: use the original report with print styling
			printPreviewHtml = generatedReport.replace(
				'<head>',
				`<head>
				<style>
					@media print {
						@page {
							size: A4 portrait;
							margin: 20mm;
						}
						body {
							font-family: 'Times New Roman', serif;
							font-size: 12pt;
							line-height: 1.5;
						}
						h1, h2, h3 {
							page-break-after: avoid;
						}
						table {
							page-break-inside: avoid;
						}
					}
				</style>`
			);
		} finally {
			printPreviewLoading = false;
		}
	}
	
	// Generate print preview when tab is selected
	$: if (previewTab === 'print' && !printPreviewHtml && !printPreviewLoading) {
		generatePrintPreview();
	}
	
	async function checkReportCompliance() {
		if (!generatedReport.trim()) {
			alert('No report content to validate.');
			return;
		}
		
		complianceProcessing = true;
		complianceResult = null;
		showComplianceResults = false;
		complianceIssues = [];
		
		try {
			// First do a quick check
			const quickCheck = await quickComplianceCheck(generatedReport);
			complianceResult = quickCheck;
			showComplianceResults = true;
			
			// Then do full validation in background
			setTimeout(async () => {
				try {
					const fullValidation = await validateReportCompliance(
						generatedReport,
						selectedTemplate?.id
					);
					
					if (fullValidation.success && fullValidation.data) {
						complianceResult = {
							...quickCheck,
							fullValidation: fullValidation.data
						};
						complianceIssues = fullValidation.data.issues || [];
					}
				} catch (error) {
					console.error('Full compliance validation failed:', error);
				}
			}, 100);
			
		} catch (error) {
			console.error('Compliance check failed:', error);
			alert('Failed to check compliance. Please try again.');
		} finally {
			complianceProcessing = false;
		}
	}
	
	function closeComplianceResults() {
		showComplianceResults = false;
		complianceResult = null;
		complianceIssues = [];
	}
	
	async function analyzeRenderingQualityAction() {
		if (!generatedReport.trim()) {
			alert('No report content to analyze.');
			return;
		}
		
		renderingAnalyzing = true;
		renderingAnalysisResult = null;
		showRenderingAnalysis = false;
		renderPreview = null;
		
		try {
			// First get a quick preview
			const preview = await quickRenderPreview(generatedReport);
			renderPreview = preview;
			
			// Then do full analysis
			const analysis = await analyzeRenderingQuality(generatedReport);
			
			if (analysis.success) {
				renderingAnalysisResult = analysis;
				showRenderingAnalysis = true;
			} else {
				console.error('Rendering analysis failed:', analysis.error);
				alert('Rendering analysis failed. Please try again.');
			}
		} catch (error) {
			console.error('Rendering analysis error:', error);
			alert('Error during rendering analysis.');
		} finally {
			renderingAnalyzing = false;
		}
	}
	
	function closeRenderingAnalysis() {
		showRenderingAnalysis = false;
		renderingAnalysisResult = null;
		renderPreview = null;
	}
</script>

<div class="max-w-6xl mx-auto">
	<div class="card p-6 mb-6">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-2xl font-bold text-gray-900">Generated Report</h2>
				<p class="text-gray-600">
					{selectedTemplate?.name || 'Report'} - {selectedProject?.name || 'Generic Report'}
				</p>
			</div>
			<div class="flex gap-2">
				<button
					on:click={checkReportCompliance}
					disabled={complianceProcessing || !generatedReport.trim()}
					class="btn btn-secondary text-sm"
				>
					{#if complianceProcessing}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Checking...
					{:else}
						Check Compliance
					{/if}
				</button>
				<button
					on:click={analyzeRenderingQualityAction}
					disabled={renderingAnalyzing || !generatedReport.trim()}
					class="btn btn-secondary text-sm"
				>
					{#if renderingAnalyzing}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Analyzing...
					{:else}
						Analyze Rendering
					{/if}
				</button>
				<button
					on:click={copyToClipboard}
					class="btn btn-secondary text-sm"
				>
					Copy HTML
				</button>
				<button
					on:click={startOver}
					class="btn btn-secondary text-sm"
				>
					New Report
				</button>
			</div>
		</div>
		
		<div class="mb-6">
			<p class="text-gray-700 mb-4">
				Report generated successfully. Export in multiple formats or check compliance with industry standards.
			</p>
			
			<div class="flex flex-wrap gap-2 mb-6">
				<button
					on:click={downloadAsHtml}
					class="btn btn-primary text-sm"
				>
					Download HTML
				</button>
				<button
					on:click={downloadAsPrintTemplate}
					class="btn btn-primary text-sm"
				>
					Download Print Template
				</button>
				<button
					on:click={downloadAsPdf}
					class="btn btn-primary text-sm"
				>
					Download PDF
				</button>
				<button
					on:click={downloadAsWord}
					class="btn btn-primary text-sm"
				>
					Download Word
				</button>
				<button
					on:click={downloadAsPlainText}
					class="btn btn-primary text-sm"
				>
					Download Text
				</button>
			</div>
		</div>
		
		<!-- Compliance Results -->
		{#if showComplianceResults && complianceResult}
			<div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-medium text-red-900">Compliance Check</h3>
					<button
						on:click={closeComplianceResults}
						class="text-red-700 hover:text-red-900"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-red-700">{complianceResult.score}%</div>
						<div class="text-sm text-gray-600">Compliance Score</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-red-700">{complianceResult.issues}</div>
						<div class="text-sm text-gray-600">Total Issues</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-red-700">{complianceResult.critical}</div>
						<div class="text-sm text-gray-600">Critical Issues</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-red-700">{complianceResult.warnings}</div>
						<div class="text-sm text-gray-600">Warnings</div>
					</div>
				</div>
				
				{#if complianceResult.score < 80}
					<div class="mt-4 p-3 bg-red-100 rounded">
						<div class="flex items-center gap-2 mb-2">
							<svg class="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
							<div class="font-medium text-red-800">Compliance Issues Detected</div>
						</div>
						<p class="text-sm text-red-700">
							This report may not meet industry compliance standards. Review the issues below.
						</p>
					</div>
				{:else}
					<div class="mt-4 p-3 bg-green-100 rounded">
						<div class="flex items-center gap-2 mb-2">
							<svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div class="font-medium text-green-800">Good Compliance</div>
						</div>
						<p class="text-sm text-green-700">
							This report meets basic compliance standards. No critical issues found.
						</p>
					</div>
				{/if}
				
				{#if complianceIssues.length > 0}
					<div class="mt-4">
						<h4 class="font-medium text-red-800 mb-2">Issues to Address</h4>
						<div class="space-y-3">
							{#each complianceIssues as issue}
								<div class="bg-white p-3 rounded border border-red-100">
									<div class="flex items-start gap-3">
										<div class="flex-shrink-0">
											{#if issue.severity === 'critical'}
												<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
													Critical
												</span>
											{:else if issue.severity === 'warning'}
												<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
													Warning
												</span>
											{:else}
												<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
													Info
												</span>
											{/if}
										</div>
										<div class="flex-1">
											<div class="font-medium text-gray-900">{issue.description}</div>
											<div class="text-sm text-gray-600 mt-1">{issue.suggestion}</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
				
				{#if complianceResult.markers && complianceResult.markers.length > 0}
					<div class="mt-4">
						<h4 class="font-medium text-gray-800 mb-2">Found Compliance Markers</h4>
						<div class="flex flex-wrap gap-2">
							{#each complianceResult.markers as marker}
								<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
									<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									{marker.standard}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
		
		<!-- Rendering Analysis Results -->
		{#if showRenderingAnalysis && renderingAnalysisResult}
			<div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-medium text-blue-900">Rendering Quality Analysis</h3>
					<button
						on:click={closeRenderingAnalysis}
						class="text-blue-700 hover:text-blue-900"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-blue-700">{renderingAnalysisResult.score || 0}%</div>
						<div class="text-sm text-gray-600">Quality Score</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-blue-700">{renderPreview?.estimatedPages || 1}</div>
						<div class="text-sm text-gray-600">Estimated Pages</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-blue-700">{renderPreview?.renderTime || 0}ms</div>
						<div class="text-sm text-gray-600">Render Time</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-blue-700">
							{#if renderPreview?.compatibility?.print === 'excellent'}
								✓
							{:else if renderPreview?.compatibility?.print === 'good'}
								~
							{:else}
								⚠
							{/if}
						</div>
						<div class="text-sm text-gray-600">Print Ready</div>
					</div>
				</div>
				
				{#if renderingAnalysisResult.issues && renderingAnalysisResult.issues.length > 0}
					<div class="mt-4">
						<h4 class="font-medium text-blue-800 mb-2">Rendering Issues</h4>
						<div class="space-y-3">
							{#each renderingAnalysisResult.issues as issue}
								<div class="bg-white p-3 rounded border border-blue-100">
									<div class="flex items-start gap-3">
										<div class="flex-shrink-0">
											{#if issue.severity === 'high'}
												<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
													High
												</span>
											{:else if issue.severity === 'medium'}
												<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
													Medium
												</span>
											{:else}
												<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
													Low
												</span>
											{/if}
										</div>
										<div class="flex-1">
											<div class="font-medium text-gray-900">{issue.description}</div>
											<div class="text-sm text-gray-600 mt-1">{issue.suggestion}</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
				
				{#if renderingAnalysisResult.recommendations && renderingAnalysisResult.recommendations.length > 0}
					<div class="mt-4">
						<h4 class="font-medium text-blue-800 mb-2">Recommendations</h4>
						<ul class="list-disc pl-5 text-blue-700 text-sm space-y-1">
							{#each renderingAnalysisResult.recommendations as rec}
								<li>{rec}</li>
							{/each}
						</ul>
					</div>
				{/if}
				
				{#if renderPreview?.compatibility}
					<div class="mt-4">
						<h4 class="font-medium text-blue-800 mb-2">Compatibility</h4>
						<div class="grid grid-cols-3 gap-3 text-sm">
							<div class="bg-white p-2 rounded border text-center">
								<div class="font-medium">Print</div>
								<div class="text-blue-700">{renderPreview.compatibility.print || 'unknown'}</div>
							</div>
							<div class="bg-white p-2 rounded border text-center">
								<div class="font-medium">Screen</div>
								<div class="text-blue-700">{renderPreview.compatibility.screen || 'unknown'}</div>
							</div>
							<div class="bg-white p-2 rounded border text-center">
								<div class="font-medium">Mobile</div>
								<div class="text-blue-700">{renderPreview.compatibility.mobile || 'unknown'}</div>
							</div>
						</div>
					</div>
				{/if}
				
				<div class="mt-4 text-xs text-blue-600">
					Analysis powered by Visual Rendering Engine (Phase 15)
				</div>
			</div>
		{/if}
		
		<!-- Report Preview Tabs -->
		<div class="mb-6">
			<div class="flex items-center justify-between mb-3">
				<h3 class="font-medium text-gray-900">Report Preview</h3>
				<div class="flex border rounded-lg overflow-hidden">
					<button
						class={`px-4 py-2 text-sm font-medium ${previewTab === 'original' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
						on:click={() => previewTab = 'original'}
					>
						Original
					</button>
					<button
						class={`px-4 py-2 text-sm font-medium ${previewTab === 'print' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
						on:click={() => previewTab = 'print'}
					>
						Print Design
					</button>
				</div>
			</div>
			
			{#if previewTab === 'original'}
				<div class="border rounded-lg overflow-hidden">
					<iframe
						srcdoc={safeGeneratedReport}
						class="w-full h-[500px] border-0"
						title="Original Report Preview"
					></iframe>
				</div>
				<p class="text-sm text-gray-500 mt-2">
					Preview of the generated HTML report. Use the download buttons above to export.
				</p>
			{:else if previewTab === 'print'}
				<div class="border rounded-lg overflow-hidden">
					{#if printPreviewLoading}
						<div class="flex items-center justify-center h-[500px] bg-gray-50">
							<div class="text-center">
								<svg class="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
								</svg>
								<p class="text-gray-600">Generating print preview...</p>
							</div>
						</div>
					{:else if printPreviewError}
						<div class="p-6 bg-red-50 border border-red-200 rounded-lg">
							<div class="flex items-center gap-3 mb-3">
								<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
								<h4 class="font-medium text-red-800">Failed to generate print preview</h4>
							</div>
							<p class="text-sm text-red-700 mb-3">{printPreviewError}</p>
							<button
								on:click={generatePrintPreview}
								class="btn btn-secondary text-sm"
							>
								Try Again
							</button>
						</div>
					{:else}
						<iframe
							srcdoc={printPreviewHtml}
							class="w-full h-[500px] border-0"
							title="Print Design Preview"
						></iframe>
					{/if}
				</div>
				<p class="text-sm text-gray-500 mt-2">
					Print-optimized A4 layout with professional styling. This version is optimized for PDF export and printing.
				</p>
				
				{#if printPreviewHtml && !printPreviewLoading && !printPreviewError}
					<div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<h4 class="font-medium text-blue-800 mb-2">Print Design Features</h4>
						<ul class="list-disc pl-5 text-blue-700 text-sm space-y-1">
							<li>A4 page dimensions (794px × 1123px)</li>
							<li>Print-specific CSS with @page rules</li>
							<li>Professional header with company branding</li>
							<li>Structured sections with numbered headings</li>
							<li>Page break controls for multi-page reports</li>
							<li>Optimized tables and lists for printing</li>
						</ul>
					</div>
				{/if}
			{/if}
		</div>
		
		<div class="flex gap-4">
			<button
				on:click={startOver}
				class="btn btn-secondary"
			>
				Start New Report
			</button>
			<button
				on:click={copyToClipboard}
				class="btn btn-primary"
			>
				Copy HTML to Clipboard
			</button>
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
