<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { DocFile, DriveFolder } from '$lib/stores/appStore';
	
	export let folders: DriveFolder[] = [];
	export let activeFileId: string | null = null;
	
	const dispatch = createEventDispatcher();
	
	const folderIcons: Record<string, string> = {
		notes: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
		reports: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
		drafts: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
		logs: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`,
		summaries: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
		pdfs: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>`,
		projects: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>`
	};
	
	const folderColors: Record<string, string> = {
		notes: 'text-blue-500',
		reports: 'text-green-500',
		drafts: 'text-yellow-500',
		logs: 'text-purple-500',
		summaries: 'text-orange-500',
		pdfs: 'text-red-500',
		projects: 'text-indigo-500'
	};
	
	function toggleFolder(folder: DriveFolder) {
		folder.expanded = !folder.expanded;
		folders = [...folders];
		dispatch('toggle', folder);
	}
	
	function selectFile(file: DocFile) {
		activeFileId = file.id;
		dispatch('select', file);
	}
	
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}
</script>

<div class="space-y-1">
	{#each folders as folder}
		<div class="folder-item">
			<button 
				class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
				on:click={() => toggleFolder(folder)}
			>
				<span class="transform transition-transform {folder.expanded ? 'rotate-90' : ''}">
					<svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
					</svg>
				</span>
				<span class={folderColors[folder.type] || 'text-gray-500'}>
					{@html folderIcons[folder.type] || folderIcons.notes}
				</span>
				<span class="flex-1 font-medium text-gray-700 capitalize">{folder.type}</span>
				<span class="text-xs text-gray-400">{folder.files.length}</span>
			</button>
			
			{#if folder.expanded}
				<div class="ml-6 mt-1 space-y-1">
					{#each folder.files as file}
						<button
							class="w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-lg transition-colors text-sm {activeFileId === file.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}"
							on:click={() => selectFile(file)}
						>
							{#if file.name.endsWith('.pdf')}
								<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
								</svg>
							{:else}
								<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
								</svg>
							{/if}
							<span class="flex-1 truncate">{file.name}</span>
							<span class="text-xs text-gray-400">{formatDate(file.modifiedTime)}</span>
						</button>
					{/each}
					
					{#if folder.files.length === 0}
						<p class="px-3 py-2 text-xs text-gray-400 italic">No files yet</p>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.folder-item button {
		-webkit-tap-highlight-color: transparent;
	}
</style>
