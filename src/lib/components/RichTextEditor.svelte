<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import PhotoUploader from './PhotoUploader.svelte';
	
	export let value: string = '';
	export let placeholder: string = 'Start writing...';
	export let readonly: boolean = false;
	export let enableDictation: boolean = true;
	export let enableImageUpload: boolean = true;
	export let projectId: string = '';
	export let noteId: string | null = null;
	export let treeId: string | null = null;
	
	const dispatch = createEventDispatcher();
	
	let editorDiv: HTMLDivElement;
	let isDirty = false;
	let saveTimeout: ReturnType<typeof setTimeout>;
	
	// Voice dictation
	let isRecording = false;
	let recognition: any = null;
	let supportedSpeechRecognition = false;
	
	// Image upload
	let showImageUpload = false;
	let imageUploadUrl = '';
	
	onMount(() => {
		// Check if Web Speech API is supported
		supportedSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
		
		// Initialize editor content
		if (editorDiv && value) {
			editorDiv.innerHTML = value;
		}
		
		// Focus the editor
		if (!readonly) {
			editorDiv?.focus();
		}
	});
	
	function handleInput() {
		const content = editorDiv.innerHTML;
		if (content !== value) {
			value = content;
			isDirty = true;
			
			// Debounced change event
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => {
				dispatch('change', value);
			}, 1000);
		}
	}
	
	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') || '';
		
		// Insert plain text to avoid weird formatting
		document.execCommand('insertText', false, text);
		handleInput();
	}
	
	function formatText(command: string, value: string = '') {
		document.execCommand(command, false, value);
		editorDiv.focus();
		handleInput();
	}
	
	function insertImage(url: string, alt: string = 'Image') {
		const img = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;">`;
		document.execCommand('insertHTML', false, img);
		editorDiv.focus();
		handleInput();
	}
	
	// Voice dictation functions
	function startDictation() {
		if (!supportedSpeechRecognition) {
			alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
			return;
		}
		
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		recognition = new SpeechRecognition();
		
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'en-GB';
		
		recognition.onstart = () => {
			isRecording = true;
		};
		
		recognition.onresult = (event: any) => {
			let interimTranscript = '';
			let finalTranscript = '';
			
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					finalTranscript += transcript;
				} else {
					interimTranscript += transcript;
				}
			}
			
			// Insert the final transcript
			if (finalTranscript) {
				document.execCommand('insertText', false, finalTranscript + ' ');
				handleInput();
			}
		};
		
		recognition.onerror = (event: any) => {
			console.error('Speech recognition error:', event.error);
			isRecording = false;
		};
		
		recognition.onend = () => {
			isRecording = false;
		};
		
		recognition.start();
	}
	
	function stopDictation() {
		if (recognition) {
			recognition.stop();
			isRecording = false;
		}
	}
	
	function toggleDictation() {
		if (isRecording) {
			stopDictation();
		} else {
			startDictation();
		}
	}
	
	// Image upload functions
	function handleImageUpload() {
		if (!imageUploadUrl.trim()) return;
		
		insertImage(imageUploadUrl, 'Uploaded image');
		showImageUpload = false;
		imageUploadUrl = '';
	}
	
	function triggerImageUpload() {
		showImageUpload = !showImageUpload;
	}
	
	// Handle photo upload from PhotoUploader component
	function handlePhotoUpload(event: CustomEvent<{ urls: string[] }>) {
		const { urls } = event.detail;
		if (urls.length > 0) {
			// Insert the first uploaded image
			insertImage(urls[0], 'Uploaded photo');
			showImageUpload = false;
		}
	}
	
	// Clear formatting
	function clearFormatting() {
		document.execCommand('removeFormat');
		editorDiv.focus();
		handleInput();
	}
	
	// Insert link
	function insertLink() {
		const url = prompt('Enter URL:');
		if (url) {
			formatText('createLink', url);
		}
	}
	
	// Insert horizontal rule
	function insertHorizontalRule() {
		document.execCommand('insertHTML', false, '<hr>');
		editorDiv.focus();
		handleInput();
	}
</script>

<div class="rich-text-editor border border-gray-300 rounded-lg overflow-hidden bg-white">
	{#if !readonly}
		<div class="toolbar flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
			<!-- Text formatting -->
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Bold"
				on:click={() => formatText('bold')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Italic"
				on:click={() => formatText('italic')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-4 0h8"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Underline"
				on:click={() => formatText('underline')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/>
				</svg>
			</button>
			
			<div class="w-px h-4 bg-gray-300 mx-1"></div>
			
			<!-- Headings -->
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Heading 1"
				on:click={() => formatText('formatBlock', '<h1>')}
			>
				H1
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Heading 2"
				on:click={() => formatText('formatBlock', '<h2>')}
			>
				H2
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Heading 3"
				on:click={() => formatText('formatBlock', '<h3>')}
			>
				H3
			</button>
			
			<div class="w-px h-4 bg-gray-300 mx-1"></div>
			
			<!-- Lists -->
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Bullet List"
				on:click={() => formatText('insertUnorderedList')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
				</svg>
			</button>
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Numbered List"
				on:click={() => formatText('insertOrderedList')}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01"/>
				</svg>
			</button>
			
			<div class="w-px h-4 bg-gray-300 mx-1"></div>
			
			<!-- Links and images -->
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Insert Link"
				on:click={insertLink}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
				</svg>
			</button>
			
			{#if enableImageUpload}
				<button 
					type="button"
					class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
					title="Insert Image"
					on:click={triggerImageUpload}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
					</svg>
				</button>
			{/if}
			
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Horizontal Rule"
				on:click={insertHorizontalRule}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13H5m14 0a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 13V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
				</svg>
			</button>
			
			<div class="w-px h-4 bg-gray-300 mx-1"></div>
			
			<!-- Clear formatting -->
			<button 
				type="button"
				class="p-1.5 text-gray-700 hover:bg-gray-200 rounded transition-colors" 
				title="Clear Formatting"
				on:click={clearFormatting}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
				</svg>
			</button>
			
			<!-- Voice dictation -->
			{#if enableDictation && supportedSpeechRecognition}
				<div class="w-px h-4 bg-gray-300 mx-1"></div>
				<button 
					type="button"
					class="p-1.5 {isRecording ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-200'} rounded transition-colors" 
					title="{isRecording ? 'Stop Dictation' : 'Start Dictation'}"
					on:click={toggleDictation}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
					</svg>
				</button>
				{#if isRecording}
					<div class="flex items-center ml-1">
						<div class="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-1"></div>
						<span class="text-xs text-red-600">Recording...</span>
					</div>
				{/if}
			{/if}
		</div>
		
		<!-- Image upload form -->
		{#if showImageUpload}
			<div class="p-3 border-b border-gray-300 bg-gray-50">
				<div class="mb-3">
					<p class="text-sm font-medium text-gray-700 mb-2">Upload Image</p>
					<PhotoUploader
						{projectId}
						{noteId}
						{treeId}
						buttonText="Upload Photo"
						buttonVariant="primary"
						showPreview={false}
						multiple={false}
						on:upload={handlePhotoUpload}
					/>
				</div>
				
				<div class="relative my-3">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-gray-50 text-gray-500">or paste URL</span>
					</div>
				</div>
				
				<div class="flex items-center gap-2">
					<input
						type="text"
						bind:value={imageUploadUrl}
						placeholder="Paste image URL here..."
						class="flex-1 input text-sm py-1"
					/>
					<button
						type="button"
						on:click={handleImageUpload}
						class="btn btn-primary btn-sm"
					>
						Insert
					</button>
					<button
						type="button"
						on:click={() => showImageUpload = false}
						class="btn btn-secondary btn-sm"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	{/if}
	
	<!-- Editor content -->
	<div
		bind:this={editorDiv}
		contenteditable={!readonly}
		on:input={handleInput}
		on:paste={handlePaste}
		class="editor-content min-h-[200px] p-4 overflow-y-auto focus:outline-none {readonly ? 'bg-gray-50' : ''}"
		{placeholder}
		data-placeholder={placeholder}
	></div>
	{#if isDirty}
		<div class="p-2 border-t border-gray-300 bg-yellow-50 text-sm text-yellow-700">
			<span class="inline-flex items-center">
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				Unsaved changes
			</span>
		</div>
	{/if}
</div>

<style>
	.rich-text-editor {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
	}
	
	.toolbar button {
		min-width: 32px;
		min-height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	
	.toolbar button:hover {
		background-color: #e5e7eb;
	}
	
	.toolbar button:active {
		background-color: #d1d5db;
	}
	
	.editor-content {
		line-height: 1.6;
	}
	
	.editor-content:empty:before {
		content: attr(data-placeholder);
		color: #9ca3af;
	}
	
	.editor-content:focus {
		outline: none;
	}
	
	.editor-content h1 {
		font-size: 1.875rem;
		font-weight: bold;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}
	
	.editor-content h2 {
		font-size: 1.5rem;
		font-weight: bold;
		margin-top: 0.75rem;
		margin-bottom: 0.5rem;
	}
	
	.editor-content h3 {
		font-size: 1.25rem;
		font-weight: bold;
		margin-top: 0.5rem;
		margin-bottom: 0.25rem;
	}
	
	.editor-content ul, .editor-content ol {
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}
	
	.editor-content ul {
		list-style-type: disc;
	}
	
	.editor-content ol {
		list-style-type: decimal;
	}
	
	.editor-content img {
		max-width: 100%;
		height: auto;
		margin: 0.5rem 0;
		border-radius: 0.25rem;
	}
	
	.editor-content a {
		color: #3b82f6;
		text-decoration: underline;
	}
	
	.editor-content a:hover {
		color: #1d4ed8;
	}
	
	.editor-content hr {
		border: none;
		border-top: 1px solid #d1d5db;
		margin: 1rem 0;
	}
	
	.input {
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
	}
	
	.input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.btn {
		border: 1px solid transparent;
		border-radius: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s, border-color 0.2s;
	}
	
	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}
	
	.btn-primary:hover {
		background-color: #2563eb;
	}
	
	.btn-secondary {
		background-color: #f3f4f6;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.btn-secondary:hover {
		background-color: #e5e7eb;
	}
	
	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}
</style>