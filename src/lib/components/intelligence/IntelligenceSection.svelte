<script lang="ts">
	import { intelligenceStore } from '$lib/assistant/IntelligenceStore';
	
	export let title: string;
	export let sectionKey: keyof typeof intelligenceStore.sectionExpanded;
	export let description: string = '';
	
	function toggle() {
		intelligenceStore.toggleSection(sectionKey);
		dispatch('toggle');
	}
</script>

<div class="intelligence-section">
	<div class="section-header" on:click={toggle}>
		<h2>{title}</h2>
		<button class="toggle-button">
			{$intelligenceStore.sectionExpanded[sectionKey] ? '−' : '+'}
		</button>
	</div>
	
	{#if $intelligenceStore.sectionExpanded[sectionKey]}
		<div class="section-content">
			{#if description}
				<p class="section-description">{description}</p>
			{/if}
			<slot />
		</div>
	{/if}
</div>

<style>
	@import './IntelligenceSection.css';
</style>