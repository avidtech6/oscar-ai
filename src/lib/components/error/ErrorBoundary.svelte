<script lang="ts">
	import { errorHandler } from '$lib/error-handling/error-handler';
	import type { ErrorContext } from '$lib/types';
	import ErrorDisplay from './ErrorDisplay.svelte';

	export let fallback: any = null;
	export let onError: ((error: ErrorContext) => void) | null = null;
	export let resetOnPropsChange = true;

	let error: ErrorContext | null = null;
	let hasError = false;

	// Reset error when props change
	$: if (resetOnPropsChange && hasError) {
		error = null;
		hasError = false;
	}

	function handleError(e: ErrorEvent | PromiseRejectionEvent) {
		let errorObj: Error;
		let message: string;

		if (e instanceof ErrorEvent) {
			errorObj = e.error;
			message = e.message;
		} else if (e instanceof PromiseRejectionEvent) {
			errorObj = e.reason;
			message = e.reason?.message || 'Promise rejected';
		} else {
			errorObj = new Error('Unknown error');
			message = 'Unknown error';
		}

		const errorContext = errorHandler.createErrorContext(errorObj, 'error', {
			eventType: e.type,
			message
		});

		error = errorContext;
		hasError = true;

		// Call custom error handler if provided
		if (onError) {
			onError(errorContext);
		}

		// Also pass to global error handler
		errorHandler.handle(errorContext);
	}

	function resetError() {
		error = null;
		hasError = false;
	}

	// Set up global error handlers
	onMount(() => {
		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleError);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleError);
		};
	});
</script>

{#if hasError && error}
	{#if fallback}
		<svelte:component this={fallback} {error} on:reset={resetError} />
	{:else}
		<div class="error-boundary">
			<ErrorDisplay {error} onDismiss={resetError} />
			<div class="error-boundary-actions">
				<button class="error-boundary-reset" on:click={resetError}>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C9.61929 2.5 11.0979 3.212 12.125 4.375" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M13.5 4V2.5H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
					Try Again
				</button>
				<button class="error-boundary-report" on:click={() => {
					// In a real app, this would open a bug report form
					console.log('Report error:', error);
					alert('Error reported to developers');
				}}>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" stroke-width="2"/>
						<path d="M8 5V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="8" cy="11" r="1" fill="currentColor"/>
					</svg>
					Report Issue
				</button>
			</div>
		</div>
	{/if}
{:else}
	<slot />
{/if}

<style>
	.error-boundary {
		padding: 24px;
		border-radius: 12px;
		background: var(--background);
		border: 2px solid var(--error-border, #F44336);
		margin: 16px 0;
	}

	.error-boundary-actions {
		display: flex;
		gap: 12px;
		margin-top: 20px;
		justify-content: center;
	}

	.error-boundary-reset,
	.error-boundary-report {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 500;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.error-boundary-reset {
		background: var(--primary, #2196F3);
		color: white;
	}

	.error-boundary-reset:hover {
		background: var(--primary-dark, #1976D2);
		transform: translateY(-1px);
	}

	.error-boundary-report {
		background: var(--surface, #F5F5F5);
		color: var(--text, #333);
		border: 1px solid var(--border, #DDD);
	}

	.error-boundary-report:hover {
		background: var(--surface-dark, #E0E0E0);
		transform: translateY(-1px);
	}

	@media (max-width: 640px) {
		.error-boundary-actions {
			flex-direction: column;
		}

		.error-boundary-reset,
		.error-boundary-report {
			width: 100%;
			justify-content: center;
		}
	}
</style>