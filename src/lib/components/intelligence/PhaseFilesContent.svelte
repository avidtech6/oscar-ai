<script lang="ts">
	import { setCurrentPeek } from '$lib/assistant/peek-store';
	
	export let architectureSummaries: any[] = [];
	
	function openPhasePeek(summary: any) {
		setCurrentPeek(
			`Phase ${summary.phase}: ${summary.title}`,
			'phase',
			{ phase: summary.phase, title: summary.title, summary: summary.summary }
		);
	}
</script>

<div class="phases-overview">
	{#each architectureSummaries as summary}
		<div class="phase-overview-card" role="button" tabindex="0" on:click={() => openPhasePeek(summary)} on:keydown={(e) => e.key === 'Enter' && openPhasePeek(summary)}>
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