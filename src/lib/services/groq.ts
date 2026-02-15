import { get } from 'svelte/store';
import { groqApiKey, groqModels } from '$lib/stores/settings';

export type ChatMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export async function chat(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<string> {
	const apiKey = get(groqApiKey);
	if (!apiKey) throw new Error('Groq API key not configured');

	const model = get(groqModels).chat;
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

	if (!response.ok) {
		const error = await response.text();
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
	const apiKey = get(groqApiKey);
	if (!apiKey) throw new Error('Groq API key not configured');

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
