<script lang="ts">
	export let pageContext: any = {};
	export let itemContext: any = {};
	export let selectedIds: string[] = [];
	
	$: chips = computeChips();
	
	function computeChips() {
		const chips = [];
		
		// Page context chips
		if (pageContext?.page) {
			chips.push({
				id: 'page',
				label: `Page: ${pageContext.page}`,
				color: 'bg-blue-100 text-blue-800'
			});
		}
		
		if (pageContext?.projectName) {
			chips.push({
				id: 'project',
				label: `Project: ${pageContext.projectName}`,
				color: 'bg-green-100 text-green-800'
			});
		}
		
		// Item context chips
		if (itemContext?.type) {
			chips.push({
				id: 'item-type',
				label: `${itemContext.type.charAt(0).toUpperCase() + itemContext.type.slice(1)}: ${itemContext.name || itemContext.id || ''}`,
				color: 'bg-purple-100 text-purple-800'
			});
		}
		
		// Selection chips
		if (selectedIds.length > 0) {
			chips.push({
				id: 'selection',
				label: `${selectedIds.length} selected`,
				color: 'bg-yellow-100 text-yellow-800'
			});
		}
		
		// Default chip if no context
		if (chips.length === 0) {
			chips.push({
				id: 'default',
				label: 'No specific context',
				color: 'bg-gray-100 text-gray-800'
			});
		}
		
		return chips;
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each chips as chip (chip.id)}
		<div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {chip.color}">
			{chip.label}
		</div>
	{/each}
</div>