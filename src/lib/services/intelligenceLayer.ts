import { detectContextMismatch } from './contextMismatchDetector';
import { decisionSheetStore } from '$lib/stores/decisionSheetStore';
import { processUserPrompt } from './semanticRouting';
import { addMessage } from '$lib/copilot/copilotStore';

/**
 * Intercept a user prompt and decide whether to open a decision sheet or proceed.
 * This is the main entry point for the intelligence layer.
 */
export async function handleUserPrompt(prompt: string): Promise<void> {
	console.log('[IntelligenceLayer] handleUserPrompt:', prompt);
	const detection = detectContextMismatch(prompt);
	console.log('[IntelligenceLayer] detection:', detection);

	if (detection.requiresDecisionSheet) {
		console.log('[IntelligenceLayer] Opening decision sheet');
		// Open decision sheet
		if (detection.subsystem) {
			decisionSheetStore.openSubsystemDecision(
				detection.subsystem,
				detection.suggestedActions,
				(actionLabel) => handleDecisionAction(actionLabel, prompt)
			);
		} else {
			decisionSheetStore.openAmbiguousDecision(
				prompt,
				(actionLabel) => handleDecisionAction(actionLabel, prompt)
			);
		}
	} else {
		console.log('[IntelligenceLayer] No mismatch, proceeding with prompt');
		// No mismatch, proceed with normal processing
		await proceedWithPrompt(prompt);
	}
}

/**
 * Handle the user's selection from a decision sheet.
 */
async function handleDecisionAction(actionLabel: string, originalPrompt: string) {
	// For now, we'll just log and proceed with the original prompt.
	// In a real implementation, we would navigate to the appropriate subsystem,
	// show an acknowledgement bubble, etc.
	console.log(`User selected action: ${actionLabel}`);

	// Show acknowledgement bubble (to be implemented)
	showAcknowledgementBubble(actionLabel);

	// If the action is "Stay Here" or similar, we can just proceed with the prompt.
	if (actionLabel === 'Stay Here' || actionLabel === 'Ask for Clarification') {
		await proceedWithPrompt(originalPrompt);
	} else {
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
	try {
		const aiResponse = await processUserPrompt(prompt);
		addMessage('ai', aiResponse);
	} catch (error) {
		console.error('Failed to process user prompt:', error);
		addMessage('ai', `Sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Show an ephemeral acknowledgement bubble at the top of the conversation sheet.
 * This is a placeholder; actual implementation will need to integrate with the conversation sheet.
 */
function showAcknowledgementBubble(message: string) {
	console.log(`[Acknowledgement] ${message}`);
	// TODO: integrate with conversation sheet to show a temporary bubble
}

/**
 * Navigate to a subsystem (placeholder).
 */
function navigateToSubsystem(actionLabel: string) {
	console.log(`Navigating to subsystem: ${actionLabel}`);
	// TODO: implement actual navigation (e.g., change route, update context)
}

/**
 * Handle media capture (photo, voice, file) and open a decision sheet.
 */
export function handleMediaCapture(mediaType: 'photo' | 'voice' | 'file') {
	decisionSheetStore.openMediaDecision(mediaType, (actionLabel) => {
		console.log(`Media action selected: ${actionLabel}`);
		showAcknowledgementBubble(`You asked to ${actionLabel.toLowerCase()} — here it is.`);
		// Navigate accordingly
		navigateToSubsystem(actionLabel);
	});
}
