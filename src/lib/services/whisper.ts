// Client-side Groq Whisper transcription service
import { credentialManager } from '$lib/system/CredentialManager';

export interface TranscriptionResult {
	text: string;
	language?: string;
	duration?: number;
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
	console.log('Whisper: Starting transcription, blob size:', audioBlob.size, 'type:', audioBlob.type);
	
	// Ensure CredentialManager is ready
	if (!credentialManager.isReady()) {
		await credentialManager.initialize();
	}
	
	const apiKey = credentialManager.getGroqKey();
	console.log('Whisper: API key available:', !!apiKey, 'length:', apiKey ? apiKey.length : 0);
	
	if (!apiKey) {
		console.error('Whisper: No API key found');
		throw new Error('Groq API key not configured. Please add it in Settings.');
	}

	// Convert blob to File
	const audioFile = new File([audioBlob], 'recording.webm', {
		type: audioBlob.type || 'audio/webm'
	});
	console.log('Whisper: Audio file created, size:', audioFile.size);

	// Create FormData
	const formData = new FormData();
	formData.append('file', audioFile);
	formData.append('model', 'whisper-large-v3');
	formData.append('temperature', '0');
	formData.append('response_format', 'json');
	console.log('Whisper: FormData created');

	console.log('Whisper: Sending request to Groq API...');
	const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`
		},
		body: formData
	});

	console.log('Whisper: Response status:', response.status, response.statusText);
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		const errorMessage = errorData.error?.message || `Transcription failed: ${response.status}`;
		console.error('Whisper: API error:', errorMessage, errorData);
		throw new Error(errorMessage);
	}

	const data = await response.json();
	console.log('Whisper: Transcription successful, text length:', data.text ? data.text.length : 0);
	
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
