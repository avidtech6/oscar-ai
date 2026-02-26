<script lang="ts">
	import { onMount } from 'svelte';
	import { showToast } from '$lib/stores/toast';
	import { addFileAttachment } from '$lib/copilot/fileCapture';

	let selectedFiles: File[] = [];
	let isDragging = false;
	let isLoading = false;

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;
		processFiles(Array.from(input.files));
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		if (!event.dataTransfer) return;
		const files = Array.from(event.dataTransfer.files);
		processFiles(files);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	async function processFiles(files: File[]) {
		isLoading = true;
		selectedFiles = [...selectedFiles, ...files];
		
		for (const file of files) {
			try {
				// Extract text from text-based files
				if (file.type.startsWith('text/') || file.type === 'application/json') {
					const text = await file.text();
					addFileAttachment({
						name: file.name,
						type: file.type,
						size: file.size,
						content: text,
						preview: null
					});
					showToast(`Processed text file: ${file.name}`, 'success');
				} else if (file.type.startsWith('image/')) {
					// Convert image to data URL for preview
					const reader = new FileReader();
					reader.onload = (e) => {
						const dataUrl = e.target?.result as string;
						addFileAttachment({
							name: file.name,
							type: file.type,
							size: file.size,
							content: null,
							preview: dataUrl
						});
					};
					reader.readAsDataURL(file);
					showToast(`Processed image: ${file.name}`, 'success');
				} else if (file.type === 'application/pdf') {
					// PDF extraction placeholder
					addFileAttachment({
						name: file.name,
						type: file.type,
						size: file.size,
						content: null,
						preview: null
					});
					showToast(`PDF uploaded: ${file.name} (extraction pending)`, 'info');
				} else {
					showToast(`Unsupported file type: ${file.type}`, 'warning');
				}
			} catch (err) {
				console.error('File processing error:', err);
				showToast(`Failed to process ${file.name}`, 'error');
			}
		}
		isLoading = false;
	}

	function removeFile(index: number) {
		selectedFiles.splice(index, 1);
		selectedFiles = selectedFiles; // trigger reactivity
	}

	function clearAll() {
		selectedFiles = [];
	}
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] p-4">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">File Picker</h1>
	<p class="text-gray-600 mb-8 max-w-md text-center">
		Upload images, PDFs, or text files. Content will be extracted and sent to the Copilot for analysis.
	</p>

	<!-- Drop zone -->
	<div
		class="w-full max-w-2xl border-2 border-dashed rounded-2xl p-8 mb-8 text-center transition-colors
			{isDragging ? 'border-forest-500 bg-forest-50' : 'border-gray-300 hover:border-gray-400'}"
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
	>
		<svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
		</svg>
		<p class="text-lg font-medium text-gray-700 mb-2">Drop files here</p>
		<p class="text-gray-500 mb-4">or</p>
		<label for="file-input" class="cursor-pointer">
			<span class="px-6 py-3 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors">
				Choose Files
			</span>
			<input
				id="file-input"
				type="file"
				multiple
				accept=".txt,.json,.pdf,.jpg,.jpeg,.png,.gif,.webp"
				class="hidden"
				on:change={handleFileSelect}
			/>
		</label>
		<p class="text-sm text-gray-500 mt-4">Supports images, PDFs, text files (max 10MB each)</p>
	</div>

	<!-- Selected files list -->
	{#if selectedFiles.length > 0}
		<div class="w-full max-w-2xl">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Selected Files ({selectedFiles.length})</h2>
				<button
					on:click={clearAll}
					class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
				>
					Clear All
				</button>
			</div>
			<div class="space-y-3">
				{#each selectedFiles as file, index (file.name + index)}
					<div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
								{#if file.type.startsWith('image/')}
									<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								{:else if file.type === 'application/pdf'}
									<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
									</svg>
								{:else}
									<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								{/if}
							</div>
							<div>
								<p class="font-medium text-gray-900">{file.name}</p>
								<p class="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB · {file.type}</p>
							</div>
						</div>
						<button
							on:click={() => removeFile(index)}
							class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
							title="Remove"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if isLoading}
		<div class="mt-8 flex items-center gap-3">
			<div class="w-5 h-5 border-2 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
			<span class="text-gray-700">Processing files...</span>
		</div>
	{/if}
</div>