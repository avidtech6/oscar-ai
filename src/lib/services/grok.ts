import { get } from 'svelte/store';
import { grokApiKey } from '$lib/stores/settings';

export type ChatMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export async function chat(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<string> {
	const apiKey = get(grokApiKey);
	if (!apiKey) throw new Error('Grok API key not configured');

	const response = await fetch('https://api.x.ai/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'grok-beta',
			messages,
			stream: !!onChunk,
			temperature: 0.7,
			max_tokens: 4096
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Grok API error: ${error}`);
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

export async function validateApiKey(apiKey: string): Promise<boolean> {
	try {
		const response = await fetch('https://api.x.ai/v1/models', {
			headers: {
				'Authorization': `Bearer ${apiKey}`
			}
		});
		return response.ok;
	} catch {
		return false;
	}
}

// Grok-specific models and capabilities
export const grokModels = {
	chat: 'grok-beta',
	// Add other Grok models as they become available
};

export async function getAvailableModels(apiKey: string): Promise<string[]> {
	try {
		const response = await fetch('https://api.x.ai/v1/models', {
			headers: {
				'Authorization': `Bearer ${apiKey}`
			}
		});
		
		if (!response.ok) return [grokModels.chat];
		
		const data = await response.json();
		return data.data?.map((model: any) => model.id) || [grokModels.chat];
	} catch {
		return [grokModels.chat];
	}
}