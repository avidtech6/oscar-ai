<script lang="ts">
	import type { Project } from '$lib/db';

	export let project: Project | undefined;
	export let projectReviewStatus: { needsReview: boolean; issueCount: number; priority: 'high' | 'medium' | 'low' } | null = null;
	export let treesCount: number = 0;
	export let notesCount: number = 0;
	export let photosCount: number = 0;
	export let voiceNotesCount: number = 0;

	// Events
	export let onBack: () => void = () => {};
	export let onSave: () => void = () => {};
	export let onToggleAIReview: () => void = () => {};
	export let onAddTree: () => void = () => {};
	export let onAddNote: () => void = () => {};
	export let onAddPhoto: () => void = () => {};
	export let onAddVoiceNote: () => void = () => {};

	function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
		switch (priority) {
			case 'high': return 'bg-red-100 text-red-800 border-red-200';
			case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}

	function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
		switch (priority) {
			case 'high': return 'High Priority';
			case 'medium': return 'Medium Priority';
			case 'low': return 'Low Priority';
			default: return 'Needs Review';
		}
	}

	function getStatusBadge() {
		if (!projectReviewStatus) return 'draft';
		if (projectReviewStatus.needsReview) {
			return projectReviewStatus.priority === 'high' ? 'needs-review-high' : 
				   projectReviewStatus.priority === 'medium' ? 'needs-review-medium' : 'needs-review-low';
		}
		return 'ready';
	}

	function getStatusText() {
		const status = getStatusBadge();
		switch (status) {
			case 'ready': return 'Ready';
			case 'needs-review-high': return 'Needs Review (High)';
			case 'needs-review-medium': return 'Needs Review (Medium)';
			case 'needs-review-low': return 'Needs Review (Low)';
			default: return 'Draft';
		}
	}

	function getStatusColor() {
		const status = getStatusBadge();
		switch (status) {
			case 'ready': return 'bg-green-100 text-green-800';
			case 'needs-review-high': return 'bg-red-100 text-red-800';
			case 'needs-review-medium': return 'bg-yellow-100 text-yellow-800';
			case 'needs-review-low': return 'bg-blue-100 text-blue-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="mb-8">
	<!-- Back button and project info -->
	<div class="mb-6">
		<button
			on:click={onBack}
			class="text-sm text-forest-600 hover:underline mb-4 inline-flex items-center"
		>
			<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
			</svg>
			Back to Workspace
		</button>

		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<div class="flex items-center gap-3 mb-2">
					<h1 class="text-2xl font-bold text-gray-900">{project?.name || 'Loading...'}</h1>
					<span class="px-3 py-1 text-sm font-medium rounded-full {getStatusColor()}">
						{getStatusText()}
					</span>
					{#if projectReviewStatus?.needsReview}
						<button
							on:click={onToggleAIReview}
							class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border {getPriorityColor(projectReviewStatus.priority)} hover:opacity-90 transition-opacity"
							title="{getPriorityLabel(projectReviewStatus.priority)} - {projectReviewStatus.issueCount} issue{projectReviewStatus.issueCount !== 1 ? 's' : ''}"
						>
							<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
							</svg>
							{projectReviewStatus.issueCount} issue{projectReviewStatus.issueCount !== 1 ? 's' : ''}
						</button>
					{/if}
				</div>

				<div class="flex flex-wrap gap-4 text-sm text-gray-600">
					{#if project?.client}
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
							</svg>
							Client: {project.client}
						</div>
					{/if}
					{#if project?.location}
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
							{project.location}
						</div>
					{/if}
					{#if project?.createdAt}
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
							</svg>
							Created: {new Date(project.createdAt).toLocaleDateString()}
						</div>
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-2">
				{#if projectReviewStatus?.needsReview}
					<button
						on:click={onToggleAIReview}
						class="btn {projectReviewStatus.priority === 'high' ? 'btn-danger' : projectReviewStatus.priority === 'medium' ? 'btn-warning' : 'btn-secondary'}"
					>
						<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						AI Review
					</button>
				{/if}
				<button
					on:click={onSave}
					class="btn btn-primary"
				>
					Save Project
				</button>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="card p-6 mb-6">
		<h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
			<button
				on:click={onAddTree}
				class="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
			>
				<svg class="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
				</svg>
				<span class="font-medium text-gray-900">Add Tree</span>
				<span class="text-sm text-gray-600">{treesCount} tree{treesCount !== 1 ? 's' : ''}</span>
			</button>

			<button
				on:click={onAddNote}
				class="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
			>
				<svg class="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
				</svg>
				<span class="font-medium text-gray-900">Add Note</span>
				<span class="text-sm text-gray-600">{notesCount} note{notesCount !== 1 ? 's' : ''}</span>
			</button>

			<button
				on:click={onAddPhoto}
				class="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
			>
				<svg class="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
				</svg>
				<span class="font-medium text-gray-900">Add Photo</span>
				<span class="text-sm text-gray-600">{photosCount} photo{photosCount !== 1 ? 's' : ''}</span>
			</button>

			<button
				on:click={onAddVoiceNote}
				class="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors group"
			>
				<svg class="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
				</svg>
				<span class="font-medium text-gray-900">Add Voice Note</span>
				<span class="text-sm text-gray-600">{voiceNotesCount} voice note{voiceNotesCount !== 1 ? 's' : ''}</span>
			</button>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
		<div class="card p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600">Total Items</p>
					<p class="text-2xl font-bold text-gray-900">{treesCount + notesCount + photosCount + voiceNotesCount}</p>
				</div>
				<div class="p-2 bg-gray-100 rounded-lg">
					<svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
					</svg>
				</div>
			</div>
		</div>

		<div class="card p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600">Trees Surveyed</p>
					<p class="text-2xl font-bold text-gray-900">{treesCount}</p>
				</div>
				<div class="p-2 bg-green-100 rounded-lg">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
					</svg>
				</div>
			</div>
		</div>

		<div class="card p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600">Notes & Voice</p>
					<p class="text-2xl font-bold text-gray-900">{notesCount + voiceNotesCount}</p>
				</div>
				<div class="p-2 bg-blue-100 rounded-lg">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
					</svg>
				</div>
			</div>
		</div>

		<div class="card p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600">Photos</p>
					<p class="text-2xl font-bold text-gray-900">{photosCount}</p>
				</div>
				<div class="p-2 bg-purple-100 rounded-lg">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
					</svg>
				</div>
			</div>
		</div>
	</div>
</div>