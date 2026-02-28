<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	
	const emit = createEventDispatcher();
	
	export let isOpen = false;
	
	let suggestions = [
		{ id: 1, text: 'Analyze this tree health report', category: 'analysis', icon: '📊' },
		{ id: 2, text: 'Create a project timeline for oak preservation', category: 'planning', icon: '📅' },
		{ id: 3, text: 'Generate a site survey checklist', category: 'checklist', icon: '✅' },
		{ id: 4, text: 'Summarize the latest arboricultural regulations', category: 'research', icon: '📚' },
		{ id: 5, text: 'Draft an email to the client about tree removal', category: 'communication', icon: '✉️' },
		{ id: 6, text: 'Calculate the carbon sequestration for this forest', category: 'calculation', icon: '🧮' },
		{ id: 7, text: 'Create a risk assessment for storm damage', category: 'risk', icon: '⚠️' },
		{ id: 8, text: 'Generate a maintenance schedule for urban trees', category: 'maintenance', icon: '🔧' }
	];
	
	let filteredSuggestions = [...suggestions];
	let selectedCategory: string | null = null;
	let searchQuery = '';
	
	const categories = [
		{ id: 'all', label: 'All', icon: '📋' },
		{ id: 'analysis', label: 'Analysis', icon: '📊' },
		{ id: 'planning', label: 'Planning', icon: '📅' },
		{ id: 'checklist', label: 'Checklist', icon: '✅' },
		{ id: 'research', label: 'Research', icon: '📚' },
		{ id: 'communication', label: 'Communication', icon: '✉️' },
		{ id: 'calculation', label: 'Calculation', icon: '🧮' },
		{ id: 'risk', label: 'Risk', icon: '⚠️' },
		{ id: 'maintenance', label: 'Maintenance', icon: '🔧' }
	];
	
	function closeSheet() {
		isOpen = false;
		emit('close');
	}
	
	function selectSuggestion(suggestion: { text: string }) {
		emit('select', { text: suggestion.text });
		closeSheet();
	}
	
	function filterSuggestions() {
		let filtered = suggestions;
		
		if (selectedCategory && selectedCategory !== 'all') {
			filtered = filtered.filter(s => s.category === selectedCategory);
		}
		
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(s => 
				s.text.toLowerCase().includes(query) || 
				s.category.toLowerCase().includes(query)
			);
		}
		
		filteredSuggestions = filtered;
	}
	
	$: if (selectedCategory || searchQuery) {
		filterSuggestions();
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
				<h2 id="sheet-title" class="text-xl font-bold text-gray-900">Prompt Suggestions</h2>
				<p class="text-sm text-gray-600 mt-1">Quick prompts to get started with Oscar AI</p>
			</div>
			<button
				on:click={closeSheet}
				class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
				aria-label="Close suggestions"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		<!-- Search -->
		<div class="mt-4">
			<div class="relative">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
				<input
					type="search"
					bind:value={searchQuery}
					placeholder="Search suggestions..."
					class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
		</div>
		
		<!-- Category filters -->
		<div class="mt-4 overflow-x-auto">
			<div class="flex space-x-2 pb-2">
				{#each categories as category}
					<button
						on:click={() => selectedCategory = category.id}
						class="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap {selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						<span class="mr-1.5">{category.icon}</span>
						{category.label}
					</button>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Suggestions list -->
	<div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
		{#if filteredSuggestions.length === 0}
			<div class="text-center py-12">
				<svg class="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="mt-4 text-gray-500">No suggestions found</p>
				<p class="text-sm text-gray-400">Try a different search or category</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each filteredSuggestions as suggestion}
					<button
						on:click={() => selectSuggestion(suggestion)}
						class="text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md group"
					>
						<div class="flex items-start">
							<div class="flex-shrink-0 text-2xl mr-3">{suggestion.icon}</div>
							<div class="flex-1">
								<p class="text-gray-900 font-medium group-hover:text-blue-700">{suggestion.text}</p>
								<div class="mt-2 flex items-center">
									<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
										{suggestion.category}
									</span>
									<span class="ml-auto text-xs text-gray-500 group-hover:text-blue-600">
										Use →
									</span>
								</div>
							</div>
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
				{filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''} available
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
	.max-h-\[60vh\] {
		scrollbar-width: thin;
		scrollbar-color: #d1d5db transparent;
	}
	
	.max-h-\[60vh\]::-webkit-scrollbar {
		width: 6px;
	}
	
	.max-h-\[60vh\]::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.max-h-\[60vh\]::-webkit-scrollbar-thumb {
		background-color: #d1d5db;
		border-radius: 3px;
	}
</style>