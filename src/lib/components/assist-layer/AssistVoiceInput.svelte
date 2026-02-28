<script lang="ts">
	import { onMount } from 'svelte';
	
	let isListening = false;
	let transcript = '';
	let error = '';
	
	function toggleListening() {
		isListening = !isListening;
		if (isListening) {
			// Simulate voice input
			transcript = 'Listening... (placeholder)';
		} else {
			transcript = '';
		}
	}
	
	function sendTranscript() {
		if (transcript.trim()) {
			// Dispatch event
			window.dispatchEvent(new CustomEvent('voice-transcript', { detail: { transcript } }));
			transcript = '';
		}
	}
</script>

<div class="assist-voice-input">
	<h3 class="section-title">Voice Assistant</h3>
	<p class="description">Speak to interact with Oscar AI. This is a placeholder component.</p>
	
	<div class="voice-controls">
		<button
			class="voice-button {isListening ? 'listening' : ''}"
			on:click={toggleListening}
			aria-label="{isListening ? 'Stop listening' : 'Start listening'}"
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
				<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
				<line x1="12" y1="19" x2="12" y2="23" />
				<line x1="8" y1="23" x2="16" y2="23" />
			</svg>
			{isListening ? 'Stop' : 'Start'}
		</button>
		
		<button
			class="send-button"
			on:click={sendTranscript}
			disabled={!transcript.trim()}
		>
			Send
		</button>
	</div>
	
	{#if transcript}
		<div class="transcript">
			<strong>Transcript:</strong> {transcript}
		</div>
	{/if}
	
	{#if error}
		<div class="error">{error}</div>
	{/if}
</div>

<style>
	.assist-voice-input {
		padding: 1rem;
	}
	.section-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.description {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 1rem;
	}
	.voice-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1rem;
	}
	.voice-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 9999px;
		font-weight: 500;
		cursor: pointer;
	}
	.voice-button.listening {
		background-color: #ef4444;
	}
	.send-button {
		padding: 0.75rem 1.5rem;
		background-color: #10b981;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
	}
	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.transcript {
		padding: 1rem;
		background-color: #f9fafb;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		font-size: 0.875rem;
	}
	.error {
		color: #ef4444;
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}
</style>