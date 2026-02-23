<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Photo } from '$lib/db';

	export let photos: Photo[] = [];
	export let projectId: string = '';
	export let limit: number = 6;

	// Get recent photos (sorted by date, newest first)
	$: recentPhotos = photos
		.slice()
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, limit);

	function formatDate(dateString: Date | string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	function handleViewAll() {
		goto(`/project/${projectId}?tab=photos`);
	}

	function handleViewPhoto(photoId: string | undefined) {
		if (!photoId) return;
		goto(`/project/${projectId}?tab=photos`);
	}
</script>

<div class="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
	<div class="flex justify-between items-center mb-4">
		<h3 class="font-medium text-gray-700">Recent Photos</h3>
		<button
			on:click={handleViewAll}
			class="text-sm text-blue-500 hover:text-blue-700 font-medium"
		>
			View All
		</button>
	</div>

	{#if recentPhotos.length === 0}
		<div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
			<p>No photos yet</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 flex-1">
			{#each recentPhotos as photo (photo.id)}
				<div
					on:click={() => handleViewPhoto(photo.id)}
					class="aspect-square border border-gray-100 rounded overflow-hidden hover:opacity-90 cursor-pointer transition-opacity relative group"
				>
					{#if photo.blob}
						<img
							src={URL.createObjectURL(photo.blob)}
							alt={photo.filename || 'Photo'}
							class="w-full h-full object-cover"
						/>
					{:else}
						<div class="w-full h-full bg-gray-100 flex items-center justify-center">
							<span class="text-gray-400 text-xs">No image</span>
						</div>
					{/if}
					<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
					<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
						<p class="text-white text-xs truncate">{photo.filename}</p>
						<p class="text-white text-xs opacity-75">{formatDate(photo.createdAt)}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-4 pt-3 border-t border-gray-100">
		<button
			on:click={() => goto(`/project/${projectId}?tab=photos&action=upload`)}
			class="w-full btn btn-outline btn-sm"
		>
			+ Upload Photo
		</button>
	</div>
</div>