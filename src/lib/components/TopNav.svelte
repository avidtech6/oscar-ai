<script lang="ts">
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import SyncStatus from './SyncStatus.svelte';
	import TopNavBreadcrumb from './topnav/TopNavBreadcrumb.svelte';
	import TopNavSearch from './topnav/TopNavSearch.svelte';
	import TopNavNotifications from './topnav/TopNavNotifications.svelte';
	import TopNavUserMenu from './topnav/TopNavUserMenu.svelte';

	export let user = {
		name: 'Arborist User',
		avatar: '🌳',
		role: 'Tree Surveyor'
	};

	let searchQuery = '';
	let notifications = [
		{ id: 1, text: 'New report template available', time: '2 hours ago', unread: true },
		{ id: 2, text: 'Schema update completed', time: '1 day ago', unread: true },
		{ id: 3, text: 'Weekly summary ready', time: '3 days ago', unread: false }
	];

	let showNotifications = false;
	let showUserMenu = false;

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			// In a real app, this would trigger search
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
			
			<button class="nav-button" aria-label="Help">
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
		background: white;
		border-bottom: 1px solid #e5e7eb;
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
		gap: 0.5rem;
		align-items: center;
	}
	
	.sync-status-wrapper {
		display: flex;
		align-items: center;
	}
	
	.nav-button {
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.2s ease;
		position: relative;
	}
	
	.nav-button:hover {
		background: #f9fafb;
	}
	
	.user-avatar {
		font-size: 1.25rem;
	}
	
	.user-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
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
</style>