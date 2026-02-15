<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	
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
	
	// Audio
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let audioBlob: Blob | null = null;
	let audioUrl: string = '';
	
	// Transcription
	let transcript = '';
	let finalTranscript = '';
	
	// Summary
	let summary = '';
	let isSummarizing = false;
	
	// Mode switching
	function setMode(newMode: 'chat' | 'dictation' | 'voice-note') {
		if (isRecording) {
			stopRecording();
		}
		mode = newMode;
		dispatch('modeChange', { mode: newMode });
	}
	
	// Start recording
	async function startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			
			mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'audio/webm;codecs=opus'
			});
			
			audioChunks = [];
			
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};
			
			mediaRecorder.onstop = async () => {
				audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				audioUrl = URL.createObjectURL(audioBlob);
				
				if (mode === 'dictation') {
					await transcribeAudio();
				}
				
				// Stop all tracks
				stream.getTracks().forEach(track => track.stop());
			};
			
			// Start recording
			if (mode === 'dictation') {
				// For dictation, record in chunks for real-time transcription
				mediaRecorder.start(2000); // Send chunks every 2 seconds
			} else {
				// For voice notes, record continuously
				mediaRecorder.start(1000);
			}
			
			isRecording = true;
			recordingDuration = 0;
			
			recordingInterval = setInterval(() => {
				recordingDuration++;
			}, 1000);
			
		} catch (error) {
			console.error('Error starting recording:', error);
			dispatch('error', { message: 'Could not access microphone. Please check permissions.' });
		}
	}
	
	// Stop recording
	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
			clearInterval(recordingInterval);
		}
	}
	
	// Transcribe audio using Whisper
	async function transcribeAudio() {
		if (!audioBlob) return;
		
		isProcessing = true;
		
		try {
			const formData = new FormData();
			formData.append('audio', audioBlob, 'audio.webm');
			
			const response = await fetch('/api/whisper/transcribe', {
				method: 'POST',
				body: formData
			});
			
			const data = await response.json();
			
			if (data.success && data.text) {
				if (mode === 'dictation') {
					transcript += ' ' + data.text;
					dispatch('transcript', { text: transcript, final: false });
				} else {
					finalTranscript = data.text;
				}
			} else {
				console.error('Transcription failed:', data.error);
				dispatch('error', { message: 'Transcription failed' });
			}
		} catch (error) {
			console.error('Transcription error:', error);
			dispatch('error', { message: 'Failed to transcribe audio' });
		} finally {
			isProcessing = false;
		}
	}
	
	// Upload audio to Google Drive
	async function uploadToDrive(): Promise<string | null> {
		if (!audioBlob || !accessToken || !projectFolderId) {
			return null;
		}
		
		try {
			const response = await fetch('/api/drive/upload-audio', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${accessToken}`
				},
				body: (() => {
					const formData = new FormData();
					formData.append('audio', audioBlob, 'voice-note.webm');
					formData.append('folderId', projectFolderId);
					formData.append('projectName', projectName || 'Voice Note');
					return formData;
				})()
			});
			
			const data = await response.json();
			return data.fileId || null;
		} catch (error) {
			console.error('Upload error:', error);
			return null;
		}
	}
	
	// Save transcript to Drive
	async function saveTranscriptToDrive(audioFileId: string): Promise<string | null> {
		if (!finalTranscript || !accessToken || !projectFolderId) {
			return null;
		}
		
		try {
			const response = await fetch('/api/drive/save-transcript', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: finalTranscript,
					folderId: projectFolderId,
					title: `VoiceNote_${new Date().toISOString().split('T')[0]}`,
					type: 'transcript',
					audioFileId
				})
			});
			
			const data = await response.json();
			return data.fileId || null;
		} catch (error) {
			console.error('Save transcript error:', error);
			return null;
		}
	}
	
	// Generate summary using Llama 3
	async function generateSummary(): Promise<string> {
		if (!finalTranscript) return '';
		
		isSummarizing = true;
		
		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: `Please summarize the following voice note. Include:
1. Key points (bullet list)
2. Action items (if any)
3. A brief overview (2-3 sentences)

Voice Note:
${finalTranscript}`,
					context: ''
				})
			});
			
			const data = await response.json();
			return data.response || '';
		} catch (error) {
			console.error('Summary error:', error);
			return 'Failed to generate summary';
		} finally {
			isSummarizing = false;
		}
	}
	
	// Save summary to Drive
	async function saveSummaryToDrive(audioFileId: string, transcriptFileId: string): Promise<string | null> {
		if (!summary || !accessToken || !projectFolderId) {
			return null;
		}
		
		try {
			const response = await fetch('/api/drive/save-summary', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: summary,
					folderId: projectFolderId,
					title: `VoiceNote_${new Date().toISOString().split('T')[0]}`,
					metadata: {
						audioFileId,
						transcriptFileId,
						generatedAt: new Date().toISOString()
					}
				})
			});
			
			const data = await response.json();
			return data.fileId || null;
		} catch (error) {
			console.error('Save summary error:', error);
			return null;
		}
	}
	
	// Complete voice note flow
	async function completeVoiceNote() {
		if (!audioBlob || !accessToken) return;
		
		isProcessing = true;
		
		try {
			// 1. Upload audio to Drive
			const audioFileId = await uploadToDrive();
			
			// 2. Transcribe audio (if not already done)
			if (!finalTranscript) {
				await transcribeAudio();
			}
			
			// 3. Save transcript to Drive
			const transcriptFileId = audioFileId ? await saveTranscriptToDrive(audioFileId) : null;
			
			// 4. Generate summary
			summary = await generateSummary();
			
			// 5. Save summary to Drive
			if (summary && audioFileId) {
				await saveSummaryToDrive(audioFileId, transcriptFileId || '');
			}
			
			dispatch('complete', {
				audioFileId,
				transcriptFileId,
				transcript: finalTranscript,
				summary
			});
			
			// Reset
			reset();
			
		} catch (error) {
			console.error('Complete voice note error:', error);
			dispatch('error', { message: 'Failed to process voice note' });
		} finally {
			isProcessing = false;
		}
	}
	
	// Reset everything
	function reset() {
		audioBlob = null;
		audioUrl = '';
		transcript = '';
		finalTranscript = '';
		summary = '';
		recordingDuration = 0;
		audioChunks = [];
	}
	
	// Send message in chat mode
	function sendMessage(text: string) {
		dispatch('send', { message: text });
	}
	
	// Format duration
	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
	
	onDestroy(() => {
		if (isRecording) {
			stopRecording();
		}
		if (recordingInterval) {
			clearInterval(recordingInterval);
		}
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
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
			{#if audioUrl && !isRecording}
				<div class="audio-preview">
					<audio controls src={audioUrl}></audio>
				</div>
				
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
				
				<div class="voice-note-actions">
					{#if !finalTranscript}
						<button class="transcribe-btn" on:click={transcribeAudio} disabled={isProcessing}>
							Transcribe
						</button>
					{/if}
					
					{#if finalTranscript && !summary}
						<button class="summarize-btn" on:click={generateSummary} disabled={isSummarizing}>
							{#if isSummarizing}
								Generating Summary...
							{:else}
								Generate Summary
							{/if}
						</button>
					{/if}
					
					{#if summary}
						<button class="save-btn" on:click={completeVoiceNote} disabled={isProcessing}>
							Save to Drive
						</button>
					{/if}
					
					<button class="discard-btn" on:click={reset}>
						Discard
					</button>
				</div>
			{:else}
				<div class="record-prompt">
					<button 
						class="record-btn large" 
						class:recording={isRecording}
						on:click={() => isRecording ? stopRecording() : startRecording()}
						disabled={isProcessing}
					>
						{#if isRecording}
							<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
								<rect x="6" y="6" width="12" height="12" rx="2"/>
							</svg>
							<span>Stop Recording</span>
						{:else}
							<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
							</svg>
							<span>Start Recording</span>
						{/if}
					</button>
					<p class="hint">Record a voice note to transcribe and summarize</p>
				</div>
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
	}

	.audio-preview audio {
		width: 100%;
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
