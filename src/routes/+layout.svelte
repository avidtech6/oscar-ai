<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/appStore';
	import { onMount } from 'svelte';
	import { initSettings } from '$lib/stores/settings';
	import { updateRoute } from '$lib/copilot/copilotContext';
	import { onUserPrompt } from '$lib/copilot/eventModel';
	import { onDestroy } from 'svelte';
	import { appInit } from '$lib/system/AppInit';
	import { debugStore } from '$lib/stores/debugStore';
	import { initializeSafeMode, withSafeMode } from '$lib/safeMode/integration';

	// Module-defined Oscar UI Components
	import SidebarShell from '$lib/ui/shells/SidebarShell.svelte';
	import RightPanelShell from '$lib/ui/shells/RightPanelShell.svelte';
	import SheetSystem from '$lib/ui/shells/SheetSystem.svelte';
	import AskOscarBar from '$lib/ui/shells/AskOscarBar.svelte';

	const debugVisible = debugStore.visible;
	
	// Sheet states
	let showConversationSheet = false;
	let showContextActionSheet = false;
	let contextActionSheetProps = {
		context: 'general',
		itemTitle: '',
		itemType: ''
	};

	let projects: any[] = [];
	let loading = true;
	let appInitialized = false;

	// Update copilot context when route changes
	$: updateRoute($page.url.pathname);


	// Navigation structure with sections (Module 2: Navigation Structure)
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
	          { id: 'workspace-home', label: 'Workspace Home', href: '/workspace' },
	          { id: 'tasks', label: 'Tasks', href: '/workspace?tab=tasks' },
	          { id: 'notes', label: 'Notes', href: '/workspace?tab=notes' },
	          { id: 'reports', label: 'Reports', href: '/workspace?tab=reports' },
	          { id: 'calendar', label: 'Calendar', href: '/workspace?tab=calendar' }
	        ]
	      },
	      { id: 'files', label: 'Files', icon: 'notes', href: '/files' },
	      { id: 'connect', label: 'Connect', icon: 'email', href: '/connect' },
	      { id: 'projects', label: 'Projects', icon: 'tasks', href: '/projects' },
	      { id: 'timeline', label: 'Timeline', icon: 'calendar', href: '/timeline' },
	      { id: 'dashboard', label: 'Dashboard', icon: 'cog', href: '/dashboard' },
	      { id: 'search', label: 'Search', icon: 'search', href: '/search' },
	      { id: 'map', label: 'Map', icon: 'map', href: '/map' }
	    ]
	  },
	  {
	    title: 'Integration & Systems',
	    items: [
	      { id: 'integrations', label: 'Integrations', icon: 'cog', href: '/integrations' },
	      { id: 'notifications', label: 'Notifications', icon: 'bell', href: '/notifications' },
	      { id: 'identity', label: 'Identity', icon: 'user', href: '/identity' },
	      { id: 'permissions', label: 'Permissions', icon: 'lock', href: '/permissions' },
	      { id: 'automations', label: 'Automations', icon: 'bolt', href: '/automations' },
	      { id: 'eventstream', label: 'Event Stream', icon: 'activity', href: '/eventstream' },
	      { id: 'sync', label: 'Sync Engine', icon: 'refresh', href: '/sync' },
	      { id: 'ai-context', label: 'AI Context', icon: 'brain', href: '/ai-context' }
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

		// Expose toggleExpanded to window for inline onclick handlers
		(window as any).toggleExpanded = (itemId: string) => {
			toggleExpanded(itemId);
		};

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
				// We should not continue with normal initialization
				loading = false;
				return;
			}
		} catch (error) {
			console.error('Layout: Failed to initialize application:', error);
			// Continue anyway - some features may be limited
		}
		
		// Initialize settings (loads API key, theme, etc.)
		try {
			console.log('Layout: Initializing settings...');
			await initSettings();
			console.log('Layout: Settings initialized successfully');
		} catch (error) {
			console.error('Layout: Failed to initialize settings:', error);
		}
		
		// Temporarily disabled db import
		try {
			// projects = await db.projects.toArray();
			projects = [];
		} catch (error) {
			console.error('Failed to load projects:', error);
		} finally {
			loading = false;
		}
	});

	function isActive(href: string) {
		return $page.url.pathname.startsWith(href);
	}

	const icons: Record<string, string> = {
		home: "i-mdi-home-outline",
		workspace: "i-mdi-view-dashboard-outline",
		tasks: "i-mdi-format-list-checkbox",
		notes: "i-mdi-note-text-outline",
		reports: "i-mdi-file-chart-outline",
		pdf: "i-mdi-file-pdf-box",
		calendar: "i-mdi-calendar-month-outline",
		notifications: "i-mdi-bell-outline",
		capture: "i-mdi-camera-outline",
		camera: "i-mdi-camera-outline",
		files: "i-mdi-folder-outline",
		voicenote: "i-mdi-microphone-outline",
		support: "i-mdi-lifebuoy",
		help: "i-mdi-help-circle-outline",
		chevron: "i-mdi-chevron-right",

		search: "i-mdi-magnify",
		bell: "i-mdi-bell-outline",
		user: "i-mdi-account-outline",
		lock: "i-mdi-lock-outline",
		bolt: "i-mdi-flash-outline",
		activity: "i-mdi-pulse",
		refresh: "i-mdi-refresh",
		brain: "i-mdi-brain",
		map: "i-mdi-map-outline",
		plus: "i-mdi-plus",
		menu: "i-mdi-menu",
		close: "i-mdi-close",
		
		// Navigation icons referenced in navSections
		folder: "i-mdi-folder-outline",
		email: "i-mdi-email-outline",
		cog: "i-mdi-cog-outline",
	};

	function toggleSidebar() {
		sidebarOpen.update(v => !v);
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
			// DEBUG: Log to window for visibility
			const win = window as any;
			win.debugLog = win.debugLog || [];
			win.debugLog.push({ type: 'prompt', text: promptText, timestamp: Date.now() });
			console.log('DEBUG: window.debugLog updated', win.debugLog);
			// TEMP: Alert for debugging
			if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
				alert(`DEBUG: Prompt submitted: "${promptText}"`);
			}
			onUserPrompt(promptText.trim());
		} else {
			debugStore.log('Layout', 'Received empty prompt', { event });
			console.warn('Layout: Received empty prompt');
		}
	}

	// Sidebar Components - Now implemented as proper Svelte components in src/lib/ui/shells/
	// The SidebarShell imports and uses SidebarSection, SidebarItem, and SidebarIcon components
</script>

<!-- Module-defined Oscar UI Layout -->
<div class="h-screen flex bg-gray-50 overflow-hidden">
	<!-- Fixed left sidebar -->
	<SidebarShell {navSections} {expandedItems} {icons} {isActive} {closeSidebarOnMobile} {toggleExpanded} {loading} {projects} />
	
	<!-- Scrollable main content -->
	<div class="flex-1 flex flex-col overflow-hidden min-w-0">
		<!-- Main content area -->
		<div class="flex-1 overflow-auto p-4 lg:p-6">
			<slot />
		</div>
		
		<!-- Ask Oscar Bar fixed at the bottom -->
		{#if appInitialized}
			<AskOscarBar on:promptSubmit={handlePromptSubmit} />
		{:else}
			<!-- Loading placeholder for AskOscarBar -->
			<div class="w-full h-16 bg-white border-t border-gray-200 flex items-center justify-center">
				<div class="text-gray-500 text-sm">Initializing assistant...</div>
			</div>
		{/if}
	</div>
	
	<!-- Fixed right-hand panel -->
	<RightPanelShell />
	
	<!-- Sheet system above everything -->
	<SheetSystem />
	
	<!-- Debug Panel (visible only in dev) -->
	{#if $debugVisible}
		<div class="fixed bottom-0 left-0 w-96 max-h-64 bg-black/90 text-white text-xs font-mono z-[9999] overflow-auto border-t border-r border-gray-700 rounded-tr-lg shadow-lg">
			<div class="sticky top-0 bg-gray-900 px-3 py-2 flex items-center justify-between border-b border-gray-700">
				<div class="font-semibold">Debug Logs</div>
				<div class="flex gap-2">
					<button
						class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
						on:click={() => debugStore.clear()}
					>
						Clear
					</button>
					<button
						class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
						on:click={() => debugStore.toggleVisibility()}
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
