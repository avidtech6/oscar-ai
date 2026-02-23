<script lang="ts">
	export let type: 'nudge' | 'clarify' | 'context' | null = null;
	
	$: symbol = getSymbol();
	$: color = getColor();
	$: tooltip = getTooltip();
	
	function getSymbol() {
		switch (type) {
			case 'nudge': return '!';
			case 'clarify': return '?';
			case 'context': return '●';
			default: return '';
		}
	}
	
	function getColor() {
		switch (type) {
			case 'nudge': return 'bg-yellow-500';
			case 'clarify': return 'bg-blue-500';
			case 'context': return 'bg-green-500';
			default: return 'bg-gray-300';
		}
	}
	
	function getTooltip() {
		switch (type) {
			case 'nudge': return 'Needs your attention';
			case 'clarify': return 'Needs clarification';
			case 'context': return 'Context changed';
			default: return '';
		}
	}
	
	function getGlowClass() {
		return type ? 'animate-pulse' : '';
	}
</script>

{#if type}
	<div
		class="relative"
		title={tooltip}
	>
		<div class="w-6 h-6 rounded-full {color} {getGlowClass()} flex items-center justify-center text-white text-xs font-bold cursor-help">
			{symbol}
		</div>
	</div>
{/if}

<style>
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
	
	.animate-pulse {
		animation: pulse 2s infinite;
	}
</style>