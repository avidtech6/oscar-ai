<script lang="ts">
	import { onMount } from 'svelte';
	import VoiceInput from './VoiceInput.svelte';
	import { showToast } from '$lib/stores/toast';
	import { addVoiceTranscription } from '$lib/copilot/voiceCapture';

	let accessToken = '';
	let projectFolderId = '';
	let projectName = '';

	onMount(() => {
		// In a real app, you'd fetch these from context
		accessToken = localStorage.getItem('accessToken') || '';
		projectFolderId = localStorage.getItem('currentProjectId') || '';
		projectName = localStorage.getItem('currentProjectName') || '';
	});

	function handleTranscript(event: CustomEvent<{ text: string; final: boolean }>) {
		const { text, final } = event.detail;
		if (final) {
			addVoiceTranscription(text);
			showToast('Voice transcription added to Copilot', 'success');
		}
	}

	function handleSend(event: CustomEvent<{ message: string; intent?: string }>) {
		const { message, intent } = event.detail;
		addVoiceTranscription(message);
		showToast(`Voice message sent (${intent || 'no intent'})`, 'success');
	}

	function handleError(event: CustomEvent<{ message: string }>) {
		showToast(`Voice error: ${event.detail.message}`, 'error');
	}
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] p-4">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Voice Input</h1>
	<p class="text-gray-600 mb-8 max-w-md text-center">
		Record voice notes, dictation, or chat with the assistant. Transcriptions are sent to the Copilot.
	</p>

	<div class="w-full max-w-2xl">
		<VoiceInput
			{accessToken}
			{projectFolderId}
			{projectName}
			on:transcript={handleTranscript}
			on:send={handleSend}
			on:error={handleError}
		/>
	</div>

	<div class="mt-8 text-sm text-gray-500 max-w-md">
		<p><strong>Modes:</strong></p>
		<ul class="list-disc pl-5 mt-2 space-y-1">
			<li><strong>Chat:</strong> Record a voice message to send to the assistant.</li>
			<li><strong>Dictation:</strong> Real‑time transcription as you speak.</li>
			<li><strong>Voice Note:</strong> Record, transcribe, and summarize a note.</li>
		</ul>
	</div>
</div>