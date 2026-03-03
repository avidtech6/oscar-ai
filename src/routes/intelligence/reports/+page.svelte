<script lang="ts">
	import { onMount } from 'svelte';
	import { getPhaseFile } from '$lib/intelligence';

	let content = '';
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			content = await getPhaseFile('PHASE_2_REPORT_DECOMPILER_ENGINE.md');
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load phase file';
			loading = false;
		}
	});
</script>

<div class="page">
	<h1>Report Intelligence</h1>
	<p class="subtitle">Phase 2 — Report Decompiler Engine</p>

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
	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #6b7280;
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}
	.loading, .error {
		padding: 2rem;
		background: #f9fafb;
		border-radius: 8px;
		text-align: center;
	}
	.error {
		color: #dc2626;
	}
	.phase-content {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 2rem;
		overflow-x: auto;
	}
	pre {
		margin: 0;
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		white-space: pre-wrap;
	}
</style>