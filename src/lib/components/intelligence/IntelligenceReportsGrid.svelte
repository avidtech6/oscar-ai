<script lang="ts">
	export let reportEngines: Array<{
		name: string;
		phase: string;
		status: string;
	}> = [];
	export let getPhaseDescription: (id: string) => string = () => '';
</script>

<div class="reports-grid">
	{#each reportEngines as engine}
		<div class="report-engine-card {engine.status}">
			<div class="engine-header">
				<div class="engine-icon">⚙️</div>
				<div class="engine-info">
					<h4 class="engine-name">{engine.name}</h4>
					<div class="engine-phase">{engine.phase}</div>
				</div>
				<div class="engine-status {engine.status}">
					{engine.status}
				</div>
			</div>
			
			<div class="engine-description">
				{getPhaseDescription(engine.phase)}
			</div>
			
			<div class="engine-metrics">
				<div class="metric">
					<div class="metric-label">Processed</div>
					<div class="metric-value">1,234</div>
				</div>
				<div class="metric">
					<div class="metric-label">Accuracy</div>
					<div class="metric-value">98.5%</div>
				</div>
				<div class="metric">
					<div class="metric-label">Speed</div>
					<div class="metric-value">2.3s</div>
				</div>
			</div>
			
			<div class="engine-actions">
				<button class="action-button test">Test Engine</button>
				<button class="action-button logs">View Logs</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.reports-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.report-engine-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 1rem;
	}

	.report-engine-card.active {
		border-left: 4px solid #10b981;
	}

	.engine-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.engine-icon {
		font-size: 1.25rem;
	}

	.engine-info {
		flex: 1;
	}

	.engine-name {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.engine-phase {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.engine-status {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		text-transform: uppercase;
		background: #d1fae5;
		color: #065f46;
	}

	.engine-description {
		font-size: 0.75rem;
		color: #4b5563;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}

	.engine-metrics {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.metric {
		flex: 1;
		text-align: center;
	}

	.metric-label {
		font-size: 0.625rem;
		color: #6b7280;
		text-transform: uppercase;
		margin-bottom: 0.125rem;
	}

	.metric-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.engine-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-button.test {
		background: #8b5cf6;
		color: white;
		border-color: #8b5cf6;
	}

	.action-button.logs {
		background: white;
		color: #374151;
		border-color: #d1d5db;
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
</style>