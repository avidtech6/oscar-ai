<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { sidebarOpen } from '$lib/stores/appStore';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { db } from '$lib/db';
	import { initSettings } from '$lib/stores/settings';
	import CopilotBar from '$lib/copilot/CopilotBar.svelte';
	import MobileBottomBar from '$lib/components/MobileBottomBar.svelte';
	import { updateRoute } from '$lib/copilot/copilotContext';
	import { onUserPrompt } from '$lib/copilot/eventModel';
	import type { Project } from '$lib/db';
	import { onDestroy } from 'svelte';
	import { appInit } from '$lib/system/AppInit';

	let projects: Project[] = [];
	let loading = true;
	let appInitialized = false;

	// Update copilot context when route changes
	$: updateRoute($page.url.pathname);


	// Navigation structure with sections
	const navSections = [
		{
			title: 'Workspace',
			items: [
				{ id: 'oscar', label: 'Oscar AI (Chat Assistant)', icon: 'chat', href: '/oscar' },
				{ id: 'home', label: 'Home', icon: 'home', href: '/' },
				{ id: 'projects', label: 'Projects', icon: 'folder', href: '/workspace' },
				{ id: 'tasks', label: 'Tasks', icon: 'tasks', href: '/tasks' },
				{ id: 'notes', label: 'Notes', icon: 'notes', href: '/notes' },
				{ id: 'reports', label: 'Reports', icon: 'document', href: '/reports' }
			]
		},
		{
			title: 'Communication Hub',
			items: [
				{ id: 'communication', label: 'Communication Hub', icon: 'message', href: '/communication' }
			]
		},
		{
			title: 'Support',
			items: [
				{ id: 'help', label: 'Help', icon: 'help', href: '/help' }
			]
		}
	];

	// Load projects from IndexedDB on mount
	onMount(async () => {
		// Initialize AppInit (must happen first)
		try {
			console.log('Layout: Initializing application...');
			await appInit.initialize();
			appInitialized = true;
			console.log('Layout: Application initialized successfully');
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
		
		try {
			projects = await db.projects.toArray();
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
		home: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
		cog: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
		folder: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>`,
		tasks: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`,
		notes: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
		email: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`,
		calendar: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
		chat: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>`,
		document: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
		blog: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
		learn: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`,
		help: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
		plus: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`,
		menu: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`,
		close: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
		chevron: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>`
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
			console.log('Layout: Processing prompt:', promptText);
			onUserPrompt(promptText.trim());
		} else {
			console.warn('Layout: Received empty prompt');
		}
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
				{#if $sidebarOpen && section.title}
					<div class="pt-4 {sectionIndex > 0 ? 'mt-4 border-t border-forest-700' : ''}">
						<div class="px-3 mb-2">
							<span class="text-xs font-semibold text-forest-300 uppercase tracking-wider">{section.title}</span>
						</div>
					</div>
				{/if}
				
				{#each section.items as item}
					<a
						href={item.href}
						on:click={closeSidebarOnMobile}
						class="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors
							   {isActive(item.href) ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}
							   {$sidebarOpen ? 'lg:justify-start' : 'lg:justify-center'}"
						title={$sidebarOpen ? '' : item.label}
					>
						<span class="flex-shrink-0 w-5 h-5">
							{@html icons[item.icon]}
						</span>
						{#if $sidebarOpen}
							<span class="transition-opacity duration-200" transition:fly={{ x: -10, duration: 200 }}>{item.label}</span>
						{/if}
					</a>
				{/each}
			{/each}

			<!-- Projects Section -->
			{#if $sidebarOpen}
				<div class="pt-4 mt-4 border-t border-forest-700">
					<div class="flex items-center justify-between px-3 mb-2">
						<span class="text-xs font-semibold text-forest-300 uppercase tracking-wider">Projects</span>
						<a
							href="/workspace/new"
							on:click={closeSidebarOnMobile}
							class="p-1 text-forest-200 hover:text-white hover:bg-forest-700 rounded transition-colors"
							title="New Project"
						>
							{@html icons.plus}
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
								<span class="flex-shrink-0 w-5 h-5">
									{@html icons.folder}
								</span>
								<span class="truncate text-sm">{project.name}</span>
							</a>
						{/each}
					{/if}
				</div>
			{:else}
				<!-- Collapsed Projects button -->
				<a
					href="/workspace"
					on:click={closeSidebarOnMobile}
					class="flex items-center justify-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors
						   {isActive('/workspace') ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/50'}"
					title="Projects"
				>
					<span class="flex-shrink-0 w-5 h-5">
						{@html icons.folder}
					</span>
				</a>
			{/if}
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
		<div class="flex-1 overflow-auto">
			<slot />
		</div>
		
		<!-- Global Copilot System - Now inside main content -->
		{#if appInitialized}
			<CopilotBar on:promptSubmit={handlePromptSubmit} />
		{:else}
			<!-- Loading placeholder for CopilotBar -->
			<div class="w-full h-16 bg-white border-t border-gray-200 flex items-center justify-center">
				<div class="text-gray-500 text-sm">Initializing assistant...</div>
			</div>
		{/if}
	</main>
	
	<!-- Mobile Bottom Bar -->
	<MobileBottomBar />
</div>
