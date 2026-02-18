<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { voiceRecordingService } from '$lib/services/unified/VoiceRecordingService';
	import { unifiedIntentEngine } from '$lib/services/unified/UnifiedIntentEngine';
	import { intentFeedbackService } from '$lib/services/unified/IntentFeedbackService';
	import { projectContextStore } from '$lib/services/unified/ProjectContextStore';
	
	export let accessToken: string = '';
	export let projectFolderId: string = '';
	export let projectName: string = '';
	
	const dispatch = createEventDispatcher();
	
	// Mode: 'chat' | 'dictation' | 'voice-note'
	let mode: 'chat' | 'dictation' | 'voice-note' = 'chat';
	
	// Recording states
	let isRecording = false;
	let isProcessing = false;
	let recordingDuration = 0;
	let recordingInterval: ReturnType<typeof setInterval>;
	
	// Transcription
	let transcript = '';
	let finalTranscript = '';
	
	// Summary
	let summary = '';
	let isSummarizing = false;
	
	// Audio playback
	let audioUrl: string | null = null;
	let isPlaying = false;
	let audioElement: HTMLAudioElement | null = null;
	let currentAudioBlob: Blob | null = null;
	
	// Mode switching
	function setMode(newMode: 'chat' | 'dictation' | 'voice-note') {
		if (isRecording) {
			stopRecording();
		}
		mode = newMode;
		dispatch('modeChange', { mode: newMode });
	}
	
	// Start recording using unified service with intent detection
	async function startRecording() {
		try {
			isRecording = true;
			recordingDuration = 0;
			
			// Start recording with intent detection for enhanced voice processing
			const success = await voiceRecordingService.startRecordingWithIntentDetection(
				{
					autoTranscribe: true,
					maxDuration: 60000, // 60 seconds max
				},
				{
					onTranscription: (text: string, isFinal: boolean) => {
						if (mode === 'dictation') {
							if (isFinal) {
								finalTranscript = text;
								transcript = text;
								dispatch('transcript', { text: transcript, final: true });
							} else {
								transcript = text;
								dispatch('transcript', { text: transcript, final: false });
							}
						}
					},
					onIntentDetected: (intentResult: any) => {
						// Display intent feedback in real-time
						if (intentResult && mode === 'voice-note') {
							dispatch('intentDetected', {
								intent: intentResult.intent,
								confidence: intentResult.confidence,
								requiresConfirmation: intentResult.requiresConfirmation
							});
						}
					},
					onError: (error: string) => {
						console.error('Voice recording error:', error);
						dispatch('error', { message: error });
					}
				}
			);
			
			if (!success) {
				throw new Error('Failed to start recording');
			}
			
			// Start duration timer
			recordingInterval = setInterval(() => {
				recordingDuration++;
			}, 1000);
			
		} catch (error) {
			console.error('Error starting recording:', error);
			dispatch('error', { message: 'Could not access microphone. Please check permissions.' });
			isRecording = false;
		}
	}
	
	// Stop recording
	function stopRecording() {
		if (isRecording) {
			voiceRecordingService.stopRecording();
			isRecording = false;
			clearInterval(recordingInterval);
		}
	}
	
	// Process voice note using unified services with enhanced voice processing
	async function processVoiceNote(audioBlob: Blob) {
		isProcessing = true;
		
		try {
			// 1. Transcribe audio
			finalTranscript = await voiceRecordingService.transcribeAudio(audioBlob) || '';
			
			if (finalTranscript) {
				// 2. Process voice transcription with enhanced intent detection
				const intentResult = await unifiedIntentEngine.processVoiceTranscription(finalTranscript, {
					audioBlob,
					duration: recordingDuration * 1000, // Convert to milliseconds
				});
				
				// 3. Get feedback based on intent
				const feedback = intentFeedbackService.getFeedback(intentResult);
				
				// 4. Generate summary using intent context
				summary = await voiceRecordingService.generateSummary(finalTranscript, {
					intent: intentResult.intent,
					confidence: intentResult.confidence,
					entities: intentResult.data?.entities || {}
				}) || '';
				
				// 5. Save to database if in project context
				const projectContext = projectContextStore;
				const currentProjectId = projectContext.currentProjectId;
				
				if (currentProjectId) {
					await voiceRecordingService.saveVoiceNote({
						projectId: currentProjectId,
						audioBlob,
						transcript: finalTranscript,
						summary,
						intent: intentResult.intent,
						metadata: {
							duration: recordingDuration,
							timestamp: new Date(),
							intentConfidence: intentResult.confidence,
							feedback: feedback.message,
							voiceMetadata: intentResult.data?.voiceMetadata || {}
						}
					});
				}
				
				// Store audio blob for playback
				await playAudio(audioBlob);
				
				dispatch('complete', {
					transcript: finalTranscript,
					summary,
					intent: intentResult.intent,
					confidence: intentResult.confidence,
					requiresConfirmation: intentResult.requiresConfirmation,
					feedback: feedback.message,
					voiceData: intentResult.data?.voiceMetadata
				});
			}
		} catch (error) {
			console.error('Error processing voice note:', error);
			dispatch('error', { message: 'Failed to process voice note' });
		} finally {
			isProcessing = false;
		}
	}
	
	// Send message in chat mode with intent analysis
	async function sendMessage(text: string) {
		if (!text.trim()) return;
		
		isProcessing = true;
		
		try {
			// Analyze intent from text
			const intentResult = await unifiedIntentEngine.detectIntent(text);
			
			// Get feedback
			const feedback = intentFeedbackService.getFeedback(intentResult);
			
			// Dispatch with intent context
			dispatch('send', { 
				message: text,
				intent: intentResult.intent,
				confidence: intentResult.confidence,
				entities: intentResult.entities,
				feedback: feedback.message
			});
		} catch (error) {
			console.error('Error analyzing intent:', error);
			// Fall back to simple message dispatch
			dispatch('send', { message: text });
		} finally {
			isProcessing = false;
		}
	}
	
	// Format duration
	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
	
	// Reset everything
	function reset() {
		transcript = '';
		finalTranscript = '';
		summary = '';
		recordingDuration = 0;
		
		// Clean up audio URL
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
			audioUrl = null;
		}
		
		// Stop audio playback
		if (audioElement) {
			audioElement.pause();
			audioElement = null;
		}
		
		// Clear audio blob
		currentAudioBlob = null;
		isPlaying = false;
	}

	// Play audio from blob
	async function playAudio(audioBlob: Blob) {
		// Clean up previous audio
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}
		if (audioElement) {
			audioElement.pause();
		}
		
		// Store the blob for later use
		currentAudioBlob = audioBlob;
		
		// Create new audio URL and element
		audioUrl = URL.createObjectURL(audioBlob);
		audioElement = new Audio(audioUrl);
		
		audioElement.onplay = () => {
			isPlaying = true;
		};
		
		audioElement.onpause = () => {
			isPlaying = false;
		};
		
		audioElement.onended = () => {
			isPlaying = false;
		};
		
		try {
			await audioElement.play();
		} catch (error) {
			console.error('Error playing audio:', error);
			isPlaying = false;
		}
	}
	
	// Pause audio
	function pauseAudio() {
		if (audioElement) {
			audioElement.pause();
			isPlaying = false;
		}
	}
	
	// Stop audio
	function stopAudio() {
		if (audioElement) {
			audioElement.pause();
			audioElement.currentTime = 0;
			isPlaying = false;
		}
	}

	onDestroy(() => {
		if (isRecording) {
			stopRecording();
		}
		if (recordingInterval) {
			clearInterval(recordingInterval);
		}
		
		// Clean up audio URL
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}
		
		// Clean up audio element
		if (audioElement) {
			audioElement.pause();
			audioElement = null;
		}
	});
</script>

<div class="voice-input-container">
	<!-- Mode Selector -->
	<div class="mode-selector">
		<button 
			class="mode-btn" 
			class:active={mode === 'chat'}
			on:click={() => setMode('chat')}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
			</svg>
			Chat
		</button>
		<button 
			class="mode-btn" 
			class:active={mode === 'dictation'}
			on:click={() => setMode('dictation')}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
			</svg>
			Dictation
		</button>
		<button 
			class="mode-btn" 
			class:active={mode === 'voice-note'}
			on:click={() => setMode('voice-note')}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
			</svg>
			Voice Note
		</button>
	</div>

	<!-- Recording Indicator -->
	{#if isRecording}
		<div class="recording-indicator" transition:fade>
			<div class="recording-pulse"></div>
			<span class="recording-time">{formatDuration(recordingDuration)}</span>
			<span class="recording-label">
				{mode === 'dictation' ? 'Listening...' : 'Recording...'}
			</span>
		</div>
	{/if}

	<!-- Processing Indicator -->
	{#if isProcessing}
		<div class="processing-indicator" transition:fade>
			<div class="spinner"></div>
			<span>
				{mode === 'dictation' ? 'Transcribing...' : 'Processing voice note...'}
			</span>
		</div>
	{/if}

	<!-- Dictation Mode UI -->
	{#if mode === 'dictation'}
		<div class="dictation-container" transition:slide>
			{#if transcript}
				<div class="transcript-preview">
					<p>{transcript}</p>
				</div>
			{/if}
			
			<div class="dictation-actions">
				<button 
					class="record-btn" 
					class:recording={isRecording}
					on:click={() => isRecording ? stopRecording() : startRecording()}
					disabled={isProcessing}
				>
					{#if isRecording}
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<rect x="6" y="6" width="12" height="12" rx="2"/>
						</svg>
					{:else}
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
						</svg>
					{/if}
				</button>
				
				{#if transcript && !isRecording}
					<button class="send-btn" on:click={() => sendMessage(transcript)}>
						Send Message
					</button>
					<button class="clear-btn" on:click={() => { transcript = ''; }}>
						Clear
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Voice Note Mode UI -->
	{#if mode === 'voice-note'}
		<div class="voice-note-container" transition:slide>
			{#if finalTranscript}
				<div class="transcript-section">
					<h4>Transcript</h4>
					<p>{finalTranscript}</p>
				</div>
			{/if}
			
			{#if summary}
				<div class="summary-section">
					<h4>AI Summary</h4>
					<p>{summary}</p>
				</div>
			{/if}
			
			<!-- Audio Playback Section -->
			{#if audioUrl && finalTranscript}
				<div class="audio-preview">
					<h4>Audio Playback</h4>
					<div class="audio-controls">
						<button
							class="audio-btn"
							on:click={() => isPlaying ? pauseAudio() : currentAudioBlob && playAudio(currentAudioBlob)}
							disabled={!audioUrl || !currentAudioBlob}
						>
							{#if isPlaying}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<rect x="6" y="4" width="4" height="16" rx="1"/>
									<rect x="14" y="4" width="4" height="16" rx="1"/>
								</svg>
								Pause
							{:else}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<polygon points="5,4 19,12 5,20" />
								</svg>
								Play
							{/if}
						</button>
						
						<button
							class="audio-btn secondary"
							on:click={stopAudio}
							disabled={!audioUrl || !isPlaying}
						>
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<rect x="4" y="4" width="16" height="16" rx="2"/>
							</svg>
							Stop
						</button>
						
						<span class="audio-hint">
							{#if isPlaying}
								Playing...
							{:else}
								Ready to play
							{/if}
						</span>
					</div>
				</div>
			{/if}
			
			<div class="voice-note-actions">
				{#if !isRecording && !finalTranscript}
					<button
						class="record-btn large"
						on:click={startRecording}
						disabled={isProcessing}
					>
						<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
						</svg>
						<span>Start Recording</span>
					</button>
				{/if}
				
				{#if isRecording}
					<button
						class="record-btn large recording"
						on:click={stopRecording}
					>
						<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
							<rect x="6" y="6" width="12" height="12" rx="2"/>
						</svg>
						<span>Stop Recording</span>
					</button>
				{/if}
				
				{#if finalTranscript}
					<button class="save-btn" on:click={reset}>
						New Recording
					</button>
					
					<button class="discard-btn" on:click={reset}>
						Discard
					</button>
				{/if}
			</div>
			
			{#if !isRecording && !finalTranscript}
				<p class="hint">Record a voice note to transcribe and summarize</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.voice-input-container {
		background: white;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.mode-selector {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #e5e7eb;
	}

	.mode-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: white;
		color: #6b7280;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.mode-btn:hover {
		background: #f9fafb;
	}

	.mode-btn.active {
		background: #2f5233;
		color: white;
		border-color: #2f5233;
	}

	.recording-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		background: #fef2f2;
		border-radius: 8px;
		margin-bottom: 12px;
	}

	.recording-pulse {
		width: 12px;
		height: 12px;
		background: #ef4444;
		border-radius: 50%;
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.recording-time {
		font-family: monospace;
		font-size: 14px;
		color: #ef4444;
	}

	.recording-label {
		font-size: 13px;
		color: #6b7280;
	}

	.processing-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		background: #eff6ff;
		border-radius: 8px;
		margin-bottom: 12px;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #3b82f6;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.dictation-container,
	.voice-note-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.transcript-preview {
		padding: 12px;
		background: #f9fafb;
		border-radius: 8px;
		max-height: 120px;
		overflow-y: auto;
	}

	.transcript-preview p {
		font-size: 14px;
		line-height: 1.5;
		color: #374151;
	}

	.dictation-actions,
	.voice-note-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.record-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 50%;
		background: #2f5233;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.record-btn:hover {
		background: #234026;
	}

	.record-btn.recording {
		background: #ef4444;
	}

	.record-btn.large {
		width: 80px;
		height: 80px;
		flex-direction: column;
		gap: 8px;
		border-radius: 16px;
	}

	.record-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.send-btn,
	.transcribe-btn,
	.summarize-btn,
	.save-btn {
		padding: 10px 16px;
		border: none;
		border-radius: 8px;
		background: #2f5233;
		color: white;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.send-btn:hover,
	.transcribe-btn:hover,
	.summarize-btn:hover,
	.save-btn:hover {
		background: #234026;
	}

	.clear-btn,
	.discard-btn {
		padding: 10px 16px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: white;
		color: #6b7280;
		font-size: 14px;
		cursor: pointer;
	}

	.clear-btn:hover,
	.discard-btn:hover {
		background: #f9fafb;
	}

	.record-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24px;
		gap: 12px;
	}

	.hint {
		font-size: 13px;
		color: #6b7280;
	}
	
	.audio-preview {
		padding: 16px;
		background: #f9fafb;
		border-radius: 8px;
		margin-bottom: 12px;
	}
	
	.audio-preview h4 {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
		margin-bottom: 12px;
	}
	
	.audio-controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.audio-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: none;
		border-radius: 8px;
		background: #2f5233;
		color: white;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.audio-btn:hover {
		background: #234026;
	}
	
	.audio-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.audio-btn.secondary {
		background: #6b7280;
	}
	
	.audio-btn.secondary:hover {
		background: #4b5563;
	}
	
	.audio-hint {
		font-size: 13px;
		color: #6b7280;
		margin-left: auto;
	}

	.transcript-section,
	.summary-section {
		padding: 12px;
		background: #f9fafb;
		border-radius: 8px;
	}

	.transcript-section h4,
	.summary-section h4 {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
		margin-bottom: 8px;
	}

	.transcript-section p,
	.summary-section p {
		font-size: 14px;
		line-height: 1.5;
		color: #6b7280;
	}
</style>
