<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { isSearching, searchResults } from '$lib/stores/appStore';
	
	export let isOpen: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	let query = '';
	let startDate = '';
	let endDate = '';
	let searchType: 'content' | 'date' = 'content';
	let debounceTimer: ReturnType<typeof setTimeout>;
	
	$: if (isOpen) {
		setTimeout(() => {
			const input = document.querySelector('.search-input') as HTMLInputElement;
			if (input) input.focus();
		}, 100);
	}
	
	function handleInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			performSearch();
		}, 500);
	}
	
	async function performSearch() {
		if (!query && !startDate) return;
		
		isSearching.set(true);
		
		try {
			const params = new URLSearchParams();
			if (searchType === 'content' && query) {
				params.set('q', query);
			} else if (searchType === 'date' && startDate && endDate) {
				params.set('startDate', startDate);
				params.set('endDate', endDate);
			}
			
			const response = await fetch(`/api/drive/search?${params.toString()}`);
			const data = await response.json();
			
			searchResults.set(data.results || []);
		} catch (error) {
			console.error('Search error:', error);
			searchResults.set([]);
		} finally {
			isSearching.set(false);
		}
	}
	
	function selectResult(result: any) {
		dispatch('select', result);
		close();
	}
	
	function close() {
		isOpen = false;
		query = '';
		startDate = '';
		endDate = '';
		searchResults.set([]);
		dispatch('close');
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}
	
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}
	
	function getFileIcon(mimeType: string): string {
		if (mimeType === 'application/pdf') {
			return `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>`;
		}
		return `<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
	}
	
	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if isOpen}
	<div class="search-modal fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50" on:click={close}>
		<div 
			class="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden" 
			on:click|stopPropagation
		>
			<!-- Search Input -->
			<div class="p-4 border-b border-gray-200">
				<div class="flex gap-2 mb-3">
					<button
						class="px-3 py-1.5 text-sm rounded-lg transition-colors {searchType === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}"
						on:click={() => searchType = 'content'}
					>
						By Content
					</button>
					<button
						class="px-3 py-1.5 text-sm rounded-lg transition-colors {searchType === 'date' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}"
						on:click={() => searchType = 'date'}
					>
						By Date
					</button>
				</div>
				
				{#if searchType === 'content'}
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
						</svg>
						<input
							type="text"
							bind:value={query}
							on:input={handleInput}
							placeholder="Search your documents..."
							class="search-input w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				{:else}
					<div class="flex gap-2">
						<input
							type="date"
							bind:value={startDate}
							class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<span class="self-center text-gray-500">to</span>
						<input
							type="date"
							bind:value={endDate}
							class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							on:click={performSearch}
						>
							Search
						</button>
					</div>
				{/if}
			</div>
			
			<!-- Results -->
			<div class="max-h-96 overflow-y-auto">
				{#if $isSearching}
					<div class="flex items-center justify-center p-8">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				{:else if $searchResults.length > 0}
					<div class="divide-y divide-gray-100">
						{#each $searchResults as result}
							<button
								class="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
								on:click={() => selectResult(result)}
							>
								<span class="mt-0.5">
									{@html getFileIcon(result.mimeType)}
								</span>
								<div class="flex-1 min-w-0">
									<p class="font-medium text-gray-800 truncate">{result.name}</p>
									<p class="text-sm text-gray-500">{formatDate(result.modifiedTime)}</p>
								</div>
							</button>
						{/each}
					</div>
				{:else if query || startDate}
					<div class="p-8 text-center text-gray-500">
						No documents found
					</div>
				{:else}
					<div class="p-8 text-center text-gray-500">
						<p>Search your documents by content or date</p>
						<p class="text-sm mt-1">Try "oak tree" or "January 5th"</p>
					</div>
				{/if}
			</div>
			
			<!-- Footer -->
			<div class="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
				<span>Press ESC to close</span>
				<span>Search powered by Google Drive</span>
			</div>
		</div>
	</div>
{/if}
