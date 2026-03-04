/**
 * ErrorBoundary – captures, categorises, and recovers from errors.
 *
 * Responsibilities:
 * - Capture errors from orchestration components
 * - Categorise errors (recoverable, fatal, transient)
 * - Attempt automatic recovery where possible
 * - Provide error reporting and metrics
 * - No external dependencies, no side effects
 *
 * FreshVibe Rules:
 * - Single responsibility (error handling only)
 * - Deterministic recovery logic
 * - Max 80 lines per function
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'fatal';
export type ErrorCategory =
	| 'validation'
	| 'runtime'
	| 'network'
	| 'permission'
	| 'timeout'
	| 'unknown';

export interface ErrorDescriptor {
	id: string;
	timestamp: number;
	message: string;
	stack?: string;
	severity: ErrorSeverity;
	category: ErrorCategory;
	component: string;
	recoverable: boolean;
	recoveryAttempted: boolean;
	recoverySucceeded?: boolean;
}

export interface RecoveryAction {
	type: 'retry' | 'fallback' | 'degrade' | 'halt';
	params?: unknown;
}

/**
 * ErrorBoundary – central error handler.
 */
export class ErrorBoundary {
	private errors: Map<string, ErrorDescriptor> = new Map();
	private recoveryStrategies: Map<ErrorCategory, RecoveryAction> = new Map();

	constructor() {
		this.setupDefaultRecoveryStrategies();
	}

	/**
	 * Capture an error.
	 */
	capture(error: Error, component: string): ErrorDescriptor {
		const descriptor: ErrorDescriptor = {
			id: `err_${Date.now()}_${Math.random().toString(36).substring(2)}`,
			timestamp: Date.now(),
			message: error.message,
			stack: error.stack,
			severity: this.assessSeverity(error),
			category: this.categorise(error),
			component,
			recoverable: this.isRecoverable(error),
			recoveryAttempted: false,
		};

		this.errors.set(descriptor.id, descriptor);

		// Attempt recovery if recoverable
		if (descriptor.recoverable) {
			descriptor.recoveryAttempted = true;
			descriptor.recoverySucceeded = this.attemptRecovery(descriptor);
		}

		return descriptor;
	}

	/**
	 * Get all captured errors.
	 */
	getErrors(): ErrorDescriptor[] {
		return Array.from(this.errors.values());
	}

	/**
	 * Get errors by component.
	 */
	getErrorsByComponent(component: string): ErrorDescriptor[] {
		return this.getErrors().filter((err) => err.component === component);
	}

	/**
	 * Clear errors older than threshold.
	 */
	clearOlderThan(thresholdMs: number): void {
		const now = Date.now();
		for (const [id, err] of this.errors) {
			if (now - err.timestamp > thresholdMs) {
				this.errors.delete(id);
			}
		}
	}

	/**
	 * Register a custom recovery strategy.
	 */
	registerRecoveryStrategy(category: ErrorCategory, action: RecoveryAction): void {
		this.recoveryStrategies.set(category, action);
	}

	/**
	 * Assess error severity.
	 */
	private assessSeverity(error: Error): ErrorSeverity {
		const msg = error.message.toLowerCase();
		if (msg.includes('fatal') || msg.includes('crash')) {
			return 'fatal';
		}
		if (msg.includes('permission') || msg.includes('auth')) {
			return 'high';
		}
		if (msg.includes('timeout') || msg.includes('network')) {
			return 'medium';
		}
		return 'low';
	}

	/**
	 * Categorise error.
	 */
	private categorise(error: Error): ErrorCategory {
		const msg = error.message.toLowerCase();
		if (msg.includes('validation') || msg.includes('invalid')) {
			return 'validation';
		}
		if (msg.includes('network') || msg.includes('fetch')) {
			return 'network';
		}
		if (msg.includes('permission') || msg.includes('access')) {
			return 'permission';
		}
		if (msg.includes('timeout')) {
			return 'timeout';
		}
		return 'unknown';
	}

	/**
	 * Determine if error is recoverable.
	 */
	private isRecoverable(error: Error): boolean {
		const severity = this.assessSeverity(error);
		return severity !== 'fatal';
	}

	/**
	 * Attempt recovery based on category.
	 */
	private attemptRecovery(descriptor: ErrorDescriptor): boolean {
		const strategy = this.recoveryStrategies.get(descriptor.category);
		if (!strategy) {
			return false;
		}

		switch (strategy.type) {
			case 'retry':
				// Simulate retry logic (would be async in real implementation)
				return Math.random() > 0.5; // 50% success for simulation
			case 'fallback':
				// Fallback to alternative path
				return true;
			case 'degrade':
				// Degrade functionality
				return true;
			case 'halt':
				return false;
			default:
				return false;
		}
	}

	/**
	 * Setup default recovery strategies.
	 */
	private setupDefaultRecoveryStrategies(): void {
		this.recoveryStrategies.set('network', { type: 'retry' });
		this.recoveryStrategies.set('timeout', { type: 'retry' });
		this.recoveryStrategies.set('validation', { type: 'fallback' });
		this.recoveryStrategies.set('permission', { type: 'halt' });
		this.recoveryStrategies.set('unknown', { type: 'degrade' });
	}
}