<script lang="ts">
	import type { ContextHint } from './contextPanelStore';
	
	export let hint: ContextHint;
	export let showPriority: boolean = false;
	
	// Format timestamp
	function formatTime(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
	
	// Get priority color
	function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
		switch (priority) {
			case 'high': return '#ef4444';
			case 'medium': return '#f59e0b';
			case 'low': return '#10b981';
			default: return '#6b7280';
		}
	}
	
	// Get priority label
	function getPriorityLabel(priority: 'low' | 'medium' | 'high'): string {
		switch (priority) {
			case 'high': return 'High';
			case 'medium': return 'Medium';
			case 'low': return 'Low';
			default: return 'Normal';
		}
	}
</script>

<div class="context-panel-hint" class:seen={hint.seen} class:actionable={hint.actionable}>
	<div class="hint-header">
		<div class="hint-title-row">
			<h4 class="hint-title">{hint.title}</h4>
			{#if showPriority}
				<span
					class="priority-badge"
					style="background-color: {getPriorityColor(hint.priority)}20; color: {getPriorityColor(hint.priority)};"
				>
					{getPriorityLabel(hint.priority)}
				</span>
			{/if}
		</div>
		
		{#if hint.timestamp}
			<span class="hint-timestamp" title={new Date(hint.timestamp).toLocaleString()}>
				{formatTime(hint.timestamp)}
			</span>
		{/if}
	</div>
	
	{#if hint.description}
		<p class="hint-description">{hint.description}</p>
	{/if}
	
	{#if hint.actionable && hint.actionLabel}
		<div class="hint-actions">
			<button
				class="hint-action-button"
				on:click
				aria-label={hint.actionLabel}
			>
				{hint.actionLabel}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	{/if}
	
	<div class="hint-footer">
		{#if hint.source}
			<span class="hint-source">From: {hint.source}</span>
		{/if}
		
		{#if hint.seen}
			<span class="seen-indicator" title="Already seen">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<path d="M22 4L12 14.01l-3-3" />
				</svg>
			</span>
		{/if}
	</div>
</div>

<style>
	.context-panel-hint {
		padding: 1rem;
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}
	
	.context-panel-hint.seen {
		opacity: 0.8;
		background-color: #f9fafb;
	}
	
	.context-panel-hint.actionable {
		border-left: 3px solid #3b82f6;
	}
	
	.context-panel-hint:hover {
		background-color: #f9fafb;
		border-color: #d1d5db;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	
	.hint-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}
	
	.hint-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}
	
	.hint-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}
	
	.priority-badge {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.hint-timestamp {
		font-size: 0.75rem;
		color: #6b7280;
		white-space: nowrap;
	}
	
	.hint-description {
		font-size: 0.8125rem;
		color: #4b5563;
		margin: 0 0 0.75rem;
		line-height: 1.4;
	}
	
	.hint-actions {
		margin-top: 0.75rem;
	}
	
	.hint-action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.hint-action-button:hover {
		background-color: #2563eb;
	}
	
	.hint-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.75rem;
		padding-top: 0.5rem;
		border-top: 1px solid #f3f4f6;
	}
	
	.hint-source {
		font-size: 0.6875rem;
		color: #9ca3af;
	}
	
	.seen-indicator {
		color: #10b981;
		display: flex;
		align-items: center;
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.context-panel-hint {
			background-color: #1f2937;
			border-color: #374151;
		}
		
		.context-panel-hint.seen {
			background-color: #111827;
		}
		
		.context-panel-hint:hover {
			background-color: #111827;
			border-color: #4b5563;
		}
		
		.hint-title {
			color: #f9fafb;
		}
		
		.hint-timestamp {
			color: #9ca3af;
		}
		
		.hint-description {
			color: #d1d5db;
		}
		
		.hint-action-button {
			background-color: #2563eb;
		}
		
		.hint-action-button:hover {
			background-color: #1d4ed8;
		}
		
		.hint-footer {
			border-top-color: #374151;
		}
		
		.hint-source {
			color: #6b7280;
		}
		
		.seen-indicator {
			color: #10b981;
		}
	}
</style>