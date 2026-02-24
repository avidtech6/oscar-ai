import { get } from 'svelte/store';
import { groqModels } from '$lib/stores/settings';
import { credentialManager } from '$lib/system/CredentialManager';

export type ChatMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export async function chat(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<string> {
	// Ensure CredentialManager is ready
	if (!credentialManager.isReady()) {
		console.log('Groq chat: CredentialManager not ready, initializing...');
		await credentialManager.initialize();
	}
	
	const apiKey = credentialManager.getGroqKey();
	console.log('Groq chat: API key available:', !!apiKey, 'length:', apiKey ? apiKey.length : 0, 'starts with gsk_:', apiKey ? apiKey.startsWith('gsk_') : false);
	
	if (!apiKey) {
		console.error('Groq chat: No API key found');
		throw new Error('Groq API key not configured. Please set it in Settings.');
	}

	const model = get(groqModels).chat;
	console.log('Groq chat: Using model:', model);
	
	const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model,
			messages,
			stream: !!onChunk,
			temperature: 0.7,
			max_tokens: 4096
		})
	});

	console.log('Groq chat: Response status:', response.status, response.statusText);
	
	if (!response.ok) {
		const error = await response.text();
		console.error('Groq chat: API error:', error);
		throw new Error(`Groq API error: ${error}`);
	}

	if (onChunk && response.body) {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let fullContent = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const chunk = decoder.decode(value);
			const lines = chunk.split('\n').filter(line => line.trim() !== '');

			for (const line of lines) {
				if (line.startsWith('data: ')) {
					const data = line.slice(6);
					if (data === '[DONE]') continue;
					try {
						const json = JSON.parse(data);
						const content = json.choices?.[0]?.delta?.content || '';
						if (content) {
							fullContent += content;
							onChunk(content);
						}
					} catch (e) {
						// Skip invalid JSON
					}
				}
			}
		}

		return fullContent;
	} else {
		const json = await response.json();
		return json.choices?.[0]?.message?.content || '';
	}
}

export async function transcribe(audioFile: File, onProgress?: (progress: number) => void): Promise<string> {
	// Ensure CredentialManager is ready
	if (!credentialManager.isReady()) {
		await credentialManager.initialize();
	}
	
	const apiKey = credentialManager.getGroqKey();
	if (!apiKey) throw new Error('Groq API key not configured. Please set it in Settings.');

	const formData = new FormData();
	formData.append('file', audioFile);
	formData.append('model', 'whisper-large-v3');
	formData.append('response_format', 'json');
	formData.append('language', 'en');

	const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`
		},
		body: formData
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Transcription error: ${error}`);
	}

	const result = await response.json();
	return result.text || '';
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
	try {
		const response = await fetch('https://api.groq.com/openai/v1/models', {
			headers: {
				'Authorization': `Bearer ${apiKey}`
			}
		});
		return response.ok;
	} catch {
		return false;
	}
}
