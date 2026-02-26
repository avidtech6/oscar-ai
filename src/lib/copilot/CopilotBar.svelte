<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';
	import { getSpeechRecognition } from '$lib/services/voiceDictation';
	import { getHintForContext, shortenHintForMobile } from './hints/hintEngine';
	import { copilotContext, updateInputEmpty } from './copilotContext';
	import { clearFollowUps } from './followUpStore';
	import { pdfExtractionService } from './pdfExtractionService';
	import { sanitizePrompt, ensureAppReady } from './sanitizeInput';
	import { onMount, onDestroy } from 'svelte';
	import { debugStore } from '$lib/stores/debugStore';

	const emit = createEventDispatcher();

	let inputValue = '';
	let isRecording = false;
	let speechRecognition: any = null;
	let isUploadingPdf = false;
	let uploadProgress = 0;

	// Keyboard visibility detection
	let keyboardHeight = 0;
	let isKeyboardVisible = false;

	function updateKeyboardHeight() {
		if (typeof window === 'undefined' || !window.visualViewport) return;
		const viewport = window.visualViewport;
		// Keyboard height is the difference between window innerHeight and visualViewport height
		const diff = window.innerHeight - viewport.height;
		keyboardHeight = diff > 50 ? diff : 0; // threshold to avoid small differences
		isKeyboardVisible = keyboardHeight > 0;
		// Update CSS custom property for styling
		document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
		if (isKeyboardVisible) {
			document.documentElement.classList.add('keyboard-open');
		} else {
			document.documentElement.classList.remove('keyboard-open');
		}
	}

	// Reactive hint based on copilot context
	$: hint = getHintForContext($copilotContext);

	// Apply mobile shortening if needed
	$: finalHint = $copilotContext.isMobile ? shortenHintForMobile(hint) : hint;

	// Update input empty state when inputValue changes
	$: updateInputEmpty(!inputValue.trim());

	// Get placeholder text: show hint only when input is empty
	$: placeholder = inputValue.trim() ? '' : finalHint;
	
	// Debug logging for input changes
	$: debugStore.log('CopilotBar', 'inputValue updated', { value: inputValue, trimmed: inputValue.trim() });
	
	async function handleSubmit() {
		debugStore.log('CopilotBar', 'handleSubmit called', { inputValue });
		console.log('CopilotBar: handleSubmit called, inputValue:', inputValue);
		// DEBUG: Alert to confirm submit is triggered
		if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
			alert(`CopilotBar: Submitting "${inputValue}"`);
		}
		// Check app readiness
		const isReady = await ensureAppReady();
		if (!isReady) {
			debugStore.log('CopilotBar', 'App not ready', { isReady });
			console.warn('CopilotBar: App not ready, cannot process input');
			// Show user feedback
			alert('Please wait for the application to finish loading before sending messages.');
			return;
		}
		
		// Sanitize input
		const sanitizedInput = sanitizePrompt(inputValue);
		if (!sanitizedInput) {
			debugStore.log('CopilotBar', 'Empty input after sanitization', { inputValue });
			console.warn('CopilotBar: Empty input after sanitization');
			return;
		}
		
		debugStore.log('CopilotBar', 'Sending sanitized prompt', { sanitizedInput });
		console.log('CopilotBar: Sending sanitized prompt:', sanitizedInput.substring(0, 50) + (sanitizedInput.length > 50 ? '...' : ''));
		console.log('CopilotBar: Emitting promptSubmit event');
		emit('promptSubmit', { text: sanitizedInput });
		
		// Clear follow‑up suggestions when user sends a message
		clearFollowUps();
		
		inputValue = '';
	}

	async function handleClick() {
		debugStore.log('CopilotBar', 'button clicked', { inputValue });
		console.log('CopilotBar: button clicked');
		await handleSubmit();
	}
	
	async function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			await handleSubmit();
		}
	}
	
	async function startVoiceDictation() {
		if (isRecording) {
			stopVoiceDictation();
			return;
		}
		
		try {
			speechRecognition = getSpeechRecognition();
			
			if (!speechRecognition) {
				alert('Speech recognition is not supported in your browser');
				return;
			}
			
			speechRecognition.onresult = (event: any) => {
				const transcript = event.results[0][0].transcript;
				inputValue = transcript;
				isRecording = false;
			};
			
			speechRecognition.onerror = (event: any) => {
				console.error('Speech recognition error:', event.error);
				isRecording = false;
			};
			
			speechRecognition.onend = () => {
				isRecording = false;
			};
			
			speechRecognition.start();
			isRecording = true;
		} catch (error) {
			console.error('Error starting voice dictation:', error);
			isRecording = false;
		}
	}
	
	function stopVoiceDictation() {
		if (speechRecognition) {
			speechRecognition.stop();
		}
		isRecording = false;
	}
	
	function openVoiceNote() {
		emit('openVoiceNote');
	}
	
	// PDF upload functionality
	async function handlePdfUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		
		if (!files || files.length === 0) {
			return;
		}
		
		const file = files[0];
		isUploadingPdf = true;
		uploadProgress = 0;
		
		try {
			// Simulate progress
			const progressInterval = setInterval(() => {
				uploadProgress = Math.min(uploadProgress + 10, 90);
			}, 100);
			
			// Extract PDF
			const result = await pdfExtractionService.extractPdf({
				file,
				project: $copilotContext.selectedProject,
				options: {
					extractText: true,
					detectTables: true,
					maxPages: 10
				}
			});
			
			clearInterval(progressInterval);
			uploadProgress = 100;
			
			if (result.success) {
				// Emit PDF extraction event
				emit('pdfExtracted', {
					file,
					result: result.result,
					metadata: result.metadata
				});
				
				// Auto-fill input with extraction summary
				const summary = `Extracted PDF: ${result.metadata?.filename || file.name}. ${result.result?.stats?.pageCount || 0} pages, ${result.result?.stats?.textLength || 0} characters.`;
				inputValue = summary;
				
				// Show success message
				console.log('PDF extraction successful:', result.metadata);
			} else {
				// Show error
				inputValue = `Failed to extract PDF: ${result.error}`;
				console.error('PDF extraction failed:', result.error);
			}
			
		} catch (error) {
			console.error('PDF upload error:', error);
			inputValue = `Error uploading PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			setTimeout(() => {
				isUploadingPdf = false;
				uploadProgress = 0;
			}, 1000);
			
			// Reset file input
			input.value = '';
		}
	}
	
	function triggerPdfUpload() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.pdf,application/pdf';
		input.style.display = 'none';
		input.onchange = handlePdfUpload;
		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
	}
	
	// Listen for follow‑up action events
	function handleFollowUpAction(event: CustomEvent) {
		const actionText = event.detail.action;
		if (actionText) {
			// Insert the follow‑up action text into the input
			inputValue = actionText;
			
			// Focus the input field
			const input = document.querySelector('input[type="text"]') as HTMLInputElement;
			if (input) {
				input.focus();
			}
		}
	}
	
	// Listen for insight action events
	function handleInsightAction(event: CustomEvent) {
		const actionText = event.detail.action;
		if (actionText) {
			// Insert the insight action text into the input
			inputValue = actionText;
			
			// Focus the input field
			const input = document.querySelector('input[type="text"]') as HTMLInputElement;
			if (input) {
				input.focus();
			}
		}
	}
	
	// Listen for PDF extraction events
	function handlePdfExtractionEvent(event: CustomEvent) {
		const { file, result, metadata } = event.detail;
		console.log('PDF extraction event received:', metadata);
		
		// Update input with extraction summary
		if (result && metadata) {
			inputValue = `Extracted PDF: ${metadata.filename}. ${result.stats?.pageCount || 0} pages, ${result.stats?.textLength || 0} characters.`;
		}
	}
	
	// Listen for triggerPdfUpload events from QuickActions
	function handleTriggerPdfUpload(event: CustomEvent) {
		const { projectId, source } = event.detail || {};
		console.log('Trigger PDF upload received from:', source, 'for project:', projectId);
		
		// Trigger the PDF upload
		triggerPdfUpload();
	}
	
	// Set up event listeners on mount
	onMount(() => {
		console.log('CopilotBar: mounted');
		debugStore.log('CopilotBar', 'mounted');
		window.addEventListener('followUpAction', handleFollowUpAction as EventListener);
		window.addEventListener('insightAction', handleInsightAction as EventListener);
		window.addEventListener('pdfExtracted', handlePdfExtractionEvent as EventListener);
		window.addEventListener('triggerPdfUpload', handleTriggerPdfUpload as EventListener);
		
		// Keyboard detection
		if (typeof window !== 'undefined' && window.visualViewport) {
			window.visualViewport.addEventListener('resize', updateKeyboardHeight);
			window.visualViewport.addEventListener('scroll', updateKeyboardHeight);
			// Initial update
			updateKeyboardHeight();
		}
		
		return () => {
			console.log('CopilotBar: unmounting');
			window.removeEventListener('followUpAction', handleFollowUpAction as EventListener);
			window.removeEventListener('insightAction', handleInsightAction as EventListener);
			window.removeEventListener('pdfExtracted', handlePdfExtractionEvent as EventListener);
			window.removeEventListener('triggerPdfUpload', handleTriggerPdfUpload as EventListener);
			
			if (typeof window !== 'undefined' && window.visualViewport) {
				window.visualViewport.removeEventListener('resize', updateKeyboardHeight);
				window.visualViewport.removeEventListener('scroll', updateKeyboardHeight);
			}
		};
	});
</script>

<div class="w-full h-16 bg-white border-t border-gray-200">
	<div class="h-full px-6">
		<div class="flex items-center justify-between h-full gap-4">
			<!-- Input field -->
			<div class="flex-1 max-w-3xl">
				<div class="relative">
					<input
						type="text"
						bind:value={inputValue}
						placeholder={placeholder}
						class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-500"
						on:keydown={handleInputKeydown}
					/>
					<!-- Mic button inside input (desktop only) -->
					<button
						on:click={startVoiceDictation}
						class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 transition-colors"
						title={isRecording ? 'Stop recording' : 'Start voice dictation'}
					>
						{#if isRecording}
							<svg class="w-5 h-5 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
							</svg>
						{:else}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
							</svg>
						{/if}
					</button>
					
					<!-- PDF upload progress indicator -->
					{#if isUploadingPdf}
						<div class="absolute -bottom-1 left-0 right-0">
							<div class="h-1 bg-blue-200 rounded-full overflow-hidden">
								<div
									class="h-full bg-blue-600 transition-all duration-300"
									style={`width: ${uploadProgress}%`}
								></div>
							</div>
							<div class="text-xs text-gray-500 text-center mt-1">
								Extracting PDF... {uploadProgress}%
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Action buttons -->
			<div class="flex items-center gap-2">
				<!-- PDF upload button -->
				<button
					on:click={triggerPdfUpload}
					class="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
					title="Upload and extract PDF"
					disabled={isUploadingPdf}
				>
					{#if isUploadingPdf}
						<svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					{/if}
				</button>
				
				<!-- Voice note button (waveform icon) -->
				<button
					on:click={openVoiceNote}
					class="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
					title="Record voice note"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
					</svg>
				</button>
				
				<!-- Send button -->
				<button
					on:click={handleClick}
					disabled={!inputValue.trim()}
					class="p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					title="Send message"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- <style>
/* Universal prompt bar keyboard handling */
:root {
	--keyboard-height: 0px;
}

/* Mobile-optimized styling */
@media (max-width: 768px) {
	/* Make the CopilotBar fixed at the bottom on mobile */
	div.w-full.h-16.bg-white.border-t.border-gray-200 {
		position: fixed;
		bottom: var(--keyboard-height, 0);
		left: 0;
		right: 0;
		z-index: 100;
		transition: bottom 0.3s ease;
		/* Ensure it stays above other content */
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	}
	
	/* The layout already provides padding for the bottom bar */
	
	div {
		height: auto;
		padding: 8px 12px;
	}
	
	.h-full {
		height: auto;
	}
	
	.px-6 {
		padding-left: 12px;
		padding-right: 12px;
	}
	
	.gap-4 {
		gap: 8px;
	}
	
	.max-w-3xl {
		max-width: 100%;
	}
	
	.p-3 {
		padding: 8px;
	}
	
	/* Make buttons more touch-friendly */
	button {
		min-height: 44px;
		min-width: 44px;
	}
	
	/* Adjust input for mobile */
	input[type="text"] {
		font-size: 16px; /* Prevents iOS zoom on focus */
		padding: 12px 40px 12px 12px;
	}
	
	/* PDF upload progress indicator mobile adjustments */
	.absolute.-bottom-1 {
		bottom: -4px;
	}
	
	.text-xs {
		font-size: 10px;
	}
	
	/* Improve mobile layout for action buttons */
	.flex.items-center.gap-2 {
		flex-shrink: 0;
	}
	
	/* Ensure proper spacing on very small screens */
	@media (max-width: 480px) {
		.px-6 {
			padding-left: 8px;
			padding-right: 8px;
		}
		
		.gap-4 {
			gap: 6px;
		}
		
		/* Hide voice note button on very small screens */
		button[title="Record voice note"] {
			display: none;
		}
		
		/* Adjust input padding for mic button */
		input[type="text"] {
			padding-right: 36px;
		}
	}
	
	/* Improve mic button positioning on mobile */
	.absolute.right-2 {
		right: 6px;
	}
	
	/* Ensure CopilotBar doesn't overlap with mobile keyboard */
	@media (max-height: 600px) {
		div {
			padding: 6px 8px;
		}
		
		input[type="text"] {
			padding: 10px 36px 10px 10px;
		}
	}
}
</style> -->
