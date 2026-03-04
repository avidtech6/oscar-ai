<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import GlobalAssistantBar from '$lib/assistant/GlobalAssistantBar.svelte';
	import AssistantPanel from '$lib/assistant/AssistantPanel.svelte';
	import { onMount } from 'svelte';
	import { initializeSyncEngine } from '$lib/storage/syncEngine';
	
	let sidebarCollapsed = false;

	onMount(async () => {
		// Initialize sync engine for auto-save timer
		try {
			await initializeSyncEngine();
			console.log('Sync engine initialized');
		} catch (error) {
			console.error('Failed to initialize sync engine:', error);
		}
	});
</script>

<div class="app-layout">
	<Sidebar bind:collapsed={sidebarCollapsed} />
	
	<div class="main-content" class:collapsed={sidebarCollapsed}>
		<TopNav />
		
		<div class="content-wrapper">
			<slot />
		</div>
	</div>

	<!-- Global Assistant Bar (bottom) -->
	<GlobalAssistantBar />

	<!-- Assistant Panel (floating) -->
	<AssistantPanel />
</div>

<style>
	.app-layout {
		display: flex;
		min-height: 100vh;
		background-color: #f9fafb;
	}
	
	.main-content {
		flex: 1;
		margin-left: 280px;
		transition: margin-left 0.3s ease;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	
	.main-content.collapsed {
		margin-left: 80px;
	}
	
	.content-wrapper {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
	}
	
	:global(body) {
		margin: 0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
		background-color: #f9fafb;
		color: #111827;
	}
</style>