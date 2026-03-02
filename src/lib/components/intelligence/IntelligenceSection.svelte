<script lang="ts">
	export let title: string;
	export let expanded: boolean = true;
	export let description: string = '';
	
	let isExpanded = expanded;
	
	function toggle() {
		isExpanded = !isExpanded;
	}
</script>

<div class="intelligence-section">
	<div class="section-header" on:click={toggle}>
		<h2>{title}</h2>
		<button class="toggle-button">
			{isExpanded ? '−' : '+'}
		</button>
	</div>
	
	{#if isExpanded}
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