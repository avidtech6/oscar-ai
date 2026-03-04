/**
 * Copilot Panel (Phase 18)
 * 
 * Minimal placeholder for the unified editor's AI copilot panel.
 */

export interface CopilotPanel {
	/** Send a user message and get AI response */
	sendMessage(message: string): Promise<string>;
	/** Suggest improvements for current content */
	suggestImprovements(content: string): Promise<string[]>;
	/** Generate content based on a prompt */
	generateContent(prompt: string): Promise<string>;
	/** Toggle copilot visibility */
	toggleVisibility(visible: boolean): void;
}

export class DefaultCopilotPanel implements CopilotPanel {
	async sendMessage(message: string): Promise<string> {
		console.log('CopilotPanel sendMessage:', message);
		return `AI response to: "${message.substring(0, 30)}..."`;
	}

	async suggestImprovements(content: string): Promise<string[]> {
		console.log('CopilotPanel suggestImprovements:', content.length, 'chars');
		return [
			'Consider adding more detail in the introduction.',
			'Check spelling and grammar.',
			'Add a conclusion section.'
		];
	}

	async generateContent(prompt: string): Promise<string> {
		console.log('CopilotPanel generateContent:', prompt);
		return `Generated content based on: "${prompt.substring(0, 40)}..."`;
	}

	toggleVisibility(visible: boolean): void {
		console.log('CopilotPanel toggleVisibility:', visible);
	}
}

export default DefaultCopilotPanel;