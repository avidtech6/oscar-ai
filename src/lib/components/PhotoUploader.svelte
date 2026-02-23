<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabase/client';
	
	export let projectId: string = '';
	export let treeId: string | null = null;
	export let noteId: string | null = null;
	export let buttonText: string = 'Upload Photo';
	export let buttonVariant: 'primary' | 'secondary' | 'outline' = 'primary';
	export let showPreview: boolean = true;
	export let multiple: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	let isUploading = false;
	let uploadProgress = 0;
	let errorMessage = '';
	let previewUrl: string | null = null;
	let uploadedUrls: string[] = [];
	
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		
		if (!files || files.length === 0) return;
		
		// Reset state
		isUploading = true;
		uploadProgress = 0;
		errorMessage = '';
		uploadedUrls = [];
		
		// Process each file
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			
			try {
				// Validate file type
				if (!file.type.startsWith('image/')) {
					errorMessage = `File ${file.name} is not an image. Please select an image file.`;
					continue;
				}
				
				// Validate file size (max 10MB)
				if (file.size > 10 * 1024 * 1024) {
					errorMessage = `File ${file.name} is too large. Maximum size is 10MB.`;
					continue;
				}
				
				// Generate unique filename
				const timestamp = new Date().getTime();
				const randomString = Math.random().toString(36).substring(2, 15);
				const fileExtension = file.name.split('.').pop() || 'jpg';
				const fileName = `photo_${timestamp}_${randomString}.${fileExtension}`;
				
				// Create storage path
				let storagePath = `projects/${projectId}`;
				if (treeId) {
					storagePath += `/trees/${treeId}`;
				} else if (noteId) {
					storagePath += `/notes/${noteId}`;
				}
				storagePath += `/${fileName}`;
				
				// Upload to Supabase storage
				const { data, error } = await supabase.storage
					.from('photos')
					.upload(storagePath, file, {
						cacheControl: '3600',
						upsert: false
					});
				
				if (error) {
					console.error('Error uploading photo:', error);
					errorMessage = `Failed to upload ${file.name}: ${error.message}`;
					continue;
				}
				
				// Get public URL
				const { data: urlData } = supabase.storage
					.from('photos')
					.getPublicUrl(storagePath);
				
				const publicUrl = urlData.publicUrl;
				
				// Create photo reference in database
				await createPhotoReference(fileName, storagePath, publicUrl, file.type, file.size);
				
				// Add to uploaded URLs
				uploadedUrls.push(publicUrl);
				
				// Update progress
				uploadProgress = ((i + 1) / files.length) * 100;
				
				// Show preview for first image
				if (i === 0 && showPreview) {
					previewUrl = URL.createObjectURL(file);
				}
				
			} catch (error) {
				console.error('Error in photo upload:', error);
				errorMessage = `Unexpected error uploading ${file.name}`;
			}
		}
		
		isUploading = false;
		
		// Dispatch event with uploaded URLs
		if (uploadedUrls.length > 0) {
			dispatch('upload', { urls: uploadedUrls });
			
			// If single file, also dispatch with single URL for backward compatibility
			if (uploadedUrls.length === 1) {
				dispatch('uploadComplete', { url: uploadedUrls[0] });
			}
		}
		
		// Reset file input
		input.value = '';
	}
	
	async function createPhotoReference(
		filename: string,
		storagePath: string,
		publicUrl: string,
		mimeType: string,
		size: number
	) {
		try {
			const photoRef = {
				project_id: projectId,
				tree_id: treeId,
				note_id: noteId,
				storage_path: storagePath,
				filename,
				mime_type: mimeType,
				size,
				public_url: publicUrl
			};
			
			const { error } = await supabase
				.from('photo_references')
				.insert(photoRef);
			
			if (error) {
				console.error('Error creating photo reference:', error);
			}
		} catch (error) {
			console.error('Error in createPhotoReference:', error);
		}
	}
	
	function triggerFileInput() {
		const fileInput = document.getElementById('photo-upload-input') as HTMLInputElement;
		if (fileInput) {
			fileInput.click();
		}
	}
	
	function getButtonClasses() {
		const baseClasses = 'btn flex items-center justify-center gap-2';
		
		switch (buttonVariant) {
			case 'primary':
				return `${baseClasses} btn-primary`;
			case 'secondary':
				return `${baseClasses} btn-secondary`;
			case 'outline':
				return `${baseClasses} btn-outline`;
			default:
				return `${baseClasses} btn-primary`;
		}
	}
	
	function clearPreview() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
	}
</script>

<div class="photo-uploader">
	<input
		id="photo-upload-input"
		type="file"
		accept="image/*"
		multiple={multiple}
		on:change={handleFileSelect}
		class="hidden"
	/>
	
	<button
		type="button"
		on:click={triggerFileInput}
		class={getButtonClasses()}
		disabled={isUploading}
	>
		{#if isUploading}
			<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
			</svg>
			<span>Uploading... {Math.round(uploadProgress)}%</span>
		{:else}
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
			</svg>
			<span>{buttonText}</span>
		{/if}
	</button>
	
	{#if errorMessage}
		<div class="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
			{errorMessage}
		</div>
	{/if}
	
	{#if showPreview && previewUrl}
		<div class="mt-4">
			<h4 class="text-sm font-medium text-gray-700 mb-2">Preview</h4>
			<div class="relative">
				<img
					src={previewUrl}
					alt="Upload preview"
					class="w-full max-w-xs h-auto rounded-lg border border-gray-300"
				/>
				<button
					type="button"
					on:click={clearPreview}
					class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100"
					title="Remove preview"
				>
					<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
		</div>
	{/if}
	
	{#if uploadedUrls.length > 0}
		<div class="mt-4">
			<h4 class="text-sm font-medium text-gray-700 mb-2">
				Uploaded {uploadedUrls.length} photo{uploadedUrls.length === 1 ? '' : 's'}
			</h4>
			<ul class="space-y-1">
				{#each uploadedUrls as url, i}
					<li class="flex items-center gap-2">
						<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
						</svg>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-blue-600 hover:underline truncate"
						>
							Photo {i + 1}
						</a>
						<button
							type="button"
							on:click={() => navigator.clipboard.writeText(url)}
							class="text-xs text-gray-500 hover:text-gray-700"
							title="Copy URL"
						>
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						</button>
					</li>
				{/each}
			</ul>
			<p class="text-xs text-gray-500 mt-2">
				Tip: Copy the URL and paste it into the rich text editor to insert the image.
			</p>
		</div>
	{/if}
</div>

<style>
	.photo-uploader {
		display: flex;
		flex-direction: column;
	}
	
	.btn {
		transition: all 0.2s ease;
	}
	
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>