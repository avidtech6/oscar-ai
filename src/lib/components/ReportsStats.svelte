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
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	
	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
	}
</style>