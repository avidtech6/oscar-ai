<script lang="ts">
	import { onMount } from 'svelte';
	
	const { expanded = false, title = 'Peek Panel' } = $props();
	
	let peekContent = $state('');
	let isProcessing = $state(false);
	let peekHistory = $state<string[]>([]);
	
	onMount(() => {
		// Initialize peek panel with default content
		peekContent = 'Ready to peek...';
	});
	
	function handlePeek() {
		isProcessing = true;
		
		// Simulate peek processing
		setTimeout(() => {
			const newPeek = `Peek at ${new Date().toLocaleTimeString()}: ${Math.random().toString(36).substring(7)}`;
			peekContent = newPeek;
			peekHistory = [newPeek, ...peekHistory.slice(0, 4)];
			isProcessing = false;
		}, 1000);
	}
	
	function clearPeek() {
		peekContent = '';
	}
</script>

<div class="peek-panel {expanded ? 'expanded' : 'collapsed'}">
	<div class="peek-header">
		<h3>{title}</h3>
		<div class="peek-controls">
			<button class="peek-btn" onclick={handlePeek} disabled={isProcessing}>
				{isProcessing ? '⏳' : '👁️'}
			</button>
			<button class="clear-btn" onclick={clearPeek}>🗑️</button>
		</div>
	</div>
	
	{#if expanded}
		<div class="peek-content">
			{#if peekContent}
				<div class="peek-current">
					<p>{peekContent}</p>
				</div>
			{:else}
				<div class="peek-placeholder">
					<p>Click 👁️ to peek</p>
				</div>
			{/if}
			
			{#if peekHistory.length > 0}
				<div class="peek-history">
					<h4>Recent Peeks:</h4>
					{#each peekHistory as peek (peek)}
						<div class="peek-item">{peek}</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.peek-panel {
		background: var(--background-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.peek-panel.collapsed {
		width: 40px;
		height: 40px;
	}

	.peek-panel.expanded {
		width: 100%;
		min-height: 300px;
	}

	.peek-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: var(--background-tertiary);
		border-bottom: 1px solid var(--border-color);
	}

	.peek-header h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.peek-controls {
		display: flex;
		gap: 8px;
	}

	.peek-btn, .clear-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 6px;
		background: var(--background-tertiary);
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		font-size: 16px;
	}

	.peek-btn:hover:not(:disabled), .clear-btn:hover {
		background: var(--background-hover);
		color: var(--text-primary);
	}

	.peek-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.peek-content {
		padding: 16px;
	}

	.peek-current {
		background: var(--background-tertiary);
		border-radius: 6px;
		padding: 12px;
		margin-bottom: 16px;
	}

	.peek-current p {
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-primary);
	}

	.peek-placeholder {
		background: var(--background-tertiary);
		border-radius: 6px;
		padding: 12px;
		margin-bottom: 16px;
		text-align: center;
		color: var(--text-secondary);
	}

	.peek-history {
		border-top: 1px solid var(--border-color);
		padding-top: 12px;
	}

	.peek-history h4 {
		margin: 0 0 8px 0;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.peek-item {
		background: var(--background-tertiary);
		border-radius: 4px;
		padding: 8px 12px;
		margin-bottom: 4px;
		font-size: 12px;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>