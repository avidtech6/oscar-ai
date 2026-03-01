<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/appStore';
	import { onMount } from 'svelte';
	import { initSettings } from '$lib/stores/settings';
	import { onUserPrompt } from '$lib/copilot/eventModel';
	import { onDestroy } from 'svelte';
	import { appInit } from '$lib/system/AppInit';
	import { debugStore } from '$lib/stores/debugStore';
	import { initializeSafeMode, withSafeMode } from '$lib/safeMode/integration';

	// Module-defined Oscar UI Components
	import SidebarShell from '$lib/ui/shells/SidebarShell.svelte';
	import RightPanel from '$lib/ui/shells/RightPanel.svelte';
	import SheetSystem from '$lib/ui/shells/SheetSystem.svelte';
	import AskOscarBar from '$lib/ui/shells/AskOscarBar.svelte';
	import PeekPanel from '$lib/ui/shells/PeekPanel.svelte';

	const debugVisible = debugStore.visible;
	
	// App initialization state
	let appInitialized = false;
	let loading = true;

	// Update copilot context when route changes
	$: {
		// Update route context when page changes
		// This will be implemented in the copilot context module
	}

	// Module 2: Navigation Structure
	// According to Module 2, sidebar contains:
	// Home, Workspace (Projects, Tasks, Notes, Reports, Calendar), Files, Connect, Map, Dashboard (Settings, Support, Documents), Recent (3-4 dynamic)
	const navSections = [
	  {
	    title: 'Core Domains',
	    items: [
	      { id: 'home', label: 'Home', icon: 'home', href: '/' },
	      {
	        id: 'workspace',
	        label: 'Workspace',
	        icon: 'folder',
	        href: '/workspace',
	        subitems: [
	          { id: 'workspace-projects', label: 'Projects', href: '/workspace?view=projects' },
	          { id: 'workspace-tasks', label: 'Tasks', href: '/workspace?view=tasks' },
	          { id: 'workspace-notes', label: 'Notes', href: '/workspace?view=notes' },
	          { id: 'workspace-reports', label: 'Reports', href: '/workspace?view=reports' },
	          { id: 'workspace-calendar', label: 'Calendar', href: '/workspace?view=calendar' }
	        ]
	      },
	      { id: 'files', label: 'Files', icon: 'notes', href: '/files' },
	      { id: 'connect', label: 'Connect', icon: 'email', href: '/connect' },
	      { id: 'map', label: 'Map', icon: 'map', href: '/map' },
	      {
	        id: 'dashboard',
	        label: 'Dashboard',
	        icon: 'cog',
	        href: '/dashboard',
	        subitems: [
	          { id: 'dashboard-settings', label: 'Settings', href: '/dashboard?view=settings' },
	          { id: 'dashboard-support', label: 'Support', href: '/dashboard?view=support' },
	          { id: 'dashboard-documents', label: 'Documents', href: '/dashboard?view=documents' }
	        ]
	      }
	    ]
	  }
	];

	// Track expanded state for items with subitems
	let expandedItems = new Set(['workspace', 'dashboard']);

	function toggleExpanded(itemId: string) {
		if (expandedItems.has(itemId)) {
			expandedItems.delete(itemId);
		} else {
			expandedItems.add(itemId);
		}
		expandedItems = new Set(expandedItems); // Trigger reactivity
	}

	// Recent items (dynamic, will be populated from store)
	let recentItems: Array<{id: string, label: string, href: string, icon: string}> = [];

	// Projects list (for sidebar)
	let projects: any[] = [];

	// Icons mapping
	const icons: Record<string, string> = {
		home: "i-mdi-home-outline",
		workspace: "i-mdi-view-dashboard-outline",
		folder: "i-mdi-folder-outline",
		tasks: "i-mdi-format-list-checkbox",
		notes: "i-mdi-note-text-outline",
		reports: "i-mdi-file-chart-outline",
		calendar: "i-mdi-calendar-month-outline",
		files: "i-mdi-folder-outline",
		email: "i-mdi-email-outline",
		map: "i-mdi-map-outline",
		cog: "i-mdi-cog-outline",
		search: "i-mdi-magnify",
		bell: "i-mdi-bell-outline",
		user: "i-mdi-account-outline",
		lock: "i-mdi-lock-outline",
		bolt: "i-mdi-flash-outline",
		activity: "i-mdi-pulse",
		refresh: "i-mdi-refresh",
		brain: "i-mdi-brain",
		plus: "i-mdi-plus",
		menu: "i-mdi-menu",
		close: "i-mdi-close",
		chevron: "i-mdi-chevron-right",
	};

	// Load projects from IndexedDB on mount
	onMount(async () => {
		// Global error handler to capture runtime errors
		window.addEventListener('error', (event) => {
			console.error('Global error:', event.error);
			debugStore.log('Global Error', event.error?.message || String(event), { error: event.error });
		});
		window.addEventListener('unhandledrejection', (event) => {
			console.error('Unhandled rejection:', event.reason);
			debugStore.log('Unhandled Rejection', event.reason?.message || String(event.reason), { reason: event.reason });
		});

		// Initialize AppInit with Safe Mode protection
		try {
			console.log('Layout: Initializing application with Safe Mode protection...');
			const safeModeResult = await withSafeMode(async () => {
				await appInit.initialize();
			});
			
			if (safeModeResult.success) {
				appInitialized = true;
				console.log('Layout: Application initialized successfully (Safe Mode not activated)');
			} else {
				console.log('Layout: Safe Mode activated, application initialization failed');
				// Safe Mode fallback UI is already shown by withSafeMode
				loading = false;
				return;
			}
		} catch (error) {
			console.error('Layout: Failed to initialize application:', error);
			// Continue anyway - some features may be limited
			appInitialized = true; // Try to continue with limited functionality
		}
		
		// Initialize settings (loads API key, theme, etc.)
		try {
			await initSettings();
		} catch (error) {
			console.error('Layout: Failed to initialize settings:', error);
		}
		
		// Load recent items (mock for now)
		recentItems = [
			{ id: 'recent-1', label: 'Project Alpha', href: '/project/alpha', icon: 'project' },
			{ id: 'recent-2', label: 'Meeting Notes', href: '/note/meeting-123', icon: 'note' },
			{ id: 'recent-3', label: 'Q1 Report', href: '/report/q1-2026', icon: 'report' }
		];
		
		// Load projects (mock for now)
		projects = [];
		
		loading = false;
	});

	function isActive(href: string) {
		return $page.url.pathname.startsWith(href);
	}

	function closeSidebarOnMobile() {
		if (window.innerWidth < 1024) {
			sidebarOpen.set(false);
		}
	}

	// Handle prompt submissions from AskOscarBar
	function handlePromptSubmit(event: CustomEvent<{ text: string }>) {
		const promptText = event.detail.text;
		if (promptText && promptText.trim()) {
			debugStore.log('Layout', 'Processing prompt', { promptText });
			console.log('Layout: Processing prompt:', promptText);
			onUserPrompt(promptText.trim());
		} else {
			debugStore.log('Layout', 'Received empty prompt', { event });
			console.warn('Layout: Received empty prompt');
		}
	}
</script>

<!-- Module 1: Global System Rules Layout -->
<!-- Cockpit layout: sidebar, header, content, right panel, persistent bottom bar -->
<div class="h-screen flex bg-gray-50 overflow-hidden">
	<!-- Fixed left sidebar (Module 2: Navigation) -->
	<SidebarShell
		{navSections}
		{expandedItems}
		{icons}
		{isActive}
		{closeSidebarOnMobile}
		{toggleExpanded}
		{loading}
		{projects}
	/>
	
	<!-- Scrollable main content -->
	<div class="flex-1 flex flex-col overflow-hidden min-w-0">
		<!-- Main content area -->
		<div class="flex-1 overflow-auto p-4 lg:p-6">
			<slot />
		</div>
		
		<!-- Ask Oscar Bar fixed at the bottom (Module 1: Persistent bar) -->
		{#if appInitialized}
			<AskOscarBar on:promptSubmit={handlePromptSubmit} />
		{:else}
			<!-- Loading placeholder for AskOscarBar -->
			<div class="w-full h-16 bg-white border-t border-gray-200 flex items-center justify-center">
				<div class="text-gray-500 text-sm">Initializing assistant...</div>
			</div>
		{/if}
	</div>
	
	<!-- Right Panel (Module 1: Shows card backs, PDFs, documents, metadata) -->
	<RightPanel />
	
	<!-- Peek Panel (Module 1: Right-side temporary drawer for viewing item details) -->
	<PeekPanel />
	
	<!-- Sheet system above everything (Module 4: Sheet System) -->
	<SheetSystem />
	
	<!-- Debug Panel (visible only in dev) -->
	{#if $debugVisible}
		<div class="fixed bottom-0 left-0 w-96 max-h-64 bg-black/90 text-white text-xs font-mono z-[9999] overflow-auto border-t border-r border-gray-700 rounded-tr-lg shadow-lg">
			<div class="sticky top-0 bg-gray-900 px-3 py-2 flex items-center justify-between border-b border-gray-700">
				<div class="font-semibold">Debug Logs</div>
				<div class="flex gap-2">
					<button
						class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
						onclick={() => debugStore.clear()}
					>
						Clear
					</button>
					<button
						class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
						onclick={() => debugStore.toggleVisibility()}
					>
						{$debugVisible ? 'Hide' : 'Show'}
					</button>
				</div>
			</div>
			<div class="p-2 space-y-1">
				{#each $debugStore as log (log.id)}
					<div class="border-l-2 border-blue-500 pl-2 py-1">
						<div class="flex justify-between">
							<span class="text-blue-300 font-semibold">{log.component}</span>
							<span class="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
						</div>
						<div class="text-gray-200">{log.message}</div>
						{#if log.data}
							<pre class="text-gray-400 text-xs mt-1 overflow-x-auto">{JSON.stringify(log.data, null, 2)}</pre>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
