<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import GlobalAssistantBar from '$lib/assistant/GlobalAssistantBar.svelte';
	import AssistantPanel from '$lib/assistant/AssistantPanel.svelte';
	import PeekPanel from '$lib/assistant/PeekPanel.svelte';
	import SystemStatusIndicator from '$lib/components/SystemStatusIndicator.svelte';
	import UnifiedSearch from '$lib/components/UnifiedSearch.svelte';
	import CollaborationPanel from '$lib/components/CollaborationPanel.svelte';
	import { onMount } from 'svelte';
	import { initializeSyncEngine } from '$lib/storage/syncEngine';
	
	let sidebarCollapsed = false;
	let showSystemStatus = $state(false);
	let showUnifiedSearch = $state(false);
	let showCollaboration = $state(false);

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
	<!-- Left Sidebar -->
	<Sidebar bind:collapsed={sidebarCollapsed} />
	
	<!-- Main Content Area -->
	<div class="main-content" class:collapsed={sidebarCollapsed}>
		<TopNav />
		
		<div class="content-wrapper">
			<slot />
		</div>
	</div>

	<!-- Right Panel (Intelligence Context) -->
	<div class="right-panel" class:collapsed={sidebarCollapsed}>
		<div class="panel-header">
			<h3>Context Intelligence</h3>
			<div class="panel-controls">
				<button class="panel-toggle" aria-label="Toggle panel">
					⚙️
				</button>
				<button class="panel-close" aria-label="Close panel">
					✕
				</button>
			</div>
		</div>
		
		<div class="panel-content">
			<div class="panel-header">
				<h3>🔧 System Intelligence</h3>
				<button class="toggle-btn" onclick={() => showSystemStatus = !showSystemStatus}>
					{showSystemStatus ? 'Hide' : 'Show'} Status
				</button>
			</div>
			
			{#if showSystemStatus}
				<div class="system-status-section">
					<SystemStatusIndicator />
				</div>
			{/if}
			
			{#if !showSystemStatus}
				<div class="intelligence-status">
					<h4>System Status</h4>
					<div class="status-items">
						<div class="status-item active">
							<span class="status-indicator"></span>
							<span>Report Intelligence</span>
						</div>
						<div class="status-item active">
							<span class="status-indicator"></span>
							<span>Content Intelligence</span>
						</div>
						<div class="status-item active">
							<span class="status-indicator"></span>
							<span>Global Assistant</span>
						</div>
					</div>
				</div>
				
				<div class="context-info">
					<h4>Current Context</h4>
					<div class="context-details">
						<p>Active Document: <span>Report Analysis</span></p>
						<p>Phase: <span>PHASE_1-10</span></p>
						<p>Intelligence Level: <span>Active</span></p>
					</div>
				</div>
				
				<div class="quick-actions">
					<h4>Quick Actions</h4>
					<div class="action-buttons">
						<button class="action-btn" onclick={() => showUnifiedSearch = !showUnifiedSearch}>
							🔍 {showUnifiedSearch ? 'Close' : 'Unified Search'}
						</button>
						<button class="action-btn">📊 Generate</button>
						<button class="action-btn">🤖 Ask Oscar</button>
						<button class="action-btn">📋 Export</button>
						<button class="action-btn" onclick={() => showCollaboration = !showCollaboration}>
							👥 {showCollaboration ? 'Close' : 'Collaboration'}
						</button>
					</div>
				</div>
			{/if}
		</div>
		
		{#if showUnifiedSearch}
			<div class="unified-search-container">
				<UnifiedSearch onclose={() => showUnifiedSearch = false} />
			</div>
		{/if}
		
		{#if showCollaboration}
			<div class="collaboration-container">
				<CollaborationPanel onclose={() => showCollaboration = false} />
			</div>
		{/if}
	</div>

	<!-- Global Assistant Bar (bottom) -->
	<GlobalAssistantBar />

	<!-- Assistant Panel (floating) -->
	<AssistantPanel />

	<!-- Peek Panel (floating from right) -->
	<PeekPanel />
</div>

<style>
	.app-layout {
		display: flex;
		min-height: 100vh;
		background: var(--background);
		position: relative;
	}
	
	.main-content {
		flex: 1;
		transition: margin-left 0.3s ease, margin-right 0.3s ease;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		margin-right: 320px;
	}
	
	.main-content.collapsed {
		margin-left: 0;
		margin-right: 320px;
	}
	
	.right-panel {
		width: 320px;
		background: linear-gradient(180deg, var(--background) 0%, var(--background-hover) 100%);
		border-left: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		transition: transform 0.3s ease, opacity 0.3s ease;
		position: fixed;
		right: 0;
		top: 0;
		height: 100vh;
		z-index: 100;
		box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
	}
	
	.right-panel.collapsed {
		transform: translateX(100%);
		opacity: 0;
		pointer-events: none;
	}
	
	.panel-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
		background: var(--background);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.panel-header h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
		margin: 0;
	}

	.unified-search-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.unified-search-container .unified-search {
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.collaboration-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.collaboration-container .collaboration-panel {
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		overflow-y: auto;
	}
	
	.panel-controls {
		display: flex;
		gap: 0.5rem;
	}
	
	.panel-toggle, .panel-close {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		border-radius: 0.25rem;
		color: var(--text-secondary);
		transition: all 0.2s ease;
		font-size: 1rem;
	}
	
	.panel-toggle:hover, .panel-close:hover {
		background: var(--background-hover);
		color: var(--text);
	}
	
	.panel-content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.intelligence-status, .context-info, .quick-actions {
		background: var(--background);
		border-radius: 0.5rem;
		padding: 1rem;
		border: 1px solid var(--border);
		transition: all 0.2s ease;
	}
	
	.intelligence-status:hover, .context-info:hover, .quick-actions:hover {
		border-color: var(--primary);
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
	}
	
	.intelligence-status h4, .context-info h4, .quick-actions h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0 0 0.75rem 0;
	}
	
	.status-items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.status-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}
	
	.status-indicator {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: #10b981;
	}
	
	.context-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.context-details p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}
	
	.context-details span {
		font-weight: 500;
		color: var(--text);
	}
	
	.action-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}
	
	.action-btn {
		background: var(--background-hover);
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		padding: 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--text);
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}
	
	.action-btn:hover {
		background: var(--background);
		border-color: var(--primary);
		color: var(--primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
	}
	
	.content-wrapper {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
	}
	
	:global(body) {
		margin: 0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
		background: var(--background);
		color: var(--text);
	}
	
	/* Enhanced Mobile responsiveness */
	@media (max-width: 1280px) {
		.right-panel {
			width: 300px;
		}
		
		.main-content {
			margin-right: 300px;
		}
		
		.main-content.collapsed {
			margin-right: 300px;
		}
	}
	
	@media (max-width: 1024px) {
		.right-panel {
			width: 280px;
		}
		
		.main-content {
			margin-right: 280px;
		}
		
		.main-content.collapsed {
			margin-right: 280px;
		}
		
		.content-wrapper {
			padding: 1rem;
		}
	}
	
	@media (max-width: 768px) {
		.app-layout {
			flex-direction: column;
		}
		
		.right-panel {
			width: 100%;
			transform: translateX(100%);
			height: 50vh;
			bottom: 0;
			top: auto;
			border-left: none;
			border-top: 1px solid var(--border);
			border-radius: 12px 12px 0 0;
		}
		
		.right-panel.collapsed {
			transform: translateY(100%);
		}
		
		.right-panel:not(.collapsed) {
			transform: translateY(0);
		}
		
		.main-content {
			margin-right: 0;
			flex: 1;
		}
		
		.main-content.collapsed {
			margin-right: 0;
		}
		
		.content-wrapper {
			padding: 1rem;
		}
		
		.panel-content {
			padding: 0.75rem;
		}
		
		.intelligence-status, .context-info, .quick-actions {
			padding: 0.75rem;
		}
		
		.action-buttons {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}
		
		.action-btn {
			padding: 0.375rem;
			font-size: 0.75rem;
		}
	}
	
	@media (max-width: 480px) {
		.content-wrapper {
			padding: 0.75rem;
		}
		
		.panel-header {
			padding: 0.75rem 1rem;
		}
		
		.panel-content {
			padding: 0.5rem;
		}
		
		.intelligence-status, .context-info, .quick-actions {
			padding: 0.5rem;
		}
		
		.action-buttons {
			gap: 0.125rem;
		}
	}
</style>