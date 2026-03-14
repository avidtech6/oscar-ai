<script lang="ts">
	export let workflows: Array<{
		name: string;
		steps: string[];
		active: boolean;
	}> = [];
</script>

<div class="workflows-list">
	{#each workflows as workflow}
		<div class="workflow-card {workflow.active ? 'active' : 'inactive'}">
			<div class="workflow-header">
				<div class="workflow-icon">🔄</div>
				<h4 class="workflow-name">{workflow.name}</h4>
				<div class="workflow-status">
					{workflow.active ? 'Active' : 'Inactive'}
				</div>
			</div>
			
			<div class="workflow-steps">
				{#each workflow.steps as step, i}
					<div class="workflow-step">
						<div class="step-number">{i + 1}</div>
						<div class="step-name">{step}</div>
						<div class="step-connector"></div>
					</div>
				{/each}
			</div>
			
			<div class="workflow-actions">
				<button class="action-button run">Run Workflow</button>
				<button class="action-button configure">Configure</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.workflows-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.workflow-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 1rem;
	}

	.workflow-card.active {
		border-left: 4px solid #10b981;
	}

	.workflow-card.inactive {
		border-left: 4px solid #9ca3af;
		opacity: 0.7;
	}

	.workflow-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.workflow-icon {
		font-size: 1.25rem;
	}

	.workflow-name {
		flex: 1;
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.workflow-status {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		text-transform: uppercase;
		background: #d1fae5;
		color: #065f46;
	}

	.workflow-card.inactive .workflow-status {
		background: #f3f4f6;
		color: #374151;
	}

	.workflow-steps {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.workflow-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.step-number {
		width: 24px;
		height: 24px;
		background: #3b82f6;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.step-name {
		font-size: 0.75rem;
		color: #4b5563;
		text-align: center;
	}

	.step-connector {
		width: 100%;
		height: 2px;
		background: #e5e7eb;
		margin-top: -13px;
		margin-left: 12px;
	}

	.workflow-step:last-child .step-connector {
		display: none;
	}

	.workflow-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-button.run {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.action-button.configure {
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