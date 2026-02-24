<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';
	import { getSpeechRecognition } from '$lib/services/voiceDictation';
	import { getHint, shortenHintForMobile } from './hintEngine';
	import { copilotContext, updateInputEmpty } from './copilotContext';
	
	const emit = createEventDispatcher();
	
	let inputValue = '';
	let isRecording = false;
	let speechRecognition: any = null;
	
	// Reactive hint based on copilot context
	$: hint = getHint($copilotContext);
	
	// Apply mobile shortening if needed
	$: finalHint = $copilotContext.isMobile ? shortenHintForMobile(hint) : hint;
	
	// Update input empty state when inputValue changes
	$: updateInputEmpty(!inputValue.trim());
	
	// Get placeholder text: show hint only when input is empty
	$: placeholder = inputValue.trim() ? '' : finalHint;
	
	function handleSubmit() {
		if (inputValue.trim()) {
			emit('promptSubmit', { text: inputValue.trim() });
			inputValue = '';
		}
	}
	
	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
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
				</div>
			</div>
			
			<!-- Action buttons -->
			<div class="flex items-center gap-2">
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
					on:click={handleSubmit}
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

<style>
	/* Hide on mobile - mobile has its own bar */
	@media (max-width: 768px) {
		div {
			display: none;
		}
	}
</style>
