<script lang="ts">
	import { page } from '$app/stores';
	import { intelligenceLayer } from '$lib/intelligence';

	export let collapsed = false;
	
	const navItems = [
		{ label: 'Dashboard', href: '/dashboard', icon: '📊' },
		{ label: 'Reports', href: '/reports', icon: '📋' },
		{ label: 'Notes', href: '/notes', icon: '📝' },
		{ label: 'Tasks', href: '/tasks', icon: '✅' },
		{ label: 'Projects', href: '/projects', icon: '📁' },
		{ label: 'Calendar', href: '/calendar', icon: '📅' },
		{ label: 'Email', href: '/email', icon: '📧' },
		{ label: 'Settings', href: '/settings', icon: '⚙️' }
	];
	
	const intelligenceItems = [
		{ label: 'Report Intelligence', href: '/intelligence/reports', icon: '🧠' },
		{ label: 'Schema Mapper', href: '/intelligence/schema', icon: '🗺️' },
		{ label: 'Style Learner', href: '/intelligence/style', icon: '🎨' },
		{ label: 'Compliance', href: '/intelligence/compliance', icon: '📋' }
	];
</script>

<aside class="sidebar" class:collapsed>
	<div class="sidebar-header">
		{#if !collapsed}
			<h2>Oscar AI</h2>
			<p class="subtitle">Arboricultural Assistant</p>
		{:else}
			<h2>OA</h2>
		{/if}
	</div>
	
	<nav class="sidebar-nav">
		<div class="nav-section">
			<h3 class:collapsed>Navigation</h3>
			<ul>
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<div class="nav-section">
			<h3 class:collapsed>Intelligence</h3>
			<ul>
				{#each intelligenceItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<div class="nav-section">
			<h3 class:collapsed>Phase Files</h3>
			<div class="phase-info">
				{#if !collapsed}
					<p>Version: {intelligenceLayer.version}</p>
					<p>{intelligenceLayer.phaseFiles.length} phase files loaded</p>
				{:else}
					<p>PF</p>
				{/if}
			</div>
		</div>
	</nav>
	
	<div class="sidebar-footer">
		<button on:click={() => collapsed = !collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
			{#if collapsed}
				→
			{:else}
				←
			{/if}
		</button>
	</div>
</aside>

<style>
	.sidebar {
		background: linear-gradient(180deg, #1a1f2e 0%, #0f1524 100%);
		color: white;
		height: 100vh;
		width: 280px;
		display: flex;
		flex-direction: column;
		transition: width 0.3s ease;
		position: sticky;
		top: 0;
		overflow-y: auto;
	}
	
	.sidebar.collapsed {
		width: 80px;
	}
	
	.sidebar-header {
		padding: 2rem 1.5rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.sidebar-header h2 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.25rem;
		font-family: 'Merriweather', serif;
	}
	
	.subtitle {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}
	
	.sidebar-nav {
		flex: 1;
		padding: 1.5rem 0;
	}
	
	.nav-section {
		margin-bottom: 2rem;
	}
	
	.nav-section h3 {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.5);
		margin: 0 1.5rem 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.nav-section h3.collapsed {
		text-align: center;
		font-size: 0.6rem;
	}
	
	.nav-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.nav-section li {
		margin: 0.25rem 0;
	}
	
	.nav-section a {
		display: flex;
		align-items: center;
		padding: 0.75rem 1.5rem;
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		transition: all 0.2s ease;
		border-left: 3px solid transparent;
	}
	
	.nav-section a:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}
	
	.nav-section a.active {
		background: rgba(59, 130, 246, 0.1);
		color: white;
		border-left-color: #3b82f6;
	}
	
	.icon {
		font-size: 1.25rem;
		margin-right: 1rem;
		width: 24px;
		text-align: center;
	}
	
	.collapsed .icon {
		margin-right: 0;
	}
	
	.label {
		font-size: 0.9375rem;
		font-weight: 500;
	}
	
	.phase-info {
		padding: 0 1.5rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
	}
	
	.phase-info p {
		margin: 0.25rem 0;
	}
	
	.sidebar-footer {
		padding: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
	}
	
	.sidebar-footer button {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: none;
		border-radius: 4px;
		width: 40px;
		height: 40px;
		cursor: pointer;
		font-size: 1.25rem;
		transition: background 0.2s ease;
	}
	
	.sidebar-footer button:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>