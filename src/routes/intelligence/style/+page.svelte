<script lang="ts">
	import { onMount } from 'svelte';
	import { getPhaseFile } from '$lib/intelligence';

	let content = '';
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			content = await getPhaseFile('PHASE_5_REPORT_STYLE_LEARNER.md');
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load phase file';
			loading = false;
		}
	});
</script>

<div class="page">
	<h1>Style Learner</h1>
	<p class="subtitle">Phase 5 — Report Style Learner</p>

	{#if loading}
		<div class="loading">Loading phase file...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<div class="phase-content">
			<pre>{content}</pre>
		</div>
	{/if}
</div>

<style>
	.page {
		padding: 2rem;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.page {
			padding: 1rem;
		}
		
		h1 {
			font-size: 1.75rem;
		}
		
		.subtitle {
			font-size: 1rem;
			margin-bottom: 1.5rem;
		}
		
		.loading, .error {
			padding: 1.5rem;
		}
		
		.phase-content {
			padding: 1.5rem;
		}
		
		pre {
			font-size: 0.75rem;
		}
	}
</style>