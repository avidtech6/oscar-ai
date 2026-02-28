<script lang="ts">
	import { sidebarOpen } from '$lib/stores/appStore';
	
	export let toggleSidebar: () => void;
	
	const icons: Record<string, string> = {
		menu: "i-mdi-menu",
		close: "i-mdi-close",
		chevron: "i-mdi-chevron-right"
	};
</script>

<!-- Mobile header with hamburger -->
<header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 lg:hidden">
	<!-- Mobile menu button -->
	<button
		class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
		on:click={toggleSidebar}
		aria-label="Toggle menu"
	>
		{#if $sidebarOpen}
			{@html icons.close}
		{:else}
			{@html icons.menu}
		{/if}
	</button>
	
	<h1 class="text-lg font-semibold text-forest-800">Oscar AI</h1>
	
	<!-- Placeholder for symmetry -->
	<div class="w-10"></div>
</header>

<!-- Desktop header with expand button (when sidebar collapsed) -->
{#if !$sidebarOpen}
	<header class="hidden lg:flex bg-white border-b border-gray-200 px-4 py-3 items-center justify-between flex-shrink-0">
		<button
			class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
			on:click={toggleSidebar}
			aria-label="Expand sidebar"
		>
			{@html icons.menu}
		</button>
		<span class="text-sm text-gray-500">Oscar AI</span>
		<div class="w-10"></div>
	</header>
{/if}