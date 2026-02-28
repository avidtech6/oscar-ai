<script lang="ts">
	export let item: any;
	export let sidebarOpen: boolean;
	export let expandedItems: Set<string>;
	export let icons: Record<string, string>;
	export let isActive: (href: string) => boolean;
	export let closeSidebarOnMobile: () => void;
	export let toggleExpanded: (id: string) => void;
	
	const active = isActive(item.href);
	const expanded = expandedItems.has(item.id);
	
	function handleToggle(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		toggleExpanded(item.id);
	}
</script>

<div class="space-y-1">
	<a
		href={item.href}
		on:click={closeSidebarOnMobile}
		class="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors
			   {active ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}
			   {sidebarOpen ? 'lg:justify-start' : 'lg:justify-center'}"
		title={sidebarOpen ? '' : item.label}
	>
		<span class="flex-shrink-0 w-5 h-5">
			{@html icons[item.icon] || ''}
		</span>
		{#if sidebarOpen}
			<span class="transition-opacity duration-200 flex-1">{item.label}</span>
			{#if item.subitems}
				<button
					on:click={handleToggle}
					class="p-1 text-forest-200 hover:text-white"
					aria-label={expanded ? 'Collapse' : 'Expand'}
				>
					<svg class="w-4 h-4 transform transition-transform {expanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
			{/if}
		{/if}
	</a>
	
	{#if sidebarOpen && item.subitems && expanded}
		<div class="ml-8 space-y-1">
			{#each item.subitems as subitem}
				<a
					href={subitem.href}
					on:click={closeSidebarOnMobile}
					class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm
						   {isActive(subitem.href) ? 'bg-forest-700/50 text-white' : 'text-forest-200 hover:bg-forest-700/30'}"
					title={subitem.label}
				>
					<span class="w-1.5 h-1.5 rounded-full bg-forest-400"></span>
					<span>{subitem.label}</span>
				</a>
			{/each}
		</div>
	{/if}
</div>