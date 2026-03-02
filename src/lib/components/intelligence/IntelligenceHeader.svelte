<script lang="ts">
	export let capabilities: any;
</script>

<div class="page-header">
	<div>
		<h1>Intelligence Layer</h1>
		<p class="subtitle">Architectural blueprint and intelligence foundation for Oscar AI V2</p>
	</div>
	<div class="header-stats">
		<div class="stat">
			<div class="stat-value">{capabilities?.stats.totalPhases || 0}</div>
			<div class="stat-label">Phase Files</div>
		</div>
		<div class="stat">
			<div class="stat-value">{capabilities?.stats.reportEngines || 0}</div>
			<div class="stat-label">Report Engines</div>
		</div>
		<div class="stat">
			<div class="stat-value">{capabilities?.workflows?.length || 0}</div>
			<div class="stat-label">Workflows</div>
		</div>
		<div class="stat">
			<div class="stat-value">{capabilities?.stats.integrationPoints || 0}</div>
			<div class="stat-label">Integrations</div>
		</div>
	</div>
</div>