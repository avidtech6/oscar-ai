<script lang="ts">
	export let reports: any[] = [];
	export let intelligencePhaseCount = 0;
</script>

<div class="reports-stats">
	<div class="stat">
		<div class="stat-value">{reports.length}</div>
		<div class="stat-label">Total Reports</div>
	</div>
	<div class="stat">
		<div class="stat-value">{reports.filter(r => r.status === 'draft').length}</div>
		<div class="stat-label">Drafts</div>
	</div>
	<div class="stat">
		<div class="stat-value">{reports.filter(r => r.status === 'published').length}</div>
		<div class="stat-label">Published</div>
	</div>
	<div class="stat">
		<div class="stat-value">{intelligencePhaseCount}</div>
		<div class="stat-label">Intelligence Layers</div>
	</div>
</div>

<style>
	.reports-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	
	.stat {
		background: var(--background);
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		border: 1px solid var(--border);
		transition: all 0.2s ease;
	}
	
	.stat:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		border-color: var(--primary);
	}
	
	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--primary);
		margin-bottom: 0.25rem;
	}
	
	.stat-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-weight: 500;
	}
	
	@media (max-width: 768px) {
		.reports-stats {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.75rem;
			margin-bottom: 1.5rem;
		}
		
		.stat {
			padding: 1rem;
		}
		
		.stat-value {
			font-size: 1.5rem;
		}
	}
	
	@media (max-width: 480px) {
		.reports-stats {
			grid-template-columns: 1fr;
		}
	}
</style>