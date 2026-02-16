import { get } from 'svelte/store';
import { groqApiKey, groqModels } from '$lib/stores/settings';
import { chat, type ChatMessage } from './groq';

export type TransformAction = 
	| 'rewrite'
	| 'expand'
	| 'shorten'
	| 'formal'
	| 'casual'
	| 'grammar'
	| 'table'
	| 'species'
	| 'custom';

export interface TransformRequest {
	action: TransformAction;
	text: string;
	customPrompt?: string;
	context?: string;
}

export interface TransformResult {
	success: boolean;
	transformedText: string;
	error?: string;
}

/**
 * Transform text using AI based on the specified action
 */
export async function transformText(request: TransformRequest): Promise<TransformResult> {
	try {
		const apiKey = get(groqApiKey);
		if (!apiKey) {
			return {
				success: false,
				transformedText: '',
				error: 'Groq API key not configured. Please set your API key in Settings.'
			};
		}

		const { action, text, customPrompt, context } = request;
		
		// Build system prompt based on action
		let systemPrompt = '';
		let userPrompt = '';
		
		switch (action) {
			case 'rewrite':
				systemPrompt = 'You are a professional editor. Rewrite the given text to improve clarity, flow, and impact while preserving the original meaning.';
				userPrompt = `Rewrite this text:\n\n${text}`;
				break;
				
			case 'expand':
				systemPrompt = 'You are a detailed writer. Expand the given text by adding more detail, examples, and explanations while maintaining the core message.';
				userPrompt = `Expand this text by adding more detail:\n\n${text}`;
				break;
				
			case 'shorten':
				systemPrompt = 'You are a concise editor. Make the given text more concise and to the point while preserving all key information.';
				userPrompt = `Make this text more concise:\n\n${text}`;
				break;
				
			case 'formal':
				systemPrompt = 'You are a professional writer. Convert the given text to formal, professional language suitable for business or academic contexts.';
				userPrompt = `Make this text more formal:\n\n${text}`;
				break;
				
			case 'casual':
				systemPrompt = 'You are a friendly communicator. Convert the given text to casual, conversational language suitable for informal communication.';
				userPrompt = `Make this text more casual:\n\n${text}`;
				break;
				
			case 'grammar':
				systemPrompt = 'You are a grammar expert. Correct any grammar, spelling, and punctuation errors in the given text. Preserve the original meaning and style.';
				userPrompt = `Correct grammar and spelling in this text:\n\n${text}`;
				break;
				
			case 'table':
				systemPrompt = 'You are a data analyst. Convert the given text into a well-formatted markdown table. If the text contains data points, organize them into appropriate columns and rows.';
				userPrompt = `Convert this text into a markdown table:\n\n${text}`;
				break;
				
			case 'species':
				systemPrompt = 'You are an arboricultural expert. Create a list of tree species mentioned in the text, with their scientific names and common characteristics. Format as a markdown list.';
				userPrompt = `Extract tree species from this text and create a formatted list:\n\n${text}`;
				break;
				
			case 'custom':
				if (!customPrompt) {
					return {
						success: false,
						transformedText: '',
						error: 'Custom prompt is required for custom transformations.'
					};
				}
				systemPrompt = 'You are a versatile AI assistant. Follow the user\'s instructions precisely to transform the given text.';
				userPrompt = `${customPrompt}\n\nText to transform:\n\n${text}`;
				break;
				
			default:
				return {
					success: false,
					transformedText: '',
					error: `Unknown action: ${action}`
				};
		}
		
		// Add context if provided
		if (context) {
			systemPrompt += `\n\nContext: ${context}`;
		}
		
		const messages: ChatMessage[] = [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt }
		];
		
		const transformedText = await chat(messages);
		
		return {
			success: true,
			transformedText: transformedText.trim()
		};
		
	} catch (error) {
		console.error('AI transformation error:', error);
		return {
			success: false,
			transformedText: '',
			error: error instanceof Error ? error.message : 'Failed to transform text. Please check your API key and try again.'
		};
	}
}

/**
 * Transform multiple texts in batch
 */
export async function transformTexts(requests: TransformRequest[]): Promise<TransformResult[]> {
	const results: TransformResult[] = [];
	
	for (const request of requests) {
		const result = await transformText(request);
		results.push(result);
	}
	
	return results;
}

/**
 * Get action description for UI display
 */
export function getActionDescription(action: TransformAction): string {
	switch (action) {
		case 'rewrite': return 'Rewrite the selected text';
		case 'expand': return 'Add more detail';
		case 'shorten': return 'Make it more concise';
		case 'formal': return 'Make it more formal';
		case 'casual': return 'Make it more casual';
		case 'grammar': return 'Correct grammar and spelling';
		case 'table': return 'Convert to table format';
		case 'species': return 'Extract tree species list';
		case 'custom': return 'Custom transformation';
		default: return 'Transform text';
	}
}