import { decisionSheetStore } from '$lib/stores/decisionSheetStore';
import { acknowledgementStore } from '$lib/stores/acknowledgementStore';
import { processUserPrompt } from './semanticRouting';
import { addMessage } from '$lib/copilot/copilotStore';
import { debugStore } from '$lib/stores/debugStore';
import { intentClassifier, type IntelligenceIntentResult } from './intelligence/IntentClassifier';

/**
 * Intercept a user prompt and decide whether to open a decision sheet or proceed.
 * This is the main entry point for the intelligence layer.
 * NOW ACTIVE - Intelligence features enabled as part of PHASE 6
 */
export async function handleUserPrompt(prompt: string): Promise<void> {
	console.log('[IntelligenceLayer] ACTIVE - Processing prompt with intelligence layer');
	console.log('[DEBUG] Prompt flow: handleUserPrompt called with:', prompt.substring(0, 100));
	
	// Step 1: Classify the prompt using the intelligence layer
	const classification = await intentClassifier.classify(prompt);
	console.log('[IntelligenceLayer] Classification result:', classification);
	
	// Step 2: Show hint tooltip based on classification
	try {
		const { showHint } = await import('$lib/copilot/promptTooltipStore');
		const hintMessage = getHintMessage(classification);
		showHint(hintMessage, 3000);
	} catch (error) {
		console.warn('[DEBUG] Failed to show prompt tooltip:', error);
	}
	
	// Step 3: Decide whether to open a decision sheet or proceed directly
	if (classification.requiresDecisionSheet) {
		console.log('[IntelligenceLayer] Opening decision sheet for:', classification.intelligenceIntent);
		await openDecisionSheetForClassification(classification, prompt);
	} else {
		console.log('[IntelligenceLayer] No decision sheet required, proceeding with prompt');
		await proceedWithPrompt(prompt);
		
		// Show acknowledgement bubble if required
		if (classification.requiresAcknowledgement && classification.acknowledgementMessage) {
			acknowledgementStore.showIntentAcknowledgement(
				classification.intelligenceIntent,
				classification.confidence,
				classification.acknowledgementMessage
			);
		}
	}
}

/**
 * Get hint message based on classification
 */
function getHintMessage(classification: IntelligenceIntentResult): string {
	switch (classification.intelligenceIntent) {
		case 'smalltalk':
			return 'Hello! How can I help you today?';
		case 'media_action':
			return 'Ready to handle your media request...';
		case 'task_action':
			return 'Processing your task...';
		case 'note_action':
			return 'Creating your note...';
		case 'ambiguous':
			return 'Let me clarify what you mean...';
		case 'requires_decision_sheet':
			return 'Opening decision sheet...';
		default:
			return `Processing your ${classification.unifiedIntent.intent} request...`;
	}
}

/**
 * Open a decision sheet based on classification result
 */
async function openDecisionSheetForClassification(
	classification: IntelligenceIntentResult,
	originalPrompt: string
): Promise<void> {
	const { intelligenceIntent, contextDetection, mediaAction, decisionSheetOptions } = classification;
	
	// Convert decision sheet options to actions
	const actions = decisionSheetOptions.map((label, idx) => ({
		id: `action_${idx}`,
		label,
		handler: () => handleDecisionAction(label, originalPrompt)
	}));
	
	// Determine title and message based on intent
	let title = 'What would you like to do?';
	let message = '';
	
	switch (intelligenceIntent) {
		case 'ambiguous':
			title = 'Where should we go?';
			message = `I'm not sure where you'd like to go with "${originalPrompt.substring(0, 50)}${originalPrompt.length > 50 ? '...' : ''}".`;
			break;
		case 'requires_decision_sheet':
			title = 'Action required';
			message = classification.explanation;
			break;
		case 'media_action':
			title = mediaAction ? `Handle ${mediaAction}` : 'Media action';
			message = 'What would you like to do with this media?';
			break;
		case 'navigation_action':
			title = 'Navigate to subsystem';
			message = `You mentioned ${contextDetection.subsystem || 'another subsystem'}. Would you like to switch there?`;
			break;
		default:
			title = 'Confirm action';
			message = classification.explanation;
	}
	
	// Open the decision sheet
	decisionSheetStore.openSheet(title, message, actions, () => {
		console.log('User cancelled decision sheet');
		// If cancelled, we can still proceed with the prompt
		proceedWithPrompt(originalPrompt);
	});
}

/**
 * Handle the user's selection from a decision sheet.
 */
async function handleDecisionAction(actionLabel: string, originalPrompt: string) {
	// For now, we'll just log and proceed with the original prompt.
	// In a real implementation, we would navigate to the appropriate subsystem,
	// show an acknowledgement bubble, etc.
	debugStore.log('IntelligenceLayer', 'User selected action', { actionLabel, originalPrompt });
	console.log(`User selected action: ${actionLabel}`);

	// Show acknowledgement bubble
	acknowledgementStore.showSuccess(`Action: ${actionLabel}`, 1500);

	// If the action is "Stay Here" or similar, we can just proceed with the prompt.
	if (actionLabel === 'Stay Here' || actionLabel === 'Ask for Clarification') {
		debugStore.log('IntelligenceLayer', 'Proceeding with prompt (stay)', { actionLabel });
		await proceedWithPrompt(originalPrompt);
	} else {
		debugStore.log('IntelligenceLayer', 'Navigating to subsystem', { actionLabel });
		// Navigate to the appropriate subsystem (placeholder)
		navigateToSubsystem(actionLabel);
		// After navigation, we might want to process the prompt in the new context.
		// For simplicity, we'll just proceed with the prompt.
		await proceedWithPrompt(originalPrompt);
	}
}

/**
 * Proceed with normal prompt processing (call existing semantic routing).
 */
async function proceedWithPrompt(prompt: string) {
	debugStore.log('IntelligenceLayer', 'proceedWithPrompt', { prompt });
	try {
		const aiResponse = await processUserPrompt(prompt);
		debugStore.log('IntelligenceLayer', 'AI response received', { aiResponseLength: aiResponse?.length });
		addMessage('ai', aiResponse);
	} catch (error) {
		debugStore.log('IntelligenceLayer', 'Failed to process user prompt', { error: error instanceof Error ? error.message : String(error) });
		console.error('Failed to process user prompt:', error);
		addMessage('ai', `Sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}


/**
 * Navigate to a subsystem (placeholder).
 * DISABLED FOR NOW - Intelligence features not yet active
 */
function navigateToSubsystem(actionLabel: string) {
	// DISABLED: Intelligence features are not yet active
	console.log(`[Navigate] DISABLED - Would navigate to: ${actionLabel}`);
}

/**
 * Handle media capture (photo, voice, file) and open a decision sheet.
 * NOW ACTIVE - Intelligence features enabled as part of PHASE 6
 */
export function handleMediaCapture(mediaType: 'photo' | 'voice' | 'file') {
	console.log(`[MediaCapture] ACTIVE - Handling media type: ${mediaType}`);
	
	// Open decision sheet for media action
	decisionSheetStore.openMediaDecision(mediaType, (actionLabel: string) => {
		console.log(`[MediaCapture] User selected action: ${actionLabel}`);
		handleDecisionAction(actionLabel, `Media capture: ${mediaType}`);
		
		// Show acknowledgement bubble
		acknowledgementStore.showSuccess(`Handled ${mediaType}: ${actionLabel}`, 1500);
	});
}
