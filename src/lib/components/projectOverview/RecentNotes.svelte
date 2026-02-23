<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Note } from '$lib/db';

	export let notes: Note[] = [];
	export let projectId: string = '';
	export let limit: number = 5;

	// Get recent notes (sorted by date, newest first)
	$: recentNotes = notes
		.slice()
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, limit);

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	function truncateText(text: string, maxLength: number = 100): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	function stripHtml(html: string): string {
		return html.replace(/<[^>]*>/g, '');
	}

	function handleViewAll() {
		goto(`/project/${projectId}?tab=notes`);
	}

	function handleViewNote(noteId: string) {
		// For now, just navigate to notes tab
		goto(`/project/${projectId}?tab=notes`);
	}
</script>

<div class="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
	<div class="flex justify-between items-center mb-4">
		<h3 class="font-medium text-gray-700">Recent Notes</h3>
		<button
			on:click={handleViewAll}
			class="text-sm text-blue-500 hover:text-blue-700 font-medium"
		>
			View All
		</button>
	</div>

	{#if recentNotes.length === 0}
		<div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
			<p>No notes yet</p>
		</div>
	{:else}
		<div class="space-y-3 flex-1">
			{#each recentNotes as note (note.id)}
				<div
					on:click={() => handleViewNote(note.id)}
					class="border border-gray-100 rounded p-3 hover:bg-gray-50 cursor-pointer transition-colors"
				>
					<div class="flex justify-between items-start mb-1">
						<h4 class="font-medium text-gray-800 text-sm truncate">{note.title}</h4>
						<span class="text-xs text-gray-500 whitespace-nowrap ml-2">
							{formatDate(note.createdAt)}
						</span>
					</div>
					<p class="text-xs text-gray-600 line-clamp-2">
						{truncateText(stripHtml(note.content || ''))}
					</p>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-4 pt-3 border-t border-gray-100">
		<button
			on:click={() => goto(`/project/${projectId}?tab=notes&action=create`)}
			class="w-full btn btn-outline btn-sm"
		>
			+ Add Note
		</button>
	</div>
</div>