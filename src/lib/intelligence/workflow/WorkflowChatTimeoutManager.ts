/**
 * Workflow Chat Timeout Manager (Phase 25)
 * 
 * Manages pending action timeouts for chat‑based apply actions.
 */

import type { ApplyAction } from './WorkflowAwareChatMode';

export class WorkflowChatTimeoutManager {
	private pendingTimeout: NodeJS.Timeout | null = null;
	private timeoutSeconds: number;

	constructor(timeoutSeconds: number) {
		this.timeoutSeconds = timeoutSeconds;
	}

	/**
	 * Start a timeout that will call the provided callback after the configured seconds.
	 */
	startTimeout(onTimeout: () => void): void {
		if (this.timeoutSeconds <= 0) return;
		this.clearTimeout();
		this.pendingTimeout = setTimeout(() => {
			onTimeout();
		}, this.timeoutSeconds * 1000);
	}

	/**
	 * Clear the current timeout.
	 */
	clearTimeout(): void {
		if (this.pendingTimeout) {
			clearTimeout(this.pendingTimeout);
			this.pendingTimeout = null;
		}
	}

	/**
	 * Update the timeout duration.
	 */
	updateTimeout(seconds: number): void {
		this.timeoutSeconds = seconds;
	}

	/**
	 * Check if a timeout is currently active.
	 */
	isActive(): boolean {
		return this.pendingTimeout !== null;
	}
}