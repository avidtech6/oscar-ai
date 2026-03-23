<script lang="ts">
	import { errorHandler } from '$lib/error-handling/error-handler';
	import type { ErrorContext } from '$lib/types';

	export let error: ErrorContext | Error | string | null = null;
	export let showDetails = false;
	export let autoDismiss = false;
	export let dismissTimeout = 5000;
	export let severity: ErrorContext['severity'] = 'error';
	export let title: string | null = null;
	export let message: string | null = null;
	export let onDismiss: (() => void) | null = null;

	let isVisible = true;
	let timer: NodeJS.Timeout | null = null;

	// Determine the actual error context
	$: errorContext = getErrorContext();
	$: displayTitle = title || getDefaultTitle();
	$: displayMessage = message || getDefaultMessage();

	function getErrorContext(): ErrorContext | null {
		if (!error) return null;

		if (typeof error === 'string') {
			return errorHandler.createErrorContext(error, severity);
		}

		if (error instanceof Error) {
			return errorHandler.createErrorContext(error, severity);
		}

		return error as ErrorContext;
	}

	function getDefaultTitle(): string {
		if (!errorContext) return 'Error';

		switch (errorContext.severity) {
			case 'info':
				return 'Information';
			case 'warning':
				return 'Warning';
			case 'error':
				return 'Error';
			case 'critical':
				return 'Critical Error';
			default:
				return 'Error';
		}
	}

	function getDefaultMessage(): string {
		if (!errorContext) return 'An unknown error occurred.';

		// Use the error handler's user-friendly message
		const messages: Record<string, string> = {
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

		// Find matching message
		for (const [key, msg] of Object.entries(messages)) {
			if (errorContext.code?.includes(key) || errorContext.message?.toLowerCase().includes(key)) {
				return msg;
			}
		}

		// Fallback to error message or default
		return errorContext.message || 'An error occurred. Please try again.';
	}

	function handleDismiss() {
		isVisible = false;
		if (onDismiss) {
			onDismiss();
		}
	}

	function handleRetry() {
		// This would need to be connected to a retry callback
		// For now, just dismiss
		handleDismiss();
	}

	function handleCopyError() {
		if (!errorContext) return;

		const errorText = JSON.stringify({
			code: errorContext.code,
			message: errorContext.message,
			severity: errorContext.severity,
			timestamp: errorContext.timestamp,
			stack: errorContext.stack
		}, null, 2);

		navigator.clipboard.writeText(errorText).then(() => {
			// Show copied feedback
			console.log('Error details copied to clipboard');
		});
	}

	// Auto-dismiss timer
	$: {
		if (autoDismiss && errorContext && isVisible) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				handleDismiss();
			}, dismissTimeout);
		}
	}

	// Cleanup
	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

{#if errorContext && isVisible}
	<div
		class="error-display"
		class:error-display-info={errorContext.severity === 'info'}
		class:error-display-warning={errorContext.severity === 'warning'}
		class:error-display-error={errorContext.severity === 'error'}
		class:error-display-critical={errorContext.severity === 'critical'}
		role="alert"
		aria-live="assertive"
	>
		<div class="error-header">
			<div class="error-icon">
				{#if errorContext.severity === 'info'}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="currentColor"/>
					</svg>
				{:else if errorContext.severity === 'warning'}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M1 18H19L10 2L1 18ZM10.5 15H9.5V14H10.5V15ZM10.5 13H9.5V8H10.5V13Z" fill="currentColor"/>
					</svg>
				{:else if errorContext.severity === 'error' || errorContext.severity === 'critical'}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
					</svg>
				{/if}
			</div>
			<div class="error-title">{displayTitle}</div>
			<button class="error-dismiss" on:click={handleDismiss} aria-label="Dismiss error">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12.5 3.5L3.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<path d="M3.5 3.5L12.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
		</div>

		<div class="error-message">{displayMessage}</div>

		<div class="error-actions">
			{#if errorContext.severity === 'error' || errorContext.severity === 'critical'}
				<button class="error-action error-action-retry" on:click={handleRetry}>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C9.61929 2.5 11.0979 3.212 12.125 4.375" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M13.5 4V2.5H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
					Retry
				</button>
			{/if}

			<button class="error-action error-action-details" on:click={() => showDetails = !showDetails}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M8 3V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<path d="M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				{showDetails ? 'Hide Details' : 'Show Details'}
			</button>

			<button class="error-action error-action-copy" on:click={handleCopyError}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="4" y="4" width="8" height="8" stroke="currentColor" stroke-width="2"/>
					<rect x="6" y="6" width="8" height="8" stroke="currentColor" stroke-width="2"/>
				</svg>
				Copy Details
			</button>
		</div>

		{#if showDetails && errorContext}
			<div class="error-details">
				<div class="error-details-section">
					<h4>Error Details</h4>
					<pre><code>{JSON.stringify({
						code: errorContext.code,
						message: errorContext.message,
						severity: errorContext.severity,
						timestamp: errorContext.timestamp,
						component: errorContext.context?.component,
						operation: errorContext.context?.operation
					}, null, 2)}</code></pre>
				</div>

				{#if errorContext.stack}
					<div class="error-details-section">
						<h4>Stack Trace</h4>
						<pre><code>{errorContext.stack}</code></pre>
					</div>
				{/if}

				{#if errorContext.context}
					<div class="error-details-section">
						<h4>Context</h4>
						<pre><code>{JSON.stringify(errorContext.context, null, 2)}</code></pre>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.error-display {
		border-radius: 8px;
		padding: 16px;
		margin: 16px 0;
		border: 1px solid;
		background: var(--background);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		animation: fadeIn 0.3s ease-in;
	}

	.error-display-info {
		border-color: var(--info-border, #2196F3);
		background: var(--info-background, #E3F2FD);
		color: var(--info-text, #0D47A1);
	}

	.error-display-warning {
		border-color: var(--warning-border, #FF9800);
		background: var(--warning-background, #FFF3E0);
		color: var(--warning-text, #E65100);
	}

	.error-display-error {
		border-color: var(--error-border, #F44336);
		background: var(--error-background, #FFEBEE);
		color: var(--error-text, #B71C1C);
	}

	.error-display-critical {
		border-color: var(--critical-border, #D32F2F);
		background: var(--critical-background, #FFCDD2);
		color: var(--critical-text, #880E4F);
	}

	.error-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.error-icon {
		flex-shrink: 0;
	}

	.error-title {
		font-weight: 600;
		font-size: 16px;
		flex-grow: 1;
	}

	.error-dismiss {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		color: inherit;
		opacity: 0.7;
		transition: opacity 0.2s;
		border-radius: 4px;
	}

	.error-dismiss:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.1);
	}

	.error-message {
		margin-bottom: 16px;
		line-height: 1.5;
	}

	.error-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.error-action {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		border-radius: 6px;
		border: 1px solid currentColor;
		background: none;
		color: inherit;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.error-action:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

	.error-action:active {
		transform: translateY(0);
	}

	.error-action-retry {
		background: rgba(255, 255, 255, 0.1);
	}

	.error-details {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}

	.error-details-section {
		margin-bottom: 16px;
	}

	.error-details-section h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
		opacity: 0.8;
	}

	.error-details-section pre {
		margin: 0;
		padding: 12px;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 4px;
		overflow: auto;
		font-size: 12px;
		line-height: 1.4;
	}

	.error-details-section code {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 640px) {
		.error-actions {
			flex-direction: column;
		}

		.error-action {
			width: 100%;
			justify-content: center;
		}
	}
</style>