<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	
	const emit = createEventDispatcher();
	
	export let isOpen = false;
	export let context: string = 'general';
	export let itemTitle: string = '';
	export let itemType: string = '';
	
	// Context-aware actions based on the current context
	let actions = [
		{ id: 1, label: 'Attach to project', icon: '📋', description: 'Link this to an existing project', context: ['general', 'workspace', 'files'] },
		{ id: 2, label: 'Add to report', icon: '📄', description: 'Include in a report', context: ['general', 'workspace', 'files'] },
		{ id: 3, label: 'Summarise', icon: '📝', description: 'Create a summary', context: ['general', 'workspace', 'files', 'connect'] },
		{ id: 4, label: 'Extract tasks', icon: '✅', description: 'Identify actionable tasks', context: ['general', 'workspace'] },
		{ id: 5, label: 'Rewrite', icon: '✏️', description: 'Rephrase or improve', context: ['general', 'files', 'connect'] },
		{ id: 6, label: 'Share', icon: '↗️', description: 'Share with team or client', context: ['general', 'connect'] },
		{ id: 7, label: 'Archive', icon: '📦', description: 'Move to archive', context: ['general', 'workspace', 'files'] },
		{ id: 8, label: 'Set reminder', icon: '⏰', description: 'Set a follow-up reminder', context: ['general', 'workspace'] },
		{ id: 9, label: 'Add to map', icon: '🗺️', description: 'Place on the map', context: ['map', 'general'] },
		{ id: 10, label: 'Create note', icon: '📝', description: 'Create a new note', context: ['general', 'workspace'] },
		{ id: 11, label: 'Generate PDF', icon: '📑', description: 'Export as PDF', context: ['general', 'files', 'reports'] },
		{ id: 12, label: 'Analyze data', icon: '📊', description: 'Perform data analysis', context: ['general', 'files'] }
	];
	
	let filteredActions = [...actions];
	
	function closeSheet() {
		isOpen = false;
		emit('close');
	}
	
	function selectAction(action: { label: string }) {
		emit('action', { action: action.label });
		closeSheet();
	}
	
	function filterActions() {
		filteredActions = actions.filter(action => 
			action.context.includes(context) || action.context.includes('general')
		);
	}
	
	$: if (context) {
		filterActions();
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeSheet();
		}
	}
	
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- Backdrop -->
{#if isOpen}
	<div 
		class="fixed inset-0 bg-black/50 z-40"
		on:click={closeSheet}
		aria-hidden="true"
		transition:fade={{ duration: 200 }}
	></div>
{/if}

<!-- Sheet -->
<div
	class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out"
	class:translate-y-full={!isOpen}
	class:translate-y-0={isOpen}
	role="dialog"
	aria-modal="true"
	aria-labelledby="sheet-title"
>
	<!-- Drag handle -->
	<div class="pt-4 pb-2 flex justify-center">
		<div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
	</div>
	
	<!-- Header -->
	<div class="px-6 pb-4 border-b border-gray-200">
		<div class="flex items-center justify-between">
			<div>
				<h2 id="sheet-title" class="text-xl font-bold text-gray-900">Actions</h2>
				<p class="text-sm text-gray-600 mt-1">
					{#if itemTitle}
						Actions for "{itemTitle}" ({itemType || context})
					{:else}
						Available actions for this context
					{/if}
				</p>
			</div>
			<button
				on:click={closeSheet}
				class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
				aria-label="Close actions"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
	
	<!-- Actions grid -->
	<div class="px-6 py-4 max-h-[50vh] overflow-y-auto">
		{#if filteredActions.length === 0}
			<div class="text-center py-12">
				<svg class="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="mt-4 text-gray-500">No actions available for this context</p>
				<p class="text-sm text-gray-400">Try a different context or item</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
				{#each filteredActions as action}
					<button
						on:click={() => selectAction(action)}
						class="text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md group"
					>
						<div class="flex flex-col items-center text-center">
							<div class="text-2xl mb-2">{action.icon}</div>
							<div class="font-medium text-gray-900 group-hover:text-blue-700 mb-1">{action.label}</div>
							<div class="text-xs text-gray-600 group-hover:text-blue-600">{action.description}</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- Footer -->
	<div class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
		<div class="flex items-center justify-between">
			<p class="text-sm text-gray-600">
				{filteredActions.length} action{filteredActions.length !== 1 ? 's' : ''} available
			</p>
			<button
				on:click={closeSheet}
				class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
			>
				Close
			</button>
		</div>
	</div>
</div>

<style>
	/* Smooth transitions */
	div[role="dialog"] {
		transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	/* Custom scrollbar */
	.max-h-\[50vh\] {
		scrollbar-width: thin;
		scrollbar-color: #d1d5db transparent;
	}
	
	.max-h-\[50vh\]::-webkit-scrollbar {
		width: 6px;
	}
	
	.max-h-\[50vh\]::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.max-h-\[50vh\]::-webkit-scrollbar-thumb {
		background-color: #d1d5db;
		border-radius: 3px;
	}
	
	/* Responsive adjustments */
	@media (min-width: 1024px) {
		/* Desktop: smaller height for context action sheet */
		div[role="dialog"] {
			height: 50vh;
			max-height: 50vh;
		}
		
		.max-h-\[50vh\] {
			max-height: calc(50vh - 180px);
		}
	}
	
	@media (max-width: 1023px) {
		/* Mobile/tablet portrait: medium height */
		div[role="dialog"] {
			height: 60vh;
			max-height: 60vh;
		}
		
		.max-h-\[50vh\] {
			max-height: calc(60vh - 180px);
		}
	}
</style>