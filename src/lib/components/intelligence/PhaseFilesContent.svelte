<script lang="ts">
	export let architectureSummaries: any[] = [];
</script>

<div class="phases-overview">
	{#each architectureSummaries as summary}
		<div class="phase-overview-card">
			<div class="phase-id">Phase {summary.phase}</div>
			<h4 class="phase-name">{summary.title}</h4>
			<p class="phase-description">{summary.summary}</p>
			<div class="phase-meta">
				<span class="meta-item">📊 {summary.keyPoints.length} key points</span>
				<span class="meta-item">🏷️ {summary.category || 'general'}</span>
			</div>
		</div>
	{/each}
</div>