<script lang="ts">
	export let phases: Array<{
		id: string;
		name: string;
		description: string;
		path: string;
		size: number;
		modified: string;
	}> = [];
	export let selectedPhase: string | null = null;
	export let getPhaseDescription: (id: string) => string = () => '';
	export let getPhaseStatus: (id: string) => 'active' | 'inactive' | 'pending' = () => 'pending';
	export let onSelectPhase: (id: string) => void = () => {};
</script>

<div class="phases-grid">
	{#each phases as phase}
		<div 
			class="phase-card {getPhaseStatus(phase.id)} {selectedPhase === phase.id ? 'selected' : ''}"
			on:click={() => onSelectPhase(phase.id)}
		>
			<div class="phase-header">
				<div class="phase-icon">📄</div>
				<div class="phase-info">
					<h4 class="phase-name">{phase.name}</h4>
					<div class="phase-id">{phase.id}</div>
				</div>
				<div class="phase-status {getPhaseStatus(phase.id)}">
					{getPhaseStatus(phase.id)}
				</div>
			</div>
			
			<div class="phase-description">
				{getPhaseDescription(phase.id)}
			</div>
			
			{#if selectedPhase === phase.id}
				<div class="phase-details">
					<div class="detail-item">
						<strong>Path:</strong> {phase.path}
					</div>
					<div class="detail-item">
						<strong>Size:</strong> {phase.size} bytes
					</div>
					<div class="detail-item">
						<strong>Last Modified:</strong> {phase.modified}
					</div>
					<div class="detail-actions">
						<button class="action-button view">View</button>
						<button class="action-button integrate">Integrate</button>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.phases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.phase-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.phase-card:hover {
		border-color: #d1d5db;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.phase-card.selected {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.phase-card.active {
		border-left: 4px solid #10b981;
	}

	.phase-card.inactive {
		border-left: 4px solid #f59e0b;
	}

	.phase-card.pending {
		border-left: 4px solid #9ca3af;
	}

	.phase-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.phase-icon {
		font-size: 1.25rem;
	}

	.phase-info {
		flex: 1;
	}

	.phase-name {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.phase-id {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.phase-status {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		text-transform: uppercase;
	}

	.phase-status.active {
		background: #d1fae5;
		color: #065f46;
	}

	.phase-status.inactive {
		background: #fef3c7;
		color: #92400e;
	}

	.phase-status.pending {
		background: #f3f4f6;
		color: #374151;
	}

	.phase-description {
		font-size: 0.75rem;
		color: #4b5563;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}

	.phase-details {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #e5e7eb;
	}

	.detail-item {
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.detail-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.action-button {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.action-button.view {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.action-button.integrate {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}
</style>