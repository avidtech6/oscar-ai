<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	let isRecording = false;
	let isProcessing = false;
	let error = '';
	let recognition: SpeechRecognition | null = null;
	let finalTranscript = '';
	let interimTranscript = '';
	let stream: MediaStream | null = null;
	
	// Check for browser support
	const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
	const isSpeechSupported = !!SpeechRecognitionAPI;

	onDestroy(() => {
		if (recognition) {
			recognition.stop();
		}
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
		}
	});

	async function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			await startRecording();
		}
	}
	
	async function startRecording() {
		error = '';
		
		if (!isSpeechSupported) {
			error = 'Speech recognition not supported in this browser';
			return;
		}
		
		try {
			// Request microphone access
			stream = await navigator.mediaDevices.getUserMedia({ 
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				} 
			});
			
			// Create speech recognition instance
			recognition = new SpeechRecognitionAPI();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'en-US';
			
			recognition.onstart = () => {
				isRecording = true;
				finalTranscript = '';
				interimTranscript = '';
			};
			
			recognition.onresult = (event) => {
				interimTranscript = '';
				
				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						finalTranscript += transcript + ' ';
					} else {
						interimTranscript += transcript;
					}
				}
				
				// Dispatch real-time transcription
				if (finalTranscript || interimTranscript) {
					dispatch('transcript', { 
						text: finalTranscript + interimTranscript,
						isFinal: event.results[event.results.length - 1].isFinal
					});
				}
			};
			
			recognition.onerror = (event) => {
				console.error('Speech recognition error:', event.error);
				if (event.error === 'not-allowed') {
					error = 'Microphone access denied';
				} else if (event.error === 'no-speech') {
					error = 'No speech detected';
				} else {
					error = event.error;
				}
				stopRecording();
			};
			
			recognition.onend = () => {
				if (isRecording) {
					// Restart if still supposed to be recording
					try {
						recognition?.start();
					} catch (e) {
						console.error('Failed to restart recognition:', e);
					}
				}
			};
			
			recognition.start();
			
		} catch (err) {
			console.error('Failed to start recording:', err);
			if (err instanceof Error) {
				if (err.name === 'NotAllowedError') {
					error = 'Microphone access denied';
				} else if (err.name === 'NotFoundError') {
					error = 'No microphone found';
				} else {
					error = err.message;
				}
			}
		}
	}
	
	function stopRecording() {
		if (recognition) {
			recognition.stop();
			recognition = null;
		}
		
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			stream = null;
		}
		
		isRecording = false;
		
		// Dispatch final transcript if any
		if (finalTranscript.trim()) {
			dispatch('transcript', { text: finalTranscript.trim(), isFinal: true });
		}
	}
</script>

<button
	type="button"
	on:click={toggleRecording}
	disabled={isProcessing || !isSpeechSupported}
	class="p-2 rounded-lg transition-colors flex-shrink-0
		{isRecording 
			? 'bg-red-500 text-white animate-pulse' 
			: isProcessing
				? 'bg-gray-200 text-gray-400'
				: 'text-gray-500 hover:text-green-700 hover:bg-gray-100'}"
	title={isRecording ? 'Stop recording' : isSpeechSupported ? 'Voice input' : 'Voice input not supported'}
>
	{#if isProcessing}
		<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
		</svg>
	{:else if isRecording}
		<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
			<rect x="6" y="6" width="12" height="12" rx="2" />
		</svg>
	{:else}
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
		</svg>
	{/if}
</button>

{#if error}
	<span class="text-xs text-red-500 ml-2">{error}</span>
{/if}

{#if isRecording}
	<span class="text-xs text-red-500 ml-2 animate-pulse">Listening...</span>
{/if}