import { get } from 'svelte/store';
import { semanticContext } from '$lib/stores/semanticContext';
import { chat, type ChatMessage } from '$lib/services/groq';
import { extractSemanticActions, type AIResponse } from './semanticActionExtractor';
import { getAIContext, formatContextForAI } from './aiActions';
import { unifiedIntentEngine } from './unified/UnifiedIntentEngine';
import { actionExecutorService } from './unified/ActionExecutorService';

export interface RoutingResult {
	success: boolean;
	message: string;
	aiResponse?: string;
	semanticEvents?: any[];
	targetId?: string;
	targetType?: 'item' | 'collection';
}

/**
 * Route a user prompt to the appropriate AI context based on zoom level and active context.
 * Returns the AI response and any extracted semantic events.
 */
export async function routePrompt(prompt: string): Promise<RoutingResult> {
	const state = get(semanticContext);
	const { activeContextId, activeContextType, zoomLevel } = state;

	// Determine target
	let targetId: string | null = null;
	let targetType: 'item' | 'collection' | null = null;

	if (zoomLevel === 'item' && activeContextType === 'item' && activeContextId) {
		targetId = activeContextId;
		targetType = 'item';
	} else if (zoomLevel === 'collection' && activeContextType === 'collection' && activeContextId) {
		targetId = activeContextId;
		targetType = 'collection';
	} else {
		// Global context (no specific target)
		targetId = null;
		targetType = null;
	}

	// Build conversation history
	const historyMessages: ChatMessage[] = [];
	if (targetId && targetType === 'item') {
		const itemHistory = state.itemHistories[targetId] || [];
		itemHistory.forEach(msg => {
			historyMessages.push({
				role: msg.role,
				content: msg.content
			});
		});
	} else if (targetId && targetType === 'collection') {
		const collectionHistory = state.collectionHistories[targetId] || [];
		collectionHistory.forEach(msg => {
			historyMessages.push({
				role: msg.role,
				content: msg.content
			});
		});
	}

	// Add user prompt to history (will be added to store after processing)
	historyMessages.push({ role: 'user', content: prompt });

	// Build system prompt with context
	const aiContext = await getAIContext();
	const contextText = formatContextForAI(aiContext);
	const systemPrompt = `You are Oscar AI, an intelligent assistant for arboricultural professionals.
Current context:
${contextText}

You are currently in ${targetType ? `${targetType} context (ID: ${targetId})` : 'global workspace'}.
Please respond helpfully and concisely. If the user asks you to perform an action (e.g., update a note, create a task, summarize), acknowledge it and indicate what you would do.
If you are making changes to a specific item or collection, mention the target clearly.`;

	const messages: ChatMessage[] = [
		{ role: 'system', content: systemPrompt },
		...historyMessages
	];

	try {
		// Call Groq API
		const aiResponse = await chat(messages);
		console.log('SemanticRouting: AI response received', aiResponse.substring(0, 200));

		// Extract semantic actions
		const aiResponseObj: AIResponse = {
			content: aiResponse,
			timestamp: Date.now(),
			metadata: {
				itemId: targetType === 'item' ? (targetId || undefined) : undefined,
				collectionId: targetType === 'collection' ? (targetId || undefined) : undefined
			}
		};
		const extractionResult = extractSemanticActions(aiResponseObj);

		// Add semantic events to store
		extractionResult.events.forEach(event => {
			semanticContext.addSemanticEvent(event);
		});

		// Add messages to appropriate history
		if (targetId && targetType === 'item') {
			semanticContext.addItemMessage(targetId, {
				role: 'user',
				content: prompt,
				timestamp: Date.now()
			});
			semanticContext.addItemMessage(targetId, {
				role: 'assistant',
				content: aiResponse,
				timestamp: Date.now()
			});
		} else if (targetId && targetType === 'collection') {
			semanticContext.addCollectionMessage(targetId, {
				role: 'user',
				content: prompt,
				timestamp: Date.now()
			});
			semanticContext.addCollectionMessage(targetId, {
				role: 'assistant',
				content: aiResponse,
				timestamp: Date.now()
			});
		}
		// If global, we don't store in item/collection history (maybe store in a global history later)

		// Also detect intent and execute if appropriate (optional)
		// For now, we just return the response.

		return {
			success: true,
			message: 'Prompt processed successfully',
			aiResponse,
			semanticEvents: extractionResult.events,
			targetId: targetId || undefined,
			targetType: targetType || undefined
		};
	} catch (error) {
		console.error('SemanticRouting: Failed to process prompt', error);
		return {
			success: false,
			message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

/**
 * Simplified version for use in eventModel (backwards compatibility).
 * This will replace the mock onUserPrompt.
 */
export async function processUserPrompt(prompt: string): Promise<string> {
	const result = await routePrompt(prompt);
	if (result.success) {
		return result.aiResponse || 'I processed your request.';
	} else {
		return `Sorry, I encountered an error: ${result.message}`;
	}
}
