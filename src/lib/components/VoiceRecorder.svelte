<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { voiceRecordingService } from '$lib/services/unified/VoiceRecordingService';
	import { intentFeedbackService } from '$lib/services/unified/IntentFeedbackService';

	export let projectId: string;

	const dispatch = createEventDispatcher();

	let isRecording = false;
	let isProcessing = false;
	let recordingTime = 0;
	let error = '';
	let timerInterval: number | null = null;

	// Visual feedback
	let audioLevel = 0;
	let animationFrame: number | null = null;

	onMount(() => {
		// Check if getUserMedia is supported
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			error = 'Voice recording is not supported in this browser.';
		}
	});

	onDestroy(() => {
		stopRecording();
		if (timerInterval) clearInterval(timerInterval);
		if (animationFrame) cancelAnimationFrame(animationFrame);
	});

	async function startRecording() {
		error = '';
		console.log('VoiceRecorder: Starting recording...');
		
		try {
			// Use unified voice recording service
			const started = await voiceRecordingService.startRecording({
				maxDuration: 300000, // 5 minutes in milliseconds
				autoTranscribe: false
			});
			
			if (!started) {
				throw new Error('Failed to start recording');
			}
			
			// Show feedback
			intentFeedbackService.showVoiceRecording('started');
			
			isRecording = true;
			recordingTime = 0;
			console.log('VoiceRecorder: Recording started successfully');

			// Start timer
			timerInterval = setInterval(() => {
				recordingTime++;
				// Update audio level for visualization
				audioLevel = voiceRecordingService.getAudioLevel() / 100;
				
				// Max 5 minutes
				if (recordingTime >= 300) {
					stopRecording();
				}
			}, 1000);
			
			// Start visualization
			visualize();

		} catch (err) {
			console.error('VoiceRecorder: Failed to start recording:', err);
			if (err instanceof Error) {
				if (err.name === 'NotAllowedError') {
					error = 'Microphone access denied. Please allow microphone access in your browser settings.';
				} else if (err.name === 'NotFoundError') {
					error = 'No microphone found. Please connect a microphone and try again.';
				} else {
					error = `Failed to start recording: ${err.message}`;
				}
			} else {
				error = 'Failed to start recording. Please check your microphone permissions.';
			}
			
			// Show error feedback
			intentFeedbackService.showVoiceRecording('error', error);
		}
	}

	function stopRecording() {
		if (!isRecording) return;
		
		// Stop recording using unified service
		voiceRecordingService.stopRecording().then(async (result) => {
			if (result.success && result.audioBlob) {
				// Show feedback
				intentFeedbackService.showVoiceRecording('stopped');
				
				// Process the audio
				await processAudio(result.audioBlob);
			} else {
				error = result.error || 'Recording failed';
				intentFeedbackService.showVoiceRecording('error', error);
			}
		}).catch(err => {
			console.error('Error stopping recording:', err);
			error = 'Failed to stop recording';
			intentFeedbackService.showVoiceRecording('error', error);
		});
		
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
		
		isRecording = false;
	}

	async function processAudio(audioBlob: Blob) {
		console.log('VoiceRecorder: Processing audio, blob size:', audioBlob.size);
		if (audioBlob.size < 100) {
			error = 'Recording too short. Please try again.';
			console.log('VoiceRecorder: Recording too short');
			return;
		}

		isProcessing = true;
		error = '';
		console.log('VoiceRecorder: Starting transcription...');
		
		// Show processing feedback
		intentFeedbackService.showVoiceRecording('processing');

		try {
			console.log('VoiceRecorder: Calling transcribeAudio...');
			const transcript = await voiceRecordingService.transcribeAudio(audioBlob);
			console.log('VoiceRecorder: Transcription result length:', transcript?.length || 0);
			
			if (transcript && transcript.trim()) {
				console.log('VoiceRecorder: Transcription successful, text length:', transcript.length);
				// Dispatch the transcribed text to parent
				dispatch('transcript', {
					text: transcript.trim(),
					projectId
				});
			} else {
				error = 'No speech detected in recording. Please try again.';
				console.log('VoiceRecorder: No speech detected');
				intentFeedbackService.showVoiceRecording('error', error);
			}
		} catch (err) {
			console.error('VoiceRecorder: Transcription error:', err);
			if (err instanceof Error) {
				error = err.message;
				console.log('VoiceRecorder: Error message:', err.message);
			} else {
				error = 'Transcription failed. Please try again.';
			}
			intentFeedbackService.showVoiceRecording('error', error);
		} finally {
			isProcessing = false;
			recordingTime = 0;
			console.log('VoiceRecorder: Processing complete');
		}
	}

	function visualize() {
		// Update audio level from service
		if (isRecording) {
			audioLevel = voiceRecordingService.getAudioLevel() / 100;
			animationFrame = requestAnimationFrame(visualize);
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="voice-recorder">
	{#if error}
		<div class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
			<p class="text-sm text-red-700">{error}</p>
		</div>
	{/if}

	<div class="flex items-center gap-4">
		<!-- Record Button -->
		<button
			type="button"
			on:click={isRecording ? stopRecording : startRecording}
			disabled={isProcessing || !navigator.mediaDevices}
			class="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
				   {isRecording 
					   ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
					   : 'bg-forest-600 hover:bg-forest-700'}
				   {isProcessing ? 'opacity-50 cursor-not-allowed' : ''}"
		>
			{#if isRecording}
				<!-- Stop icon -->
				<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
					<rect x="6" y="6" width="12" height="12" rx="2" />
				</svg>
			{:else if isProcessing}
				<!-- Loading spinner -->
				<svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			{:else}
				<!-- Microphone icon -->
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
				</svg>
			{/if}
			
			<!-- Audio level indicator -->
			{#if isRecording}
				<span 
					class="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-50"
				></span>
			{/if}
		</button>

		<!-- Status / Timer -->
		<div class="flex-1">
			{#if isProcessing}
				<div class="flex items-center gap-2">
					<span class="text-amber-600 font-medium">Transcribing...</span>
					<svg class="w-4 h-4 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
					</svg>
				</div>
			{:else if isRecording}
				<div class="flex items-center gap-3">
					<span class="text-red-600 font-bold animate-pulse">Recording</span>
					<span class="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
						{formatTime(recordingTime)}
					</span>
				</div>
				<!-- Audio level bar -->
				<div class="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
					<div 
						class="h-full bg-red-500 transition-all duration-100"
						style="width: {audioLevel * 100}%"
					></div>
				</div>
			{:else}
				<p class="text-gray-600 text-sm">
					Click to start recording a voice note
				</p>
			{/if}
		</div>
	</div>

	{#if isRecording}
		<p class="text-xs text-gray-500 mt-2">
			Recording... Click the button again to stop. Max 5 minutes.
		</p>
	{/if}
</div>

<style>
	.voice-recorder {
		width: 100%;
	}
</style>
