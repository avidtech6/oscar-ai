<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Tree } from '$lib/db';

	export let trees: Tree[] = [];
	export let projectId: string = '';
	export let limit: number = 5;

	// Get recent trees (sorted by date, newest first)
	$: recentTrees = trees
		.slice()
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, limit);

	function formatDate(dateString: Date | string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'A': return 'bg-green-100 text-green-800';
			case 'B': return 'bg-blue-100 text-blue-800';
			case 'C': return 'bg-yellow-100 text-yellow-800';
			case 'U': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getCategoryLabel(category: string): string {
		switch (category) {
			case 'A': return 'A';
			case 'B': return 'B';
			case 'C': return 'C';
			case 'U': return 'U';
			default: return 'Not set';
		}
	}

	function handleViewAll() {
		goto(`/project/${projectId}?tab=trees`);
	}

	function handleViewTree(treeId: string | undefined) {
		if (!treeId) return;
		goto(`/project/${projectId}?tab=trees`);
	}
</script>

<div class="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
	<div class="flex justify-between items-center mb-4">
		<h3 class="font-medium text-gray-700">Recent Trees</h3>
		<button
			on:click={handleViewAll}
			class="text-sm text-blue-500 hover:text-blue-700 font-medium"
		>
			View All
		</button>
	</div>

	{#if recentTrees.length === 0}
		<div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
			<p>No trees yet</p>
		</div>
	{:else}
		<div class="space-y-3 flex-1">
			{#each recentTrees as tree (tree.id)}
				<div
					on:click={() => handleViewTree(tree.id)}
					class="border border-gray-100 rounded p-3 hover:bg-gray-50 cursor-pointer transition-colors"
				>
					<div class="flex justify-between items-start mb-1">
						<div class="flex items-center gap-2">
							<h4 class="font-medium text-gray-800 text-sm">
								{tree.number} - {tree.species}
							</h4>
							{#if tree.category}
								<span class="text-xs px-1.5 py-0.5 rounded {getCategoryColor(tree.category)}">
									{getCategoryLabel(tree.category)}
								</span>
							{/if}
						</div>
						<span class="text-xs text-gray-500 whitespace-nowrap ml-2">
							{formatDate(tree.createdAt)}
						</span>
					</div>
					<div class="text-xs text-gray-600 space-y-1">
						{#if tree.condition}
							<p><span class="font-medium">Condition:</span> {tree.condition}</p>
						{/if}
						{#if tree.notes}
							<p class="line-clamp-1 text-gray-500">
								{tree.notes.replace(/<[^>]*>/g, '').substring(0, 60)}...
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-4 pt-3 border-t border-gray-100">
		<button
			on:click={() => goto(`/project/${projectId}?tab=trees&action=create`)}
			class="w-full btn btn-outline btn-sm"
		>
			+ Add Tree
		</button>
	</div>
</div>