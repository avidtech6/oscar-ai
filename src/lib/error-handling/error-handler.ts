/**
 * Centralized Error Handling System
 * 
 * Implements the ErrorHandler interface from src/lib/types/index.ts
 * Provides comprehensive error handling for API calls, user interactions, and validation failures.
 * 
 * FreshVibe Apps Way:
 * - Single responsibility: error handling only
 * - Small modular file (< 2000 lines)
 * - Clear system boundaries
 * - Visual-first error reporting
 */

import type { ErrorContext, ErrorHandler } from '$lib/types';

export class CentralErrorHandler implements ErrorHandler {
	private static instance: CentralErrorHandler;
	private errorBoundary: any; // Will be set to ErrorBoundary instance if available
	private errorListeners: Array<(error: ErrorContext) => void> = [];
	private recoveryStrategies: Map<string, (error: ErrorContext) => Promise<boolean>> = new Map();
	private errorHistory: ErrorContext[] = [];
	private maxHistorySize = 1000;

	private constructor() {
		this.setupDefaultRecoveryStrategies();
		this.setupErrorBoundary();
	}

	/**
	 * Singleton pattern to ensure single instance
	 */
	public static getInstance(): CentralErrorHandler {
		if (!CentralErrorHandler.instance) {
			CentralErrorHandler.instance = new CentralErrorHandler();
		}
		return CentralErrorHandler.instance;
	}

	/**
	 * Handle an error
	 */
	handle(error: ErrorContext): void {
		// Add to history
		this.errorHistory.push(error);
		if (this.errorHistory.length > this.maxHistorySize) {
			this.errorHistory.shift();
		}

		// Log the error
		this.log(error);

		// Notify listeners
		this.errorListeners.forEach(listener => listener(error));

		// Attempt recovery based on severity
		if (error.severity === 'error' || error.severity === 'critical') {
			this.recover(error).catch(() => {
				// If recovery fails, log it
				console.error('Recovery failed for error:', error);
			});
		}

		// Show user-friendly error message based on severity
		this.showUserError(error);
	}

	/**
	 * Attempt to recover from an error
	 */
	async recover(error: ErrorContext): Promise<boolean> {
		// Check for specific recovery strategies
		const strategyKey = this.getRecoveryStrategyKey(error);
		const strategy = this.recoveryStrategies.get(strategyKey);
		
		if (strategy) {
			try {
				const success = await strategy(error);
				if (success) {
					console.log(`Recovery successful for error: ${error.code}`);
					return true;
				}
			} catch (recoveryError) {
				console.error('Recovery strategy failed:', recoveryError);
			}
		}

		// Default recovery strategies based on error type
		return this.attemptDefaultRecovery(error);
	}

	/**
	 * Log an error
	 */
	log(error: ErrorContext): void {
		const logEntry = {
			timestamp: new Date().toISOString(),
			error,
			userAgent: navigator.userAgent,
			url: window.location.href,
			stack: error.stack
		};

		// Log to console with appropriate level
		switch (error.severity) {
			case 'info':
				console.info('Error Info:', logEntry);
				break;
			case 'warning':
				console.warn('Error Warning:', logEntry);
				break;
			case 'error':
				console.error('Error:', logEntry);
				break;
			case 'critical':
				console.error('CRITICAL ERROR:', logEntry);
				// Could send to external monitoring service here
				break;
		}

		// Store in localStorage for debugging (limited to last 50 errors)
		this.storeErrorForDebugging(logEntry);
	}

	/**
	 * Register an error listener
	 */
	onError(listener: (error: ErrorContext) => void): () => void {
		this.errorListeners.push(listener);
		return () => {
			const index = this.errorListeners.indexOf(listener);
			if (index > -1) {
				this.errorListeners.splice(index, 1);
			}
		};
	}

	/**
	 * Register a custom recovery strategy
	 */
	registerRecoveryStrategy(
		errorCode: string,
		strategy: (error: ErrorContext) => Promise<boolean>
	): void {
		this.recoveryStrategies.set(errorCode, strategy);
	}

	/**
	 * Get error history
	 */
	getErrorHistory(): ErrorContext[] {
		return [...this.errorHistory];
	}

	/**
	 * Clear error history
	 */
	clearErrorHistory(): void {
		this.errorHistory = [];
	}

	/**
	 * Create an error context from an Error object
	 */
	createErrorContext(
		error: Error | string,
		severity: ErrorContext['severity'] = 'error',
		context?: Record<string, any>
	): ErrorContext {
		const errorObj = typeof error === 'string' ? new Error(error) : error;
		
		return {
			code: this.extractErrorCode(errorObj),
			message: errorObj.message,
			severity,
			timestamp: new Date().toISOString(),
			stack: errorObj.stack,
			context: {
				...context,
				userAgent: navigator.userAgent,
				url: window.location.href
			}
		};
	}

	/**
	 * Wrap an API call with error handling
	 */
	async withErrorHandling<T>(
		apiCall: () => Promise<T>,
		context: {
			operation: string;
			component?: string;
			retryCount?: number;
			onRetry?: (attempt: number) => void;
		}
	): Promise<T> {
		const maxRetries = context.retryCount || 3;
		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const result = await apiCall();
				return result;
			} catch (error) {
				lastError = error as Error;
				
				// Create error context
				const errorContext = this.createErrorContext(
					error as Error,
					attempt === maxRetries ? 'error' : 'warning',
					{
						operation: context.operation,
						component: context.component,
						attempt,
						maxRetries
					}
				);

				// Handle the error
				this.handle(errorContext);

				// Call onRetry callback if provided
				if (context.onRetry && attempt < maxRetries) {
					context.onRetry(attempt);
				}

				// Wait before retry (exponential backoff)
				if (attempt < maxRetries) {
					const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
					await new Promise(resolve => setTimeout(resolve, delay));
				}
			}
		}

		// If we get here, all retries failed
		throw lastError;
	}

	/**
	 * Setup default recovery strategies
	 */
	private setupDefaultRecoveryStrategies(): void {
		// Network error recovery
		this.registerRecoveryStrategy('network_error', async (error) => {
			// Check if online
			if (navigator.onLine) {
				// Try to refresh the page
				window.location.reload();
				return true;
			}
			return false;
		});

		// Authentication error recovery
		this.registerRecoveryStrategy('auth_error', async (error) => {
			// Redirect to login
			if (window.location.pathname !== '/login') {
				window.location.href = '/login';
				return true;
			}
			return false;
		});

		// Validation error recovery
		this.registerRecoveryStrategy('validation_error', async (error) => {
			// Focus on the first invalid field if we can find it
			const invalidField = document.querySelector('[data-invalid="true"]');
			if (invalidField) {
				(invalidField as HTMLElement).focus();
				return true;
			}
			return false;
		});
	}

	/**
	 * Setup error boundary integration
	 */
	private setupErrorBoundary(): void {
		// Try to import and use the ErrorBoundary class if available
		try {
			// This is a dynamic import to avoid circular dependencies
			import('$lib/intelligence/unified-orchestration/ErrorBoundary')
				.then(({ ErrorBoundary }) => {
					this.errorBoundary = new ErrorBoundary();
				})
				.catch(() => {
					// ErrorBoundary not available, continue without it
					console.warn('ErrorBoundary not available, continuing without it');
				});
		} catch {
			// Ignore errors
		}
	}

	/**
	 * Get recovery strategy key for an error
	 */
	private getRecoveryStrategyKey(error: ErrorContext): string {
		// Extract error type from code
		if (error.code.includes('network') || error.code.includes('timeout')) {
			return 'network_error';
		}
		if (error.code.includes('auth') || error.code.includes('permission')) {
			return 'auth_error';
		}
		if (error.code.includes('validation') || error.code.includes('invalid')) {
			return 'validation_error';
		}
		return error.code;
	}

	/**
	 * Attempt default recovery
	 */
	private async attemptDefaultRecovery(error: ErrorContext): Promise<boolean> {
		// For network errors, check connectivity
		if (error.code.includes('network')) {
			if (!navigator.onLine) {
				// Show offline message
				this.showOfflineMessage();
				return true; // Recovery attempted (showed message)
			}
		}

		// For validation errors, nothing to recover
		if (error.code.includes('validation')) {
			return false;
		}

		// For other errors, log and continue
		return false;
	}

	/**
	 * Show user-friendly error message
	 */
	private showUserError(error: ErrorContext): void {
		// Create error message element
		const errorMessage = this.createErrorMessage(error);
		
		// Show based on severity
		switch (error.severity) {
			case 'info':
				this.showToast(errorMessage, 'info');
				break;
			case 'warning':
				this.showToast(errorMessage, 'warning');
				break;
			case 'error':
				this.showToast(errorMessage, 'error');
				// Also show in error panel if available
				this.showInErrorPanel(error);
				break;
			case 'critical':
				this.showCriticalError(errorMessage);
				break;
		}
	}

	/**
	 * Create user-friendly error message
	 */
	private createErrorMessage(error: ErrorContext): string {
		// Map error codes to user-friendly messages
		const errorMessages: Record<string, string> = {
			'network_error': 'Network connection issue. Please check your internet connection.',
			'auth_error': 'Authentication required. Please log in again.',
			'validation_error': 'Please check your input and try again.',
			'timeout_error': 'Request timed out. Please try again.',
			'server_error': 'Server error. Please try again later.',
			'not_found': 'The requested resource was not found.',
			'permission_denied': 'You don\'t have permission to perform this action.',
			'rate_limit': 'Too many requests. Please wait and try again.',
			'invalid_input': 'Invalid input provided. Please check your data.',
			'unknown_error': 'An unexpected error occurred. Please try again.'
		};

		// Find matching message or use default
		for (const [key, message] of Object.entries(errorMessages)) {
			if (error.code.includes(key) || error.message.toLowerCase().includes(key)) {
				return message;
			}
		}

		// Default message
		return error.message || 'An error occurred. Please try again.';
	}

	/**
	 * Show toast notification
	 */
	private showToast(message: string, type: 'info' | 'warning' | 'error'): void {
		// Check if toast system exists
		if (typeof window !== 'undefined' && (window as any).showToast) {
			(window as any).showToast(message, type);
			return;
		}

		// Fallback to console
		console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](`[${type.toUpperCase()}] ${message}`);
		
		// Create simple toast if no toast system
		this.createSimpleToast(message, type);
	}

	/**
	 * Create simple toast for fallback
	 */
	private createSimpleToast(message: string, type: 'info' | 'warning' | 'error'): void {
		const toast = document.createElement('div');
		toast.className = `error-toast error-toast-${type}`;
		toast.textContent = message;
		toast.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			padding: 12px 16px;
			border-radius: 4px;
			color: white;
			z-index: 9999;
			font-family: sans-serif;
			font-size: 14px;
			max-width: 300px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.2);
			animation: fadeIn 0.3s ease-in;
		`;

		// Set background color based on type
		switch (type) {
			case 'info':
				toast.style.backgroundColor = '#2196F3';
				break;
			case 'warning':
				toast.style.backgroundColor = '#FF9800';
				break;
			case 'error':
				toast.style.backgroundColor = '#F44336';
				break;
		}

		document.body.appendChild(toast);

		// Remove after 5 seconds
		setTimeout(() => {
			toast.style.animation = 'fadeOut 0.3s ease-out';
			setTimeout(() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
			}, 300);
		}, 5000);
	}

	/**
	 * Show critical error (requires user action)
	 */
	private showCriticalError(message: string): void {
		// Use browser alert as last resort
		if (confirm(`Critical Error: ${message}\n\nClick OK to reload the page.`)) {
			window.location.reload();
		}
	}

	/**
	 * Show offline message
	 */
	private showOfflineMessage(): void {
		this.showToast('You are offline. Please check your internet connection.', 'warning');
	}

	/**
	 * Show error in error panel (if available)
	 */
	private showInErrorPanel(error: ErrorContext): void {
		// Check if error panel component exists
		const errorPanel = document.querySelector('error-panel, [data-error-panel]');
		if (errorPanel && (errorPanel as any).addError) {
			(errorPanel as any).addError(error);
		}
	}

	/**
	 * Store error for debugging
	 */
	private storeErrorForDebugging(logEntry: any): void {
		try {
			const storedErrors = JSON.parse(localStorage.getItem('oscar_error_log') || '[]');
			storedErrors.push(logEntry);
			
			// Keep only last 50 errors
			if (storedErrors.length > 50) {
				storedErrors.splice(0, storedErrors.length - 50);
			}
			
			localStorage.setItem('oscar_error_log', JSON.stringify(storedErrors));
		} catch {
			// Ignore localStorage errors
		}
	}

	/**
	 * Extract error code from error object
	 */
	private extractErrorCode(error: Error): string {
		// Try to extract code from error object
		if ((error as any).code) {
			return (error as any).code;
		}

		// Extract from message
		const message = error.message.toLowerCase();
		if (message.includes('network') || message.includes('fetch')) {
			return 'network_error';
		}
		if (message.includes('auth') || message.includes('login') || message.includes('permission')) {
			return 'auth_error';
		}
		if (message.includes('validation') || message.includes('invalid')) {
			return 'validation_error';
		}
		if (message.includes('timeout')) {
			return 'timeout_error';
		}
		if (message.includes('not found') || message.includes('404')) {
			return 'not_found';
		}
		if (message.includes('server') || message.includes('500')) {
			return 'server_error';
		}

		return 'unknown_error';
	}
}

// Export singleton instance
export const errorHandler = CentralErrorHandler.getInstance();