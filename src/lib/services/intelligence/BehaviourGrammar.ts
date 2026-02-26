/**
 * Unified Behaviour Grammar
 * 
 * Defines and enforces consistent UI/UX patterns across the intelligence layer:
 * - Tooltip positioning and styling
 * - Decision sheet appearance and behaviour
 * - Acknowledgement bubble patterns
 * - Animation timing and easing
 * - Colour schemes and typography
 * - Interaction patterns
 */

import { acknowledgementStore } from '$lib/stores/acknowledgementStore';
import { decisionSheetStore } from '$lib/stores/decisionSheetStore';

export interface BehaviourPattern {
	id: string;
	name: string;
	description: string;
	rules: string[];
	examples: string[];
}

export interface InteractionFlow {
	trigger: string;
	steps: string[];
	expectedOutcome: string;
	timeout?: number;
}

export class BehaviourGrammar {
	// Animation timing constants
	static readonly ANIMATION = {
		FAST: 150,
		NORMAL: 300,
		SLOW: 500,
		DECISION_SHEET_SLIDE_UP: 300,
		TOOLTIP_FADE_IN: 200,
		ACKNOWLEDGEMENT_FADE_OUT: 2000,
		HOVER_DELAY: 100,
	};
	
	// Positioning constants
	static readonly POSITIONING = {
		TOOLTIP_OFFSET_Y: -10, // pixels above target
		DECISION_SHEET_MARGIN: 20, // pixels from bottom
		ACKNOWLEDGEMENT_TOP: 80, // pixels from top
		MODAL_Z_INDEX: 1000,
		TOOLTIP_Z_INDEX: 999,
		ACKNOWLEDGEMENT_Z_INDEX: 998,
	};
	
	// Colour schemes
	static readonly COLOURS = {
		PRIMARY: '#3b82f6', // blue-500
		SUCCESS: '#10b981', // emerald-500
		WARNING: '#f59e0b', // amber-500
		ERROR: '#ef4444', // red-500
		INFO: '#6b7280', // gray-500
		BACKGROUND_LIGHT: 'rgba(255, 255, 255, 0.95)',
		BACKGROUND_DARK: 'rgba(31, 41, 55, 0.95)',
		SHADOW: 'rgba(0, 0, 0, 0.1)',
	};
	
	// Typography
	static readonly TYPOGRAPHY = {
		FONT_FAMILY: 'system-ui, -apple-system, sans-serif',
		FONT_SIZE_SMALL: '0.875rem', // 14px
		FONT_SIZE_NORMAL: '1rem', // 16px
		FONT_SIZE_LARGE: '1.125rem', // 18px
		FONT_SIZE_XLARGE: '1.25rem', // 20px
		LINE_HEIGHT_TIGHT: '1.25',
		LINE_HEIGHT_NORMAL: '1.5',
		FONT_WEIGHT_NORMAL: '400',
		FONT_WEIGHT_MEDIUM: '500',
		FONT_WEIGHT_SEMIBOLD: '600',
	};
	
	// Border radius
	static readonly BORDER_RADIUS = {
		SMALL: '0.375rem', // 6px
		MEDIUM: '0.5rem', // 8px
		LARGE: '0.75rem', // 12px
		XLARGE: '1rem', // 16px
		FULL: '9999px',
	};
	
	// Spacing
	static readonly SPACING = {
		XS: '0.25rem', // 4px
		SM: '0.5rem', // 8px
		MD: '1rem', // 16px
		LG: '1.5rem', // 24px
		XL: '2rem', // 32px
		XXL: '3rem', // 48px
	};
	
	/**
	 * Get all behaviour patterns
	 */
	getBehaviourPatterns(): BehaviourPattern[] {
		return [
			{
				id: 'tooltip-above-prompt-bar',
				name: 'Tooltip above prompt bar',
				description: 'Hint tooltips appear directly above the CopilotBar, not overlapping it.',
				rules: [
					'Position: 10px above CopilotBar',
					'Duration: 3 seconds maximum',
					'Animation: Fade in/out with 200ms timing',
					'Content: Concise, actionable hint',
					'Colour: Blue for hints, yellow for warnings, red for errors',
				],
				examples: [
					'"Try saying: Add a task for tomorrow"',
					'"You can upload photos by saying: Take a photo"',
					'"I detected a calendar reference. Switch to calendar?"',
				],
			},
			{
				id: 'decision-sheet-slide-up',
				name: 'Decision sheet slides up',
				description: 'Decision sheets slide up from the bottom of the screen with smooth animation.',
				rules: [
					'Animation: Slide up from bottom over 300ms',
					'Position: Fixed to bottom with 20px margin',
					'Background: Semi-transparent overlay',
					'Actions: Clearly labelled buttons with icons',
					'Cancel: Tap outside or swipe down to dismiss',
					'Ephemeral: Does not pollute history',
				],
				examples: [
					'Subsystem mismatch: "Switch to gallery or stay here?"',
					'Media action: "Upload to gallery or attach to note?"',
					'Ambiguous intent: "Clarify which item you mean"',
				],
			},
			{
				id: 'acknowledgement-bubble-ephemeral',
				name: 'Acknowledgement bubble ephemeral',
				description: 'Acknowledgement bubbles appear at the top and auto-dismiss after 2 seconds.',
				rules: [
					'Position: Top center, 80px from top',
					'Duration: 2 seconds auto-dismiss',
					'Animation: Fade in/out with 200ms timing',
					'Colour: Green for success, blue for info, yellow for warning, red for error',
					'Queue: Multiple acknowledgements queue sequentially',
					'Non-history: Does not appear in conversation history',
				],
				examples: [
					'✓ Photo uploaded to gallery',
					'⚠️ Low confidence - please confirm',
					'🔵 Processing your request...',
					'❌ Failed to save note',
				],
			},
			{
				id: 'media-action-routing',
				name: 'Media action routing',
				description: 'Media actions (photos, voice, files) route to appropriate subsystems with clear feedback.',
				rules: [
					'Detection: Automatically detect media type from prompt',
					'Routing: Route to most appropriate subsystem (gallery, voice, files)',
					'Confirmation: Show decision sheet for ambiguous targets',
					'Feedback: Show acknowledgement bubble after completion',
					'Error handling: Graceful fallback for unsupported actions',
				],
				examples: [
					'"Take a photo" → Opens camera, routes to gallery',
					'"Record a voice note" → Starts recording, routes to voice notes',
					'"Upload this file" → Opens file picker, routes to files',
				],
			},
			{
				id: 'history-pollution-prevention',
				name: 'History pollution prevention',
				description: 'Prevent tooltips, decision sheets, and acknowledgements from polluting conversation history.',
				rules: [
					'Temporary interactions do not appear in history',
					'Only user prompts and AI responses are saved',
					'Decision sheet interactions are ephemeral',
					'Acknowledgement bubbles are not recorded',
					'Navigation actions may create context markers',
				],
				examples: [
					'Tooltip hint: Not saved to history',
					'Decision sheet choice: Not saved to history',
					'Acknowledgement bubble: Not saved to history',
					'User prompt: "Add a task": Saved to history',
					'AI response: "Task added": Saved to history',
				],
			},
			{
				id: 'global-copilot-routing',
				name: 'Global Copilot routing',
				description: 'General queries and smalltalk route to global Copilot context.',
				rules: [
					'Smalltalk: "Hello", "How are you" → Global Copilot',
					'General queries: "What can you do?" → Global Copilot',
					'Ambiguous queries: "What about this?" → Global Copilot',
					'Subsystem-specific: Route to appropriate subsystem',
					'Mixed intent: Use decision sheet for clarification',
				],
				examples: [
					'"Hello" → Global Copilot greeting',
					'"What can you do?" → Global Copilot capabilities list',
					'"Add a task" → Tasks subsystem',
					'"Take a photo" → Gallery subsystem via media routing',
				],
			},
		];
	}
	
	/**
	 * Get interaction flows for common scenarios
	 */
	getInteractionFlows(): InteractionFlow[] {
		return [
			{
				trigger: 'User mentions different subsystem',
				steps: [
					'1. Detect subsystem reference in prompt',
					'2. Show tooltip hint above CopilotBar',
					'3. Open decision sheet with options',
					'4. User selects action',
					'5. Show acknowledgement bubble',
					'6. Route to selected subsystem or proceed',
				],
				expectedOutcome: 'Seamless subsystem switching with user confirmation',
				timeout: 5000,
			},
			{
				trigger: 'User requests media action',
				steps: [
					'1. Detect media action type (photo, voice, file)',
					'2. Determine possible target subsystems',
					'3. If multiple targets, show decision sheet',
					'4. Execute media action routing',
					'5. Show acknowledgement bubble with result',
					'6. Optionally open target subsystem',
				],
				expectedOutcome: 'Media handled appropriately with clear feedback',
				timeout: 10000,
			},
			{
				trigger: 'Ambiguous user prompt',
				steps: [
					'1. Detect ambiguous references (this, that, it)',
					'2. Show tooltip asking for clarification',
					'3. Open decision sheet with clarification options',
					'4. User selects clarification method',
					'5. Either: ask for more detail, show items, or proceed',
					'6. Continue with clarified intent',
				],
				expectedOutcome: 'Clarification obtained without frustration',
				timeout: 7000,
			},
			{
				trigger: 'Smalltalk or general query',
				steps: [
					'1. Detect smalltalk or general query',
					'2. Route to global Copilot context',
					'3. Show acknowledgement bubble',
					'4. Process in global context',
					'5. Return appropriate response',
					'6. Response appears in conversation history',
				],
				expectedOutcome: 'Polite, appropriate response in global context',
				timeout: 3000,
			},
		];
	}
	
	/**
	 * Validate a UI interaction against behaviour grammar
	 */
	validateInteraction(interaction: {
		type: 'tooltip' | 'decision-sheet' | 'acknowledgement' | 'media-action';
		properties: Record<string, any>;
	}): { valid: boolean; issues: string[]; suggestions: string[] } {
		const issues: string[] = [];
		const suggestions: string[] = [];
		
		switch (interaction.type) {
			case 'tooltip':
				// Check positioning
				if (interaction.properties.position !== 'above') {
					issues.push('Tooltip should be positioned above target');
					suggestions.push('Use position: above with offsetY: -10px');
				}
				
				// Check duration
				if (interaction.properties.duration > 5000) {
					issues.push('Tooltip duration too long');
					suggestions.push('Maximum duration should be 3000ms for hints');
				}
				
				// Check content length
				if (interaction.properties.content?.length > 100) {
					issues.push('Tooltip content too long');
					suggestions.push('Keep tooltips concise (under 100 characters)');
				}
				break;
				
			case 'decision-sheet':
				// Check animation
				if (!interaction.properties.animation?.includes('slide-up')) {
					issues.push('Decision sheet should slide up from bottom');
					suggestions.push('Use slide-up animation with 300ms duration');
				}
				
				// Check action count
				if (!interaction.properties.actions || interaction.properties.actions.length < 2) {
					issues.push('Decision sheet needs at least 2 actions');
					suggestions.push('Provide clear choices for user');
				}
				
				if (interaction.properties.actions && interaction.properties.actions.length > 5) {
					issues.push('Too many actions in decision sheet');
					suggestions.push('Limit to 3-5 clear options');
				}
				
				// Check cancel option
				if (!interaction.properties.canCancel) {
					issues.push('Decision sheet should allow cancellation');
					suggestions.push('Allow tap outside or swipe down to cancel');
				}
				break;
				
			case 'acknowledgement':
				// Check duration
				if (interaction.properties.duration < 1000 || interaction.properties.duration > 5000) {
					issues.push('Acknowledgement duration outside recommended range');
					suggestions.push('Use 2000ms duration for standard acknowledgements');
				}
				
				// Check position
				if (interaction.properties.position !== 'top') {
					issues.push('Acknowledgement should appear at top');
					suggestions.push('Use position: top with 80px offset');
				}
				
				// Check colour coding
				const type = interaction.properties.type;
				const expectedColours = {
					success: BehaviourGrammar.COLOURS.SUCCESS,
					info: BehaviourGrammar.COLOURS.INFO,
					warning: BehaviourGrammar.COLOURS.WARNING,
					error: BehaviourGrammar.COLOURS.ERROR,
				};
				
				if (type && expectedColours[type as keyof typeof expectedColours]) {
					// Colour validation would go here
				}
				break;
				
			case 'media-action':
				// Check routing
				if (!interaction.properties.targetSubsystem) {
					issues.push('Media action missing target subsystem');
					suggestions.push('Specify target subsystem (gallery, voice, files, etc.)');
				}
				
				// Check feedback
				if (!interaction.properties.showFeedback) {
					issues.push('Media action should show feedback');
					suggestions.push('Show acknowledgement bubble after media action');
				}
				break;
		}
		
		return {
			valid: issues.length === 0,
			issues,
			suggestions,
		};
	}
	
	/**
	 * Apply behaviour grammar to a decision sheet
	 */
	applyToDecisionSheet(
		title: string,
		message: string,
		actions: Array<{ label: string; handler: () => void }>
	): void {
		console.log('[BehaviourGrammar] Applying grammar to decision sheet');
		
		// Convert actions to decision sheet format
		const decisionSheetActions = actions.map((action, idx) => ({
			id: `action_${idx}`,
			label: action.label,
			handler: action.handler,
		}));
		
		// Open decision sheet with consistent styling
		decisionSheetStore.openSheet(
			title,
			message,
			decisionSheetActions,
			() => {
				console.log('User cancelled decision sheet (behaviour grammar)');
			}
		);
	}
	
	/**
	 * Apply behaviour grammar to an acknowledgement
	 */
	applyToAcknowledgement(
		message: string,
		type: 'success' | 'info' | 'warning' | 'error' = 'success',
		duration: number = BehaviourGrammar.ANIMATION.ACKNOWLEDGEMENT_FADE_OUT
	): void {
		console.log('[BehaviourGrammar] Applying grammar to acknowledgement');
		
		// Show acknowledgement with consistent styling
		acknowledgementStore.showAcknowledgement(message, type, duration);
	}
	
	/**
	 * Get CSS classes for consistent styling
	 */
	getStyleClasses(component: string): string {
		const classMap: Record<string, string> = {
			'tooltip': 'bg-blue-50 text-blue-800 border border-blue-200 rounded-md shadow-sm',
			'decision-sheet': 'bg-white dark:bg-gray-800 rounded-t-xl shadow-lg',
			'decision-sheet-overlay': 'bg-black bg-opacity-50',
			'acknowledgement-success': 'bg-emerald-50 text-emerald-800 border border-emerald-200',
			'acknowledgement-info': 'bg-blue-50 text-blue-800 border border-blue-200',
			'acknowledgement-warning': 'bg-amber-50 text-amber-800 border border-amber-200',
			'acknowledgement-error': 'bg-red-50 text-red-800 border border-red-200',
			'button-primary': 'bg-blue-500 hover:bg-blue-600 text-white',
			'button-secondary': 'bg-gray-100 hover:bg-gray-200 text-gray-800',
			'button-danger': 'bg-red-500 hover:bg-red-600 text-white',
		};
		
		return classMap[component] || '';
	}
	
	/**
	 * Get animation styles
	 */
	getAnimationStyles(animation: string): Record<string, string> {
		const animations: Record<string, Record<string, string>> = {
			'slide-up': {
				'transition': `transform ${BehaviourGrammar.ANIMATION.DECISION_SHEET_SLIDE_UP}ms ease-out`,
				'transform': 'translateY(0)',
				'initial-transform': 'translateY(100%)',
			},
			'fade-in': {
				'transition': `opacity ${BehaviourGrammar.ANIMATION.TOOLTIP_FADE_IN}ms ease-in`,
				'opacity': '1',
				'initial-opacity': '0',
			},
			'fade-out': {
				'transition': `opacity ${BehaviourGrammar.ANIMATION.TOOLTIP_FADE_IN}ms ease-out`,
				'opacity': '0',
				'initial-opacity': '1',
			},
			'scale-in': {
				'transition': `transform ${BehaviourGrammar.ANIMATION.NORMAL}ms ease-out`,
				'transform': 'scale(1)',
				'initial-transform': 'scale(0.95)',
			},
		};
		
		return animations[animation] || {
			'transition': `all ${BehaviourGrammar.ANIMATION.NORMAL}ms ease`,
		};
	}
}

// Singleton instance
export const behaviourGrammar = new BehaviourGrammar();