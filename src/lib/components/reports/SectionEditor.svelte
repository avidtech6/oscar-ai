<script lang="ts">
	import type { ReportSection } from '$lib/services/templateService';
	
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
				<div class="prose max-w-none" innerHTML={safeSectionContent}></div>
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