<script lang="ts">
	import { rightPanelStore, type RightPanelContentType } from '$lib/stores/rightPanelStore';
	
	// Panel state from store
	let isOpen = $rightPanelStore.isOpen;
	let contentType: RightPanelContentType = $rightPanelStore.contentType;
	let contentData = $rightPanelStore.contentData;
	let panelWidth = $rightPanelStore.width;
	let panelTitle = $rightPanelStore.title;
	
	// Subscribe to store changes
	$: isOpen = $rightPanelStore.isOpen;
	$: contentType = $rightPanelStore.contentType;
	$: contentData = $rightPanelStore.contentData;
	$: panelWidth = $rightPanelStore.width;
	$: panelTitle = $rightPanelStore.title;
	
	function togglePanel() {
		rightPanelStore.toggle();
	}
	
	function closePanel() {
		rightPanelStore.close();
	}
	
	// Resize handlers
	function startResize(e: MouseEvent) {
		e.preventDefault();
		const startX = e.clientX;
		const startWidth = panelWidth;
		
		function onMouseMove(moveEvent: MouseEvent) {
			const delta = startX - moveEvent.clientX;
			const newWidth = Math.max(300, Math.min(800, startWidth + delta));
			rightPanelStore.setWidth(newWidth);
		}
		
		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}
		
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}
</script>

<!-- Panel container -->
<div class="h-full flex flex-col border-l border-gray-200 bg-white shadow-sm">
	<!-- Panel header -->
	<div class="p-4 border-b border-gray-200 flex items-center justify-between">
		<!-- Toggle button -->
		<button
			onclick={togglePanel}
			class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
			aria-label="{isOpen ? 'Close right panel' : 'Open right panel'}"
		>
			{#if isOpen}
				<span class="i-mdi-chevron-right w-5 h-5"></span>
			{:else}
				<span class="i-mdi-chevron-left w-5 h-5"></span>
			{/if}
		</button>
		
		<!-- Panel title -->
		{#if isOpen}
			<h3 class="text-lg font-semibold text-gray-800">{panelTitle}</h3>
		{/if}
		
		<!-- Actions placeholder -->
		<div class="w-10"></div>
	</div>
	
	<!-- Panel content -->
	{#if isOpen}
		<!-- Resize handle -->
		<div
			class="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-300 active:bg-gray-400"
			onmousedown={startResize}
			title="Resize panel"
			aria-label="Resize panel"
			role="slider"
			aria-valuemin="300"
			aria-valuemax="800"
			aria-valuenow={panelWidth}
			tabindex="0"
		></div>
		
		<div class="flex-1 overflow-auto" style="width: {panelWidth}px;">
			{#if contentType === 'pdf'}
				<!-- PDF Viewer -->
				<div class="p-4">
					<div class="text-center text-gray-500 py-12">
						<span class="i-mdi-file-pdf-box text-6xl text-red-500 mb-4 block"></span>
						<h4 class="text-xl font-medium text-gray-700 mb-2">PDF Viewer</h4>
						<p class="text-gray-600">PDF content would be displayed here</p>
						{#if contentData?.filename}
							<p class="text-sm text-gray-500 mt-2">{contentData.filename}</p>
						{/if}
					</div>
				</div>
			{:else if contentType === 'card'}
				<!-- Card Back -->
				<div class="p-4">
					<div class="border rounded-lg p-4 bg-white shadow-sm">
						<h4 class="font-medium text-gray-800 mb-2">Card Back</h4>
						{#if contentData?.title}
							<p class="text-gray-700 mb-1"><strong>Title:</strong> {contentData.title}</p>
						{/if}
						{#if contentData?.content}
							<div class="prose prose-sm max-w-none mt-3">
								{@html contentData.content}
							</div>
						{/if}
					</div>
				</div>
			{:else if contentType === 'document'}
				<!-- Document Viewer -->
				<div class="p-4">
					<div class="text-center text-gray-500 py-12">
						<span class="i-mdi-file-document text-6xl text-blue-500 mb-4 block"></span>
						<h4 class="text-xl font-medium text-gray-700 mb-2">Document Viewer</h4>
						<p class="text-gray-600">Document content would be displayed here</p>
						{#if contentData?.title}
							<p class="text-sm text-gray-500 mt-2">{contentData.title}</p>
						{/if}
					</div>
				</div>
			{:else if contentType === 'metadata'}
				<!-- Metadata Viewer -->
				<div class="p-4">
					<div class="border rounded-lg p-4 bg-gray-50">
						<h4 class="font-medium text-gray-800 mb-2">Metadata</h4>
						{#if contentData}
							<dl class="space-y-2">
								{#each Object.entries(contentData) as [key, value]}
									<div class="flex">
										<dt class="w-1/3 text-gray-600 text-sm">{key}:</dt>
										<dd class="w-2/3 text-gray-800 text-sm">{String(value)}</dd>
									</div>
								{/each}
							</dl>
						{:else}
							<p class="text-gray-500 text-sm">No metadata available</p>
						{/if}
					</div>
				</div>
			{:else if contentType === 'task'}
				<!-- Task Details -->
				<div class="p-4">
					<div class="border rounded-lg p-4 bg-gray-50">
						<h4 class="font-medium text-gray-800 mb-2">Task Details</h4>
						{#if contentData?.title}
							<p class="text-gray-700 mb-1"><strong>Title:</strong> {contentData.title}</p>
						{/if}
						{#if contentData?.description}
							<p class="text-gray-700 mb-1"><strong>Description:</strong> {contentData.description}</p>
						{/if}
						{#if contentData?.status}
							<p class="text-gray-700 mb-1"><strong>Status:</strong> {contentData.status}</p>
						{/if}
						{#if contentData?.dueDate}
							<p class="text-gray-700 mb-1"><strong>Due:</strong> {new Date(contentData.dueDate).toLocaleDateString()}</p>
						{/if}
					</div>
				</div>
			{:else if contentType === 'note'}
				<!-- Note Viewer -->
				<div class="p-4">
					<div class="border rounded-lg p-4 bg-yellow-50">
						<h4 class="font-medium text-gray-800 mb-2">Note</h4>
						{#if contentData?.title}
							<p class="text-gray-700 mb-1"><strong>Title:</strong> {contentData.title}</p>
						{/if}
						{#if contentData?.content}
							<div class="prose prose-sm max-w-none mt-3">
								{@html contentData.content}
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<!-- Default empty state -->
				<div class="p-4 text-center text-gray-500 py-12">
					<span class="i-mdi-eye-outline text-6xl text-gray-400 mb-4 block"></span>
					<h4 class="text-xl font-medium text-gray-700 mb-2">Right Panel</h4>
					<p class="text-gray-600">Select an item to view details here</p>
				</div>
			{/if}
		</div>
	{/if}
</div>