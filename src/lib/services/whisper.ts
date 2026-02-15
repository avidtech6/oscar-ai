// Client-side Groq Whisper transcription service
import { get } from 'svelte/store';
import { groqApiKey } from '../stores/settings';

export interface TranscriptionResult {
	text: string;
	language?: string;
	duration?: number;
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
	const apiKey = get(groqApiKey);
	
	if (!apiKey) {
		throw new Error('Groq API key not configured. Please add it in Settings.');
	}

	// Convert blob to File
	const audioFile = new File([audioBlob], 'recording.webm', {
		type: audioBlob.type || 'audio/webm'
	});

	// Create FormData
	const formData = new FormData();
	formData.append('file', audioFile);
	formData.append('model', 'whisper-large-v3');
	formData.append('temperature', '0');
	formData.append('response_format', 'json');

	const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`
		},
		body: formData
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		const errorMessage = errorData.error?.message || `Transcription failed: ${response.status}`;
		throw new Error(errorMessage);
	}

	const data = await response.json();
	
	return {
		text: data.text || '',
		language: data.language,
		duration: data.duration
	};
}

// Helper to get supported mime type for recording
export function getSupportedMimeType(): string {
	const mimeTypes = [
		'audio/webm',
		'audio/webm;codecs=opus',
		'audio/webm;codecs=vp9',
		'audio/ogg',
		'audio/mp4',
		'audio/mpeg',
		'audio/wav'
	];
	
	for (const type of mimeTypes) {
		if (MediaRecorder.isTypeSupported(type)) {
			return type;
		}
	}
	
	return 'audio/webm'; // fallback
}
