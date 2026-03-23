<script lang="ts">
	import type { ValidationResult, ValidationError } from '$lib/validation';
	import { getErrorMessageConfig, getUserFriendlyError, formatValidationError } from '$lib/error-handling/error-messages';

	export let errors: ValidationError[] = [];
	export let fieldName: string | null = null;
	export let showAll = false;
	export let maxErrors = 3;
	export let onFocusField: ((fieldName: string) => void) | null = null;

	// Filter errors by field if fieldName is provided
	$: filteredErrors = fieldName
		? errors.filter(error => error.field === fieldName)
		: errors;

	// Limit number of errors shown
	$: displayedErrors = showAll
		? filteredErrors
		: filteredErrors.slice(0, maxErrors);

	// Check if there are more errors than shown
	$: hasMoreErrors = filteredErrors.length > displayedErrors.length;
	$: errorCount = filteredErrors.length;

	function handleFocusField(field: string) {
		if (onFocusField) {
			onFocusField(field);
		} else {
			// Default behavior: focus on the field
			const fieldElement = document.querySelector(`[name="${field}"], [data-field="${field}"]`);
			if (fieldElement) {
				(fieldElement as HTMLElement).focus();
			}
		}
	}

	function getErrorIcon(error: ValidationError): string {
		// Use the error-messages utility to get icon
		const config = getErrorMessageConfig(error.rule || 'validation_error');
		return config?.icon || '❌';
	}

	function getErrorMessage(error: ValidationError): string {
		// Use the error-messages utility to get user-friendly message
		return formatValidationError(error);
	}
</script>

{#if errorCount > 0}
	<div class="validation-errors" role="alert" aria-live="polite">
		<div class="validation-header">
			<div class="validation-icon">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
				</svg>
			</div>
			<div class="validation-title">
				{#if fieldName}
					Field Errors ({errorCount})
				{:else}
					Validation Errors ({errorCount})
				{/if}
			</div>
		</div>

		<ul class="error-list">
			{#each displayedErrors as error (error.id || error.field)}
				<li class="error-item">
					<div class="error-item-content">
						<div class="error-icon">{getErrorIcon(error.type)}</div>
						<div class="error-details">
							<div class="error-message">{getErrorMessage(error)}</div>
							{#if error.field && !fieldName}
								<div class="error-field">
									<button
										class="error-field-link"
										on:click={() => handleFocusField(error.field!)}
										on:keydown={(e) => e.key === 'Enter' && handleFocusField(error.field!)}
										tabindex="0"
									>
										Field: {error.field}
									</button>
								</div>
							{/if}
							{#if error.params}
								<div class="error-params">
									<small>Parameters: {JSON.stringify(error.params)}</small>
								</div>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>

		{#if hasMoreErrors}
			<div class="validation-footer">
				<button
					class="show-more-button"
					on:click={() => showAll = !showAll}
				>
					{#if showAll}
						Show fewer errors
					{:else}
						Show all {filteredErrors.length} errors
					{/if}
				</button>
			</div>
		{/if}

		{#if !fieldName && errorCount > 1}
			<div class="validation-actions">
				<button
					class="validation-action"
					on:click={() => {
						// Focus on first error field
						const firstError = filteredErrors[0];
						if (firstError?.field) {
							handleFocusField(firstError.field);
						}
					}}
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M8 3V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
					Go to First Error
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.validation-errors {
		border-radius: 8px;
		padding: 16px;
		margin: 16px 0;
		border: 1px solid var(--error-border, #F44336);
		background: var(--error-background, #FFEBEE);
		color: var(--error-text, #B71C1C);
		animation: fadeIn 0.3s ease-in;
	}

	.validation-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.validation-icon {
		flex-shrink: 0;
	}

	.validation-title {
		font-weight: 600;
		font-size: 16px;
	}

	.error-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.error-item {
		margin-bottom: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.error-item:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}

	.error-item-content {
		display: flex;
		gap: 12px;
	}

	.error-icon {
		flex-shrink: 0;
		font-size: 18px;
		line-height: 1;
	}

	.error-details {
		flex-grow: 1;
	}

	.error-message {
		margin-bottom: 4px;
		line-height: 1.4;
	}

	.error-field {
		margin-bottom: 4px;
	}

	.error-field-link {
		background: none;
		border: none;
		padding: 0;
		color: inherit;
		text-decoration: underline;
		cursor: pointer;
		font-size: 14px;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.error-field-link:hover {
		opacity: 1;
	}

	.error-params {
		font-size: 12px;
		opacity: 0.7;
		margin-top: 2px;
	}

	.validation-footer {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.show-more-button {
		background: none;
		border: 1px solid currentColor;
		color: inherit;
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.show-more-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

	.validation-actions {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: center;
	}

	.validation-action {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		border-radius: 8px;
		background: var(--primary, #2196F3);
		color: white;
		border: none;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.validation-action:hover {
		background: var(--primary-dark, #1976D2);
		transform: translateY(-1px);
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
		.error-item-content {
			flex-direction: column;
			gap: 8px;
		}

		.error-icon {
			align-self: flex-start;
		}
	}
</style>