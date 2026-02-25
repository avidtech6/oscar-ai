<script lang="ts">
	import type { AssistAction } from './assistLayerStore';
	
	export let action: AssistAction;
	
	// Get icon SVG
	function getIconSvg(icon: string) {
		switch (icon) {
			case 'edit':
				return 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7';
			case 'camera':
				return 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z';
			case 'mic':
				return 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z';
			case 'scan':
				return 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2';
			case 'file-text':
				return 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8';
			case 'globe':
				return 'M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9';
			case 'pen-tool':
				return 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586';
			case 'code':
				return 'M16 18l6-6-6-6 M8 6l-6 6 6 6';
			case 'home':
				return 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10';
			case 'folder':
				return 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z';
			case 'file':
				return 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7';
			case 'calendar':
				return 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18';
			default:
				return 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5';
		}
	}
</script>

<button
	class="assist-action-button"
	class:disabled={action.disabled}
	on:click
	aria-label={action.title}
	title={action.description}
>
	<div class="action-icon">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d={getIconSvg(action.icon)} />
		</svg>
	</div>
	<div class="action-content">
		<h4 class="action-title">{action.title}</h4>
		<p class="action-description">{action.description}</p>
	</div>
	{#if action.requiresConfirmation}
		<div class="confirmation-indicator" title="Requires confirmation">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4M12 8h.01" />
			</svg>
		</div>
	{/if}
</button>

<style>
	.assist-action-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
	}
	
	.assist-action-button:hover:not(.disabled) {
		background-color: #f9fafb;
		border-color: #d1d5db;
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}
	
	.assist-action-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.action-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		margin-bottom: 0.5rem;
		color: #3b82f6;
		background-color: #eff6ff;
		border-radius: 0.375rem;
	}
	
	.action-content {
		flex: 1;
	}
	
	.action-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.125rem;
		line-height: 1.2;
	}
	
	.action-description {
		font-size: 0.625rem;
		color: #6b7280;
		margin: 0;
		line-height: 1.2;
	}
	
	.confirmation-indicator {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		color: #f59e0b;
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.assist-action-button {
			background-color: #1f2937;
			border-color: #374151;
		}
		
		.assist-action-button:hover:not(.disabled) {
			background-color: #111827;
			border-color: #4b5563;
		}
		
		.action-icon {
			color: #60a5fa;
			background-color: #1e3a8a;
		}
		
		.action-title {
			color: #f9fafb;
		}
		
		.action-description {
			color: #9ca3af;
		}
		
		.confirmation-indicator {
			color: #fbbf24;
		}
	}
</style>