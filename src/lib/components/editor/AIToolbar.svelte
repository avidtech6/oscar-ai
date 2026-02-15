<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let isProcessing: boolean = false;
	export let selectedText: string = '';
	
	const dispatch = createEventDispatcher();
	
	const quickActions = [
		{ id: 'rewrite', label: 'Rewrite', icon: 'refresh', description: 'Rewrite the selected text' },
		{ id: 'expand', label: 'Expand', icon: 'expand', description: 'Add more detail' },
		{ id: 'shorten', label: 'Shorten', icon: 'shorten', description: 'Make it more concise' },
		{ id: 'formal', label: 'Formal', icon: 'formal', description: 'Make it more formal' },
		{ id: 'casual', label: 'Casual', icon: 'casual', description: 'Make it more casual' },
		{ id: 'grammar', label: 'Fix Grammar', icon: 'grammar', description: 'Correct grammar and spelling' },
		{ id: 'table', label: 'Add Table', icon: 'table', description: 'Insert a table' },
		{ id: 'species', label: 'Species List', icon: 'species', description: 'Insert tree species list' }
	];
	
	let customPrompt = '';
	let showCustomInput = false;
	
	function handleAction(actionId: string) {
		dispatch('action', { actionId, selectedText });
	}
	
	function handleCustomSubmit() {
		if (customPrompt.trim()) {
			dispatch('custom', { prompt: customPrompt, selectedText });
			customPrompt = '';
			showCustomInput = false;
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleCustomSubmit();
		}
	}
	
	const icons: Record<string, string> = {
		refresh: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
		expand: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>`,
		shorten: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>`,
		formal: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
		casual: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
		grammar: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
		table: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M10 3v18M14 3v18"/></svg>`,
		species: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
		custom: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>`
	};
</script>

<div class="ai-toolbar bg-white border-t border-gray-200 p-3">
	<div class="flex items-center gap-2 mb-3">
		<span class="text-sm font-medium text-gray-700">Ask Oscar to:</span>
		{#if isProcessing}
			<div class="flex items-center gap-1 text-sm text-blue-600">
				<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
				</svg>
				Processing...
			</div>
		{/if}
	</div>
	
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
		{#each quickActions as action}
			<button
				class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
				on:click={() => handleAction(action.id)}
				disabled={isProcessing}
				title={action.description}
			>
				<span class="text-blue-600">{@html icons[action.icon]}</span>
				{action.label}
			</button>
		{/each}
	</div>
	
	{#if showCustomInput}
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={customPrompt}
				on:keydown={handleKeydown}
				placeholder="Describe what you want Oscar to do..."
				class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				disabled={isProcessing}
			/>
			<button
				class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
				on:click={handleCustomSubmit}
				disabled={isProcessing || !customPrompt.trim()}
			>
				Send
			</button>
			<button
				class="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
				on:click={() => showCustomInput = false}
			>
				Cancel
			</button>
		</div>
	{:else}
		<button
			class="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
			on:click={() => showCustomInput = true}
		>
			{@html icons.custom}
			Custom request...
		</button>
	{/if}
	
	{#if selectedText}
		<p class="mt-2 text-xs text-gray-500">
			<strong>Selected:</strong> {selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}
		</p>
	{/if}
</div>
