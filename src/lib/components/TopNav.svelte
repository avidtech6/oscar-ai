<script lang="ts">
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import SyncStatus from './SyncStatus.svelte';
	import TopNavBreadcrumb from './topnav/TopNavBreadcrumb.svelte';
	import TopNavSearch from './topnav/TopNavSearch.svelte';
	import TopNavNotifications from './topnav/TopNavNotifications.svelte';
	import TopNavUserMenu from './topnav/TopNavUserMenu.svelte';

	export let user = {
		name: 'Oscar AI Intelligence Analyst',
		avatar: '🧠',
		role: 'Phase Intelligence Specialist',
		email: 'analyst@oscar-ai.com',
		status: 'active'
	};

	let searchQuery = '';
	let notifications = [
		{ id: 1, text: 'New intelligence report available', time: '2 hours ago', unread: true },
		{ id: 2, text: 'Schema update completed', time: '1 day ago', unread: true },
		{ id: 3, text: 'Weekly summary ready', time: '3 days ago', unread: false }
	];

	let showNotifications = false;
	let showUserMenu = false;

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			// Trigger unified search
			console.log('Searching for:', searchQuery);
		}
	}

	function markAllAsRead() {
		notifications = notifications.map(n => ({ ...n, unread: false }));
	}

	function toggleNotifications() {
		showNotifications = !showNotifications;
		if (showNotifications) showUserMenu = false;
	}

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
		if (showUserMenu) showNotifications = false;
	}

	function closeAllDropdowns() {
		showNotifications = false;
		showUserMenu = false;
	}
</script>

<header class="top-nav">
	<div class="nav-left">
		<TopNavBreadcrumb />
	</div>
	
	<div class="nav-center">
		<TopNavSearch {searchQuery} onSearch={handleSearch} />
	</div>
	
	<div class="nav-right">
		<div class="nav-actions">
			<!-- Sync Status Component -->
			<div class="sync-status-wrapper">
				<SyncStatus />
			</div>
			
			<button class="nav-button" on:click={toggleNotifications} aria-label="Notifications">
				🔔
				{#if notifications.some(n => n.unread)}
					<span class="badge">{notifications.filter(n => n.unread).length}</span>
				{/if}
			</button>
			
			<button class="nav-button" aria-label="Help" title="Ask Oscar for assistance">
				❓
			</button>
			
			<button class="nav-button" on:click={toggleUserMenu} aria-label="User menu">
				<span class="user-avatar">{user.avatar}</span>
				<span class="user-name">{user.name}</span>
			</button>
		</div>
		
		{#if showNotifications}
			<TopNavNotifications
				{notifications}
				markAllAsRead={markAllAsRead}
				onClose={closeAllDropdowns}
			/>
		{/if}
		
		{#if showUserMenu}
			<TopNavUserMenu
				{user}
				onClose={closeAllDropdowns}
			/>
		{/if}
	</div>
</header>

{#if showNotifications || showUserMenu}
	<div
		class="dropdown-backdrop"
		role="button"
		tabindex="0"
		on:click={closeAllDropdowns}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				closeAllDropdowns();
			}
		}}
	></div>
{/if}

<style>
	.top-nav {
		background: var(--background);
		border-bottom: 1px solid var(--border);
		padding: 0.75rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: sticky;
		top: 0;
		z-index: 50;
		height: 64px;
		box-sizing: border-box;
	}

	.top-nav::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899);
		opacity: 0.2;
	}
	
	.nav-left, .nav-center, .nav-right {
		flex: 1;
		display: flex;
		align-items: center;
	}
	
	.nav-center {
		justify-content: center;
	}
	
	.nav-right {
		justify-content: flex-end;
		position: relative;
	}
	
	.nav-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
	
	.sync-status-wrapper {
		display: flex;
		align-items: center;
	}
	
	.nav-button {
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
		position: relative;
		color: var(--text);
	}
	
	.nav-button:hover {
		background: var(--background-hover);
		border-color: var(--primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
	}
	
	.nav-button.active {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
	}
	
	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #4F46E5, #7C3AED);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		font-weight: 600;
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
	}
	
	.user-name {
		margin-left: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text);
		background: linear-gradient(135deg, #4F46E5, #7C3AED);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	
	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #ef4444;
		color: white;
		font-size: 0.625rem;
		font-weight: 600;
		border-radius: 9999px;
		min-width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
	}
	
	.dropdown-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
	 bottom: 0;
		z-index: 40;
	}
	
	@media (max-width: 768px) {
		.top-nav {
			padding: 0.5rem 1rem;
			height: 56px;
		}
		
		.nav-actions {
			gap: 0.5rem;
		}
		
		.nav-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.75rem;
			min-height: 40px;
		}
		
		.user-name {
			display: none;
		}
		
		.sync-status-wrapper {
			order: 1;
		}
		
		/* Hide less critical buttons on mobile */
		button[aria-label="Help"] {
			display: none;
		}
	}
	
	@media (max-width: 480px) {
		.top-nav {
			padding: 0.5rem;
		}
		
		.nav-actions {
			gap: 0.25rem;
		}
		
		.nav-button {
			padding: 0.5rem;
			font-size: 0.625rem;
		}
		
		.user-avatar {
			width: 24px;
			height: 24px;
			font-size: 0.875rem;
		}
	}
</style>