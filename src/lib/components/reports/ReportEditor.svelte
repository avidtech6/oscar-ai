<script lang="ts">
	import { groqApiKey } from '$lib/stores/settings';
	import { decompileReport, analyzeReportStructure } from '$lib/services/reportDecompilerService';
	
	export let generatedReport = '';
	export let selectedTemplate: any = null;
	export let selectedProject: any = undefined;
	
	export let enterSectionEditMode: () => void;
	export let copyToClipboard: () => void;
	export let downloadAsHtml: () => void;
	export let startOver: () => void;
	
	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});
	
	let aiProcessing = false;
	let aiAction = '';
	let aiPrompt = '';
	
	let decompilerProcessing = false;
	let decompilerResult: any = null;
	let showDecompilerResults = false;
	
	async function rewriteWithAI() {
		if (!generatedReport.trim() || !apiKey) return;
		
		aiProcessing = true;
		aiAction = 'Rewriting with AI...';
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Rewrite the provided report text to be more professional, clear, and suitable for a formal report. Maintain all technical details and data.'
						},
						{
							role: 'user',
							content: `Please rewrite this report to be more professional:\n\n${generatedReport}`
						}
					],
					temperature: 0.7,
					max_tokens: 4096
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to rewrite with AI');
			}
			
			const data = await response.json();
			generatedReport = data.choices[0].message.content;
		} catch (e) {
			console.error('AI rewrite failed:', e);
			alert('Failed to rewrite with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function improveSectionWithAI() {
		if (!generatedReport.trim() || !apiKey) return;
		
		const section = prompt('Which section would you like to improve? (e.g., "Introduction", "Methodology", "Results", "Conclusion")');
		if (!section) return;
		
		aiProcessing = true;
		aiAction = `Improving ${section} section...`;
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Improve the specified section of the report to be more detailed, professional, and comprehensive.'
						},
						{
							role: 'user',
							content: `Please improve the "${section}" section of this report:\n\n${generatedReport}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to improve section with AI');
			}
			
			const data = await response.json();
			generatedReport = data.choices[0].message.content;
		} catch (e) {
			console.error('AI section improvement failed:', e);
			alert('Failed to improve section with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function generateSectionWithAI() {
		if (!selectedTemplate || !apiKey) return;
		
		const section = prompt('What section would you like to generate? (e.g., "Executive Summary", "Recommendations", "Appendices")');
		if (!section) return;
		
		aiProcessing = true;
		aiAction = `Generating ${section} section...`;
		
		try {
			const context = selectedProject ?
				`Project: ${selectedProject.name}\nClient: ${selectedProject.client || 'Not specified'}\nLocation: ${selectedProject.location || 'Not specified'}` :
				'No project context available';
			
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: `You are an expert arboricultural report writer. Generate a professional ${section} section for a ${selectedTemplate?.name || 'arboricultural'} report.`
						},
						{
							role: 'user',
							content: `Generate a ${section} section for an arboricultural report with the following context:\n\n${context}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to generate section with AI');
			}
			
			const data = await response.json();
			const newSection = data.choices[0].message.content;
			
			// Append the new section to the report
			generatedReport += '\n\n' + newSection;
		} catch (e) {
			console.error('AI section generation failed:', e);
			alert('Failed to generate section with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function processAIPrompt() {
		if (!aiPrompt.trim() || !apiKey) return;
		
		aiProcessing = true;
		aiAction = 'Processing AI request...';
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Help the user modify their report based on their request.'
						},
						{
							role: 'user',
							content: `Current report:\n\n${generatedReport}\n\nUser request: ${aiPrompt}`
						}
					],
					temperature: 0.7,
					max_tokens: 4096
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to process AI request');
			}
			
			const data = await response.json();
			generatedReport = data.choices[0].message.content;
			aiPrompt = '';
		} catch (e) {
			console.error('AI prompt processing failed:', e);
			alert('Failed to process AI request. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function analyzeReportWithDecompiler() {
		if (!generatedReport.trim()) {
			alert('Please enter some report content first.');
			return;
		}
		
		decompilerProcessing = true;
		decompilerResult = null;
		showDecompilerResults = false;
		
		try {
			// First get quick analysis
			const analysis = await analyzeReportStructure(generatedReport);
			
			if (analysis) {
				decompilerResult = {
					analysis,
					fullDecompilation: null
				};
				showDecompilerResults = true;
				
				// Ask if user wants full decompilation
				const shouldDecompile = confirm(
					`Report Analysis Complete:\n\n` +
					`• ${analysis.sectionCount} sections detected\n` +
					`• ${analysis.headingCount} headings\n` +
					`• ${analysis.wordCount} words\n` +
					`• Confidence: ${Math.round(analysis.confidenceScore * 100)}%\n\n` +
					`Run full decompilation to see detailed section breakdown?`
				);
				
				if (shouldDecompile) {
					await runFullDecompilation();
				}
			} else {
				alert('Could not analyze report structure. The report may be too short or malformed.');
			}
		} catch (error) {
			console.error('Report analysis failed:', error);
			alert('Failed to analyze report. Please try again.');
		} finally {
			decompilerProcessing = false;
		}
	}
	
	async function runFullDecompilation() {
		if (!generatedReport.trim()) return;
		
		decompilerProcessing = true;
		
		try {
			const result = await decompileReport(generatedReport, 'text');
			
			if (result.success) {
				decompilerResult = {
					analysis: {
						sectionCount: result.data.sections.length,
						headingCount: result.data.sections.filter((s: any) => s.type === 'heading' || s.type === 'subheading').length,
						listCount: result.data.sections.filter((s: any) => s.type === 'list').length,
						tableCount: result.data.sections.filter((s: any) => s.type === 'table').length,
						appendixCount: result.data.sections.filter((s: any) => s.type === 'appendix').length,
						wordCount: result.data.metadata.wordCount || 0,
						detectedReportType: result.data.detectedReportType,
						confidenceScore: result.data.confidenceScore,
						hasMethodology: result.data.structureMap.hasMethodology,
						hasAppendices: result.data.structureMap.hasAppendices,
						hasLegalSections: result.data.structureMap.hasLegalSections
					},
					fullDecompilation: result.data
				};
				showDecompilerResults = true;
			} else {
				alert(`Decompilation failed: ${result.error}`);
			}
		} catch (error) {
			console.error('Full decompilation failed:', error);
			alert('Failed to decompile report. Please try again.');
		} finally {
			decompilerProcessing = false;
		}
	}
	
	function closeDecompilerResults() {
		showDecompilerResults = false;
		decompilerResult = null;
	}
</script>

<div class="card">
	<div class="p-4 border-b border-gray-200 flex items-center justify-between">
		<h2 class="text-lg font-semibold">Edit Report</h2>
		<div class="flex gap-2">
			<button
				on:click={enterSectionEditMode}
				class="btn btn-secondary text-sm"
			>
				Edit by Sections
			</button>
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
				Download HTML
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
		<!-- AI Tools Section -->
		<div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
			<h3 class="font-medium text-blue-900 mb-3">AI Report Tools</h3>
			<div class="flex flex-wrap gap-2 mb-4">
				<button
					on:click={rewriteWithAI}
					disabled={aiProcessing || !generatedReport.trim() || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction === 'Rewriting with AI...'}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Rewriting...
					{:else}
						Rewrite with AI
					{/if}
				</button>
				<button
					on:click={improveSectionWithAI}
					disabled={aiProcessing || !generatedReport.trim() || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction.includes('Improving')}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Improving...
					{:else}
						Improve Section
					{/if}
				</button>
				<button
					on:click={generateSectionWithAI}
					disabled={aiProcessing || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction.includes('Generating')}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Generating...
					{:else}
						Generate Section
					{/if}
				</button>
				<button
					on:click={analyzeReportWithDecompiler}
					disabled={decompilerProcessing || !generatedReport.trim()}
					class="btn btn-secondary text-sm"
				>
					{#if decompilerProcessing}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Analyzing...
					{:else}
						Analyze Structure
					{/if}
				</button>
			</div>
			
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={aiPrompt}
					placeholder="Ask AI to modify the report (e.g., 'Make it more concise', 'Add more technical details')"
					class="input flex-1 text-sm"
					on:keydown={(e) => e.key === 'Enter' && processAIPrompt()}
					disabled={aiProcessing || !apiKey}
				/>
				<button
					on:click={processAIPrompt}
					disabled={aiProcessing || !aiPrompt.trim() || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction === 'Processing AI request...'}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Processing
					{:else}
						Ask AI
					{/if}
				</button>
			</div>
			{#if !apiKey}
				<p class="text-xs text-red-600 mt-2">
					⚠️ API key required. Set your Groq API key in Settings.
				</p>
			{/if}
		</div>
		
		<!-- Decompiler Results -->
		{#if showDecompilerResults && decompilerResult}
			<div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-medium text-green-900">Report Structure Analysis</h3>
					<button
						on:click={closeDecompilerResults}
						class="text-green-700 hover:text-green-900"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{decompilerResult.analysis.sectionCount}</div>
						<div class="text-sm text-gray-600">Sections</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{decompilerResult.analysis.headingCount}</div>
						<div class="text-sm text-gray-600">Headings</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{decompilerResult.analysis.wordCount}</div>
						<div class="text-sm text-gray-600">Words</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{Math.round(decompilerResult.analysis.confidenceScore * 100)}%</div>
						<div class="text-sm text-gray-600">Confidence</div>
					</div>
				</div>
				
				{#if decompilerResult.fullDecompilation}
					<div class="mt-4">
						<h4 class="font-medium text-green-800 mb-2">Detailed Sections</h4>
						<div class="space-y-2 max-h-60 overflow-y-auto">
							{#each decompilerResult.fullDecompilation.sections as section}
								<div class="bg-white p-3 rounded border border-green-100">
									<div class="flex justify-between items-start">
										<div>
											<div class="font-medium text-gray-900">{section.title || 'Untitled'}</div>
											<div class="text-xs text-gray-500">
												Type: {section.type} • Level: {section.level} • Words: {section.metadata?.wordCount || 0}
											</div>
										</div>
										<span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
											{section.type}
										</span>
									</div>
									{#if section.content && section.content.length > 0}
										<div class="mt-2 text-sm text-gray-700 truncate">
											{section.content.substring(0, 100)}{section.content.length > 100 ? '...' : ''}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="mt-4">
						<p class="text-sm text-green-700 mb-3">
							Analysis complete. Run full decompilation for detailed section breakdown.
						</p>
						<button
							on:click={runFullDecompilation}
							disabled={decompilerProcessing}
							class="btn btn-secondary text-sm"
						>
							{#if decompilerProcessing}
								<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
								</svg>
								Decompiling...
							{:else}
								Run Full Decompilation
							{/if}
						</button>
					</div>
				{/if}
				
				{#if decompilerResult.analysis.detectedReportType}
					<div class="mt-4 p-3 bg-green-100 rounded">
						<div class="text-sm font-medium text-green-800">Detected Report Type:</div>
						<div class="text-green-900">{decompilerResult.analysis.detectedReportType}</div>
					</div>
				{/if}
			</div>
		{/if}
		
		<div class="mb-4">
			<textarea
				bind:value={generatedReport}
				rows="20"
				class="input w-full font-mono text-sm"
				placeholder="Edit your report HTML here..."
			></textarea>
		</div>
		
		<div class="flex gap-4">
			<button
				on:click={downloadAsHtml}
				class="btn btn-primary"
			>
				Save & Download
			</button>
			<button
				on:click={startOver}
				class="btn btn-secondary"
			>
				Discard Changes
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
	
	.input {
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		width: 100%;
	}
	
	.input:focus {
		outline: none;
		box-shadow: 0 0 0 2px #059669;
		border-color: #059669;
	}
</style>