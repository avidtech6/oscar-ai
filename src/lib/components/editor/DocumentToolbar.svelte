<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let isDirty: boolean = false;
	export let lastSaved: string | null = null;
	export let documentName: string = '';
	export let isPdf: boolean = false;
	export let isGeneratingPdf: boolean = false;
	export let isSendingEmail: boolean = false;
	export let userEmail: string = '';
	
	const dispatch = createEventDispatcher();
	
	function formatTime(isoString: string | null): string {
		if (!isoString) return '';
		const date = new Date(isoString);
		return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}
	
	function handleSave() {
		dispatch('save');
	}
	
	function handleExportPdf() {
		dispatch('export-pdf');
	}
	
	function handleEmailPdf() {
		dispatch('email-pdf');
	}
	
	function handleViewVersions() {
		dispatch('view-versions');
	}
	
	function handleNewDocument() {
		dispatch('new-document');
	}
</script>

<div class="document-toolbar flex items-center justify-between p-3 bg-white border-b border-gray-200">
	<div class="flex items-center gap-3">
		{#if documentName}
			<h2 class="font-semibold text-gray-800 truncate max-w-[200px] lg:max-w-[400px]">{documentName}</h2>
		{:else}
			<h2 class="font-semibold text-gray-400 italic">Untitled Document</h2>
		{/if}
		
		{#if isDirty}
			<span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Unsaved</span>
		{:else if lastSaved}
			<span class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Saved {formatTime(lastSaved)}</span>
		{/if}
	</div>
	
	<div class="flex items-center gap-2">
		<button 
			class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
			on:click={handleNewDocument}
			title="New Document"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
			</svg>
			<span class="hidden sm:inline">New</span>
		</button>
		
		<button 
			class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
			on:click={handleSave}
			disabled={!isDirty}
			title="Save Document"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
			</svg>
			<span class="hidden sm:inline">Save</span>
		</button>
		
		{#if !isPdf}
			<button 
				class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
				on:click={handleExportPdf}
				disabled={isGeneratingPdf}
				title="Export to PDF"
			>
				{#if isGeneratingPdf}
					<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
					</svg>
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
					</svg>
				{/if}
				<span class="hidden sm:inline">PDF</span>
			</button>
			
			<button 
				class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
				on:click={handleEmailPdf}
				disabled={isSendingEmail || !userEmail}
				title="Email PDF"
			>
				{#if isSendingEmail}
					<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
					</svg>
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
					</svg>
				{/if}
				<span class="hidden sm:inline">Email</span>
			</button>
		{/if}
		
		<button 
			class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
			on:click={handleViewVersions}
			title="View Versions"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
			<span class="hidden sm:inline">History</span>
		</button>
	</div>
</div>
