<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/appStore';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	// import { db } from '$lib/db';
	import { initSettings } from '$lib/stores/settings';
	import CopilotBar from '$lib/copilot/CopilotBar.svelte';
	import PromptTooltip from '$lib/copilot/PromptTooltip.svelte';
	import MobileBottomBar from '$lib/components/MobileBottomBar.svelte';
	import { updateRoute } from '$lib/copilot/copilotContext';
	import { onUserPrompt } from '$lib/copilot/eventModel';
	// import type { Project } from '$lib/db';
	import { onDestroy } from 'svelte';
	import { appInit } from '$lib/system/AppInit';
	import SemanticContextSheet from '$lib/components/semantic/SemanticContextSheet.svelte';
	import DecisionSheet from '$lib/components/semantic/DecisionSheet.svelte';
	import { debugStore } from '$lib/stores/debugStore';
	import { initializeSafeMode, withSafeMode } from '$lib/safeMode/integration';
	import RightPanel from '$lib/components/layout/RightPanel.svelte';
	import ConversationSheet from '$lib/components/sheets/ConversationSheet.svelte';
	import ContextActionSheet from '$lib/components/sheets/ContextActionSheet.svelte';
	import ContextPills from '$lib/components/layout/ContextPills.svelte';

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

	// Handle prompt submissions from CopilotBar
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

	// Sidebar Components - Proper Svelte components defined as functions returning JSX-like objects
	// These will be used with {@html} directive in the template
	const SidebarIcon = (icon: string, icons: Record<string, string>) => {
		return `<span class="flex-shrink-0 w-5 h-5">${icons[icon] || ''}</span>`;
	};

	const SidebarSection = (title: string, sectionIndex: number, sidebarOpen: boolean, children: string) => {
		if (!sidebarOpen && title) return '';
		
		return `
			${title ? `
				<div class="pt-4 ${sectionIndex > 0 ? 'mt-4 border-t border-forest-700' : ''}">
					<div class="px-3 mb-2">
						<span class="text-xs font-semibold text-forest-300 uppercase tracking-wider">${title}</span>
					</div>
				</div>
			` : ''}
			${children}
		`;
	};

	const SidebarItem = (
		item: any,
		sidebarOpen: boolean,
		expandedItems: Set<string>,
		icons: Record<string, string>,
		isActive: (href: string) => boolean,
		closeSidebarOnMobile: () => void,
		toggleExpanded: (id: string) => void
	) => {
		const active = isActive(item.href);
		const expanded = expandedItems.has(item.id);
		const toggleFunction = `(function(e) { e.preventDefault(); window.toggleExpanded && window.toggleExpanded('${item.id}'); })`;
		
		return `
			<div class="space-y-1">
				<a
					href="${item.href}"
					onclick="(${closeSidebarOnMobile.toString()})()"
					class="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors
						   ${active ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}
						   ${sidebarOpen ? 'lg:justify-start' : 'lg:justify-center'}"
					title="${sidebarOpen ? '' : item.label}"
				>
					<span class="flex-shrink-0 w-5 h-5">
						${icons[item.icon] || ''}
					</span>
					${sidebarOpen ? `
						<span class="transition-opacity duration-200 flex-1">${item.label}</span>
						${item.subitems ? `
							<button
								onclick="${toggleFunction}"
								class="p-1 text-forest-200 hover:text-white"
								aria-label="${expanded ? 'Collapse' : 'Expand'}"
							>
								<svg class="w-4 h-4 transform transition-transform ${expanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
						` : ''}
					` : ''}
				</a>
				
				${sidebarOpen && item.subitems && expanded ? `
					<div class="ml-8 space-y-1">
						${item.subitems.map((subitem: any) => `
							<a
								href="${subitem.href}"
								onclick="(${closeSidebarOnMobile.toString()})()"
								class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm
									   ${isActive(subitem.href) ? 'bg-forest-700/50 text-white' : 'text-forest-200 hover:bg-forest-700/30'}"
								title="${subitem.label}"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-forest-400"></span>
								<span>${subitem.label}</span>
							</a>
						`).join('')}
					</div>
				` : ''}
			</div>
		`;
	};
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

<div class="h-screen flex bg-gray-50 overflow-hidden">
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
				{@html SidebarSection(section.title, sectionIndex, $sidebarOpen,
					section.items.map(item => SidebarItem(
						item,
						$sidebarOpen,
						expandedItems,
						icons,
						isActive,
						closeSidebarOnMobile,
						toggleExpanded
					)).join('')
				)}
			{/each}

			<!-- Projects Section -->
			{@html SidebarSection("Projects", navSections.length, $sidebarOpen,
				$sidebarOpen ? `
					<div class="flex items-center justify-between px-3 mb-2">
						<a
							href="/workspace/new"
							onclick="${closeSidebarOnMobile}"
							class="p-1 text-forest-200 hover:text-white hover:bg-forest-700 rounded transition-colors"
							title="New Project"
						>
							${SidebarIcon("plus", icons)}
						</a>
					</div>
					
					${loading ? `
						<div class="px-3 py-2 text-sm text-forest-200">Loading...</div>
					` : projects.length === 0 ? `
						<div class="px-3 py-2 text-sm text-forest-200">No projects yet</div>
					` : projects.map(project => `
						<a
							href="/project/${project.id}"
							onclick="${closeSidebarOnMobile}"
							class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
								   ${isActive('/project/' + project.id) ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}"
							title="${project.name}"
						>
							${SidebarIcon("folder", icons)}
							<span class="truncate text-sm">${project.name}</span>
						</a>
					`).join('')}
				` : `
					<!-- Collapsed Projects button -->
					<a
						href="/workspace"
						onclick="${closeSidebarOnMobile}"
						class="flex items-center justify-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors
							   ${isActive('/workspace') ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}"
						title="Projects"
					>
						${SidebarIcon("folder", icons)}
					</a>
				`
			)}
		</nav>
	</aside>

	<!-- Main content -->
	<main class="flex-1 flex flex-col overflow-hidden min-w-0">
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

		<!-- Page content -->
		<div class="flex-1 overflow-auto p-4 lg:p-6">
			<slot />
		</div>
		
		<!-- Global Copilot System - Now inside main content -->
		{#if appInitialized}
			<!-- Prompt Tooltip System (appears above CopilotBar) -->
			<PromptTooltip />
			<CopilotBar on:promptSubmit={handlePromptSubmit} />
		{:else}
			<!-- Loading placeholder for CopilotBar -->
			<div class="w-full h-16 bg-white border-t border-gray-200 flex items-center justify-center">
				<div class="text-gray-500 text-sm">Initializing assistant...</div>
			</div>
		{/if}
	</main>
	
	<!-- Global Right Panel (Module 1 requirement) -->
	<RightPanel />
	
	<!-- Mobile Bottom Bar -->
	<MobileBottomBar />
	
	<!-- Semantic Context Sheet (global) -->
	<SemanticContextSheet />
	
	<!-- Decision Sheet (global) -->
	<DecisionSheet />
	
	<!-- Module 4 Sheet System -->
	<ConversationSheet bind:isOpen={showConversationSheet} />
	<ContextActionSheet
		bind:isOpen={showContextActionSheet}
		context={contextActionSheetProps.context}
		itemTitle={contextActionSheetProps.itemTitle}
		itemType={contextActionSheetProps.itemType}
	/>

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
