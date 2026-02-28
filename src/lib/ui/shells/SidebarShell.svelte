<script lang="ts">
	import { sidebarOpen } from '$lib/stores/appStore';
	import { fade, fly } from 'svelte/transition';
	import SidebarSection from './SidebarSection.svelte';
	import SidebarItem from './SidebarItem.svelte';
	import SidebarIcon from './SidebarIcon.svelte';
	
	export let navSections: any[];
	export let expandedItems: Set<string>;
	export let icons: Record<string, string>;
	export let isActive: (href: string) => boolean;
	export let closeSidebarOnMobile: () => void;
	export let toggleExpanded: (id: string) => void;
	export let loading: boolean;
	export let projects: any[];
	
	function toggleSidebar() {
		sidebarOpen.update(v => !v);
	}
</script>

<!-- Mobile overlay backdrop -->
{#if $sidebarOpen}
	<div 
		class="fixed inset-0 bg-black/50 z-40 lg:hidden"
		on:click={toggleSidebar}
		on:keydown={(e) => e.key === 'Escape' && toggleSidebar()}
		role="button"
		tabindex="0"
		aria-label="Close menu"
		transition:fade={{ duration: 200 }}
	></div>
{/if}

<!-- Sidebar - Desktop: fixed width, Mobile: slide-in drawer -->
<aside 
	class="fixed lg:relative z-50 lg:z-auto
		   w-64 h-full bg-forest-800 text-white flex flex-col
		   transform transition-transform duration-300 ease-in-out
		   {$sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}"
>
	<!-- Logo & Collapse Button -->
	<div class="p-4 border-b border-forest-700 flex items-center justify-between flex-shrink-0">
		{#if $sidebarOpen}
			<div class="flex items-center gap-2" transition:fly={{ x: -20, duration: 200 }}>
				<span class="text-2xl">🌳</span>
				{#if $sidebarOpen}
					<div class="transition-opacity duration-200">
						<h1 class="text-lg font-bold">Oscar AI</h1>
						<p class="text-xs text-forest-200">Arboricultural</p>
					</div>
				{/if}
			</div>
		{:else}
			<span class="text-2xl mx-auto">🌳</span>
		{/if}
		
		<!-- Desktop toggle button -->
		<button
			class="hidden lg:flex p-1 text-forest-200 hover:text-white transition-colors"
			on:click={toggleSidebar}
			aria-label={$sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
		>
			{@html icons.chevron}
		</button>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 p-2 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
		{#each navSections as section, sectionIndex}
			<SidebarSection 
				title={section.title} 
				sectionIndex={sectionIndex} 
				sidebarOpen={$sidebarOpen}
			>
				{#each section.items as item}
					<SidebarItem
						{item}
						sidebarOpen={$sidebarOpen}
						{expandedItems}
						{icons}
						{isActive}
						{closeSidebarOnMobile}
						{toggleExpanded}
					/>
				{/each}
			</SidebarSection>
		{/each}

		<!-- Projects Section -->
		<SidebarSection 
			title="Projects" 
			sectionIndex={navSections.length} 
			sidebarOpen={$sidebarOpen}
		>
			{#if $sidebarOpen}
				<div class="flex items-center justify-between px-3 mb-2">
					<a
						href="/workspace/new"
						on:click={closeSidebarOnMobile}
						class="p-1 text-forest-200 hover:text-white hover:bg-forest-700 rounded transition-colors"
						title="New Project"
					>
						<SidebarIcon icon="plus" {icons} />
					</a>
				</div>
				
				{#if loading}
					<div class="px-3 py-2 text-sm text-forest-200">Loading...</div>
				{:else if projects.length === 0}
					<div class="px-3 py-2 text-sm text-forest-200">No projects yet</div>
				{:else}
					{#each projects as project}
						<a
							href="/project/{project.id}"
							on:click={closeSidebarOnMobile}
							class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
								   {isActive('/project/' + project.id) ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}"
							title={project.name}
						>
							<SidebarIcon icon="folder" {icons} />
							<span class="truncate text-sm">{project.name}</span>
						</a>
					{/each}
				{/if}
			{:else}
				<!-- Collapsed Projects button -->
				<a
					href="/workspace"
					on:click={closeSidebarOnMobile}
					class="flex items-center justify-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors
						   {isActive('/workspace') ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}"
					title="Projects"
				>
					<SidebarIcon icon="folder" {icons} />
				</a>
			{/if}
		</SidebarSection>
	</nav>
</aside>