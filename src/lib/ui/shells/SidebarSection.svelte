<script lang="ts">
	export let title: string;
	export let sectionIndex: number;
	export let sidebarOpen: boolean;
</script>

{#if sidebarOpen && title}
	<div class="pt-4 {sectionIndex > 0 ? 'mt-4 border-t border-forest-700' : ''}">
		<div class="px-3 mb-2">
			<span class="text-xs font-semibold text-forest-300 uppercase tracking-wider">{title}</span>
		</div>
	</div>
{/if}

<slot />