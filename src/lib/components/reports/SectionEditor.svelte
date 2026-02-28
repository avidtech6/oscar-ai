<script lang="ts">
	import type { ReportSection } from '$lib/services/templateService';
	import { analyzeSectionCompleteness, validateSection } from '$lib/services/schemaMapperService';
	
	export let sections: ReportSection[] = [];
	export let currentSectionIndex = 0;
	export let safeSectionContent = '';
	
	export let previousSection: () => void;
	export let nextSection: () => void;
	export let updateCurrentSection: () => void;
	export let saveAndExitSectionEdit: () => void;
	export let cancelSectionEdit: () => void;
	
	// Reactive property for the current section content
	$: currentSectionContent = sections[currentSectionIndex]?.content || '';
	
	// Update the section content when currentSectionContent changes
	$: updateSectionContent();
	
	function updateSectionContent() {
		if (sections[currentSectionIndex]) {
			sections[currentSectionIndex].content = currentSectionContent;
		}
	}
	
	// Schema mapping state
	let schemaMappingProcessing = false;
	let schemaMappingResult: any = null;
	let showSchemaMappingResults = false;
	let currentSectionValidation: any = null;
	
	async function analyzeSectionCompletenessWithSchema() {
		if (sections.length === 0) {
			alert('No sections to analyze.');
			return;
		}
		
		schemaMappingProcessing = true;
		schemaMappingResult = null;
		showSchemaMappingResults = false;
		
		try {
			// Convert sections to format expected by schema mapper
			const sectionData = sections.map((section, index) => ({
				id: section.id || `section-${index}`,
				title: section.title,
				content: section.content,
				type: 'section'
			}));
			
			const result = await analyzeSectionCompleteness(sectionData);
			
			if (result) {
				schemaMappingResult = result;
				showSchemaMappingResults = true;
			} else {
				alert('Could not analyze section completeness.');
			}
		} catch (error) {
			console.error('Section completeness analysis failed:', error);
			alert('Failed to analyze sections. Please try again.');
		} finally {
			schemaMappingProcessing = false;
		}
	}
	
	async function validateCurrentSection() {
		const currentSection = sections[currentSectionIndex];
		if (!currentSection) return;
		
		try {
			const validation = await validateSection(
				{ title: currentSection.title, content: currentSection.content },
				'bs5837' // Default report type
			);
			
			currentSectionValidation = validation;
			
			if (!validation.isValid) {
				alert(`Section validation issues:\n\n${validation.suggestions.join('\n')}`);
			} else {
				alert('Section validation passed with high confidence!');
			}
		} catch (error) {
			console.error('Section validation failed:', error);
			alert('Failed to validate section.');
		}
	}
	
	function closeSchemaMappingResults() {
		showSchemaMappingResults = false;
		schemaMappingResult = null;
	}
</script>

<div class="card">
	<div class="p-4 border-b border-gray-200 flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold">Edit Report Sections</h2>
			<p class="text-sm text-gray-500">
				Section {currentSectionIndex + 1} of {sections.length}: {sections[currentSectionIndex]?.title || 'Untitled'}
			</p>
		</div>
		<div class="flex gap-2">
			<button
				on:click={saveAndExitSectionEdit}
				class="btn btn-primary text-sm"
			>
				Save & Exit
			</button>
			<button
				on:click={cancelSectionEdit}
				class="btn btn-secondary text-sm"
			>
				Cancel
			</button>
		</div>
	</div>
	
	<div class="p-6">
		<!-- Section Navigation -->
		<div class="mb-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-medium">Sections</h3>
				<div class="flex gap-2">
					<button
						on:click={analyzeSectionCompletenessWithSchema}
						disabled={schemaMappingProcessing || sections.length === 0}
						class="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if schemaMappingProcessing}
							<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Analyzing...
						{:else}
							Analyze Schema
						{/if}
					</button>
					<button
						on:click={validateCurrentSection}
						disabled={!sections[currentSectionIndex]}
						class="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Validate Section
					</button>
					<button
						on:click={previousSection}
						disabled={currentSectionIndex === 0}
						class="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
					>
						← Previous
					</button>
					<button
						on:click={nextSection}
						disabled={currentSectionIndex === sections.length - 1}
						class="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next →
					</button>
				</div>
			</div>
			
			<div class="flex flex-wrap gap-2">
				{#each sections as section, index}
					<button
						on:click={() => currentSectionIndex = index}
						class="px-3 py-2 text-sm border rounded-lg transition-colors"
						class:bg-blue-50={currentSectionIndex === index}
						class:border-blue-300={currentSectionIndex === index}
						class:text-blue-700={currentSectionIndex === index}
						class:border-gray-200={currentSectionIndex !== index}
					>
						{section.title}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Schema Mapping Results -->
		{#if showSchemaMappingResults && schemaMappingResult}
			<div class="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-medium text-purple-900">Schema Analysis</h3>
					<button
						on:click={closeSchemaMappingResults}
						class="text-purple-700 hover:text-purple-900"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-purple-700">{schemaMappingResult.mappedCount}</div>
						<div class="text-sm text-gray-600">Mapped Sections</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-purple-700">{schemaMappingResult.missingCount}</div>
						<div class="text-sm text-gray-600">Missing Required</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-purple-700">{schemaMappingResult.extraCount}</div>
						<div class="text-sm text-gray-600">Extra Sections</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-purple-700">{Math.round(schemaMappingResult.completeness)}%</div>
						<div class="text-sm text-gray-600">Completeness</div>
					</div>
				</div>
				
				{#if schemaMappingResult.missingCount > 0}
					<div class="mt-4">
						<h4 class="font-medium text-purple-800 mb-2">Missing Required Sections</h4>
						<ul class="space-y-2">
							{#each schemaMappingResult.gaps as gap}
								{#if gap.type === 'missing_section'}
									<li class="bg-white p-3 rounded border border-purple-100">
										<div class="font-medium text-gray-900">{gap.data?.missingSections?.[0] || 'Unknown section'}</div>
										<div class="text-sm text-gray-600 mt-1">{gap.description}</div>
										<div class="text-xs text-purple-700 mt-2">{gap.suggestedFix}</div>
									</li>
								{/if}
							{/each}
						</ul>
					</div>
				{/if}
				
				{#if schemaMappingResult.reportType && schemaMappingResult.reportType !== 'Unknown'}
					<div class="mt-4 p-3 bg-purple-100 rounded">
						<div class="text-sm font-medium text-purple-800">Detected Report Type:</div>
						<div class="text-purple-900">{schemaMappingResult.reportType}</div>
					</div>
				{/if}
				
				<div class="mt-4 text-sm text-purple-700">
					Confidence: {Math.round(schemaMappingResult.confidence * 100)}% •
					Coverage: {Math.round(schemaMappingResult.coverage)}% •
					Report schema analysis complete.
				</div>
			</div>
		{/if}
		
		<!-- Current Section Validation -->
		{#if currentSectionValidation}
			<div class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<div class="flex items-center justify-between mb-2">
					<h4 class="font-medium text-yellow-900">Section Validation</h4>
					<button
						on:click={() => currentSectionValidation = null}
						class="text-yellow-700 hover:text-yellow-900"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				<div class="flex items-center gap-3 mb-3">
					<div class="text-lg font-bold text-yellow-700">
						{currentSectionValidation.isValid ? '✓ Valid' : '⚠ Needs Improvement'}
					</div>
					<div class="text-sm text-yellow-600">
						Confidence: {Math.round(currentSectionValidation.confidence * 100)}%
					</div>
				</div>
				
				{#if currentSectionValidation.suggestions.length > 0}
					<div class="space-y-2">
						<div class="text-sm font-medium text-yellow-800">Suggestions:</div>
						<ul class="space-y-1">
							{#each currentSectionValidation.suggestions as suggestion}
								<li class="text-sm text-yellow-700 flex items-start gap-2">
									<svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>{suggestion}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
		
		<!-- Section Editor -->
		<div class="mb-6">
			<h3 class="font-medium mb-3">Editing: {sections[currentSectionIndex]?.title || 'Untitled'}</h3>
			<textarea
				bind:value={currentSectionContent}
				rows="15"
				class="input w-full font-mono text-sm"
				placeholder="Edit section content..."
			></textarea>
			<div class="mt-2 text-sm text-gray-500">
				This section contains HTML. You can edit the content directly.
			</div>
		</div>
		
		<!-- Section Preview -->
		<div class="mb-6">
			<h3 class="font-medium mb-3">Section Preview</h3>
			<div class="border rounded-lg p-4 bg-gray-50 max-h-[300px] overflow-auto">
				<div class="section-title font-medium text-lg mb-3">{sections[currentSectionIndex]?.title || 'Untitled'}</div>
				<div class="prose max-w-none">{@html safeSectionContent}</div>
			</div>
		</div>
		
		<div class="flex gap-4">
			<button
				on:click={updateCurrentSection}
				class="btn btn-primary"
			>
				Save Section
			</button>
			<button
				on:click={nextSection}
				disabled={currentSectionIndex === sections.length - 1}
				class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Next Section →
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