<script lang="ts">
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import SyncStatus from './SyncStatus.svelte';
	
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
</script>

<header class="top-nav">
	<div class="nav-left">
		<div class="breadcrumb">
			{#if $page.url.pathname === '/dashboard'}
				<span class="current">Dashboard</span>
			{:else if $page.url.pathname.startsWith('/reports')}
				<a href="/dashboard">Dashboard</a> / <span class="current">Reports</span>
			{:else if $page.url.pathname.startsWith('/notes')}
				<a href="/dashboard">Dashboard</a> / <span class="current">Notes</span>
			{:else}
				<a href="/dashboard">Dashboard</a> / <span class="current">{$page.url.pathname.split('/')[1] || 'Page'}</span>
			{/if}
		</div>
	</div>
	
	<div class="nav-center">
		<form on:submit={handleSearch} class="search-form">
			<input
				type="search"
				placeholder="Search reports, notes, or intelligence..."
				bind:value={searchQuery}
				aria-label="Search"
			/>
			<button type="submit" aria-label="Search">
				🔍
			</button>
		</form>
	</div>
	
	<div class="nav-right">
		<div class="nav-actions">
			<!-- Sync Status Component -->
			<div class="sync-status-wrapper">
				<SyncStatus />
			</div>
			
			<button class="nav-button" on:click={() => showNotifications = !showNotifications} aria-label="Notifications">
				🔔
				{#if notifications.some(n => n.unread)}
					<span class="badge">{notifications.filter(n => n.unread).length}</span>
				{/if}
			</button>
			
			<button class="nav-button" aria-label="Help">
				❓
			</button>
			
			<button class="nav-button" on:click={() => showUserMenu = !showUserMenu} aria-label="User menu">
				<span class="user-avatar">{user.avatar}</span>
				<span class="user-name">{user.name}</span>
			</button>
		</div>
		
		{#if showNotifications}
			<div class="dropdown notifications-dropdown">
				<div class="dropdown-header">
					<h3>Notifications</h3>
					<button on:click={markAllAsRead} class="mark-read">Mark all as read</button>
				</div>
				<div class="dropdown-content">
					{#if notifications.length === 0}
						<p class="empty">No notifications</p>
					{:else}
						{#each notifications as notification}
							<div class="notification-item" class:unread={notification.unread}>
								<div class="notification-text">{notification.text}</div>
								<div class="notification-time">{notification.time}</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
		
		{#if showUserMenu}
			<div class="dropdown user-dropdown">
				<div class="user-info">
					<div class="user-avatar-large">{user.avatar}</div>
					<div>
						<div class="user-name-large">{user.name}</div>
						<div class="user-role">{user.role}</div>
					</div>
				</div>
				<div class="dropdown-content">
					<a href="/profile" class="dropdown-item">👤 Profile</a>
					<a href="/settings" class="dropdown-item">⚙️ Settings</a>
					<a href="/help" class="dropdown-item">📚 Help & Documentation</a>
					<hr />
					<a href="/logout" class="dropdown-item logout">🚪 Sign out</a>
				</div>
			</div>
		{/if}
	</div>
</header>

{#if showNotifications || showUserMenu}
	<div class="dropdown-backdrop" on:click={() => {
		showNotifications = false;
		showUserMenu = false;
	}} />
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
	
	.breadcrumb {
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.breadcrumb a {
		color: #3b82f6;
		text-decoration: none;
	}
	
	.breadcrumb a:hover {
		text-decoration: underline;
	}
	
	.breadcrumb .current {
		color: #111827;
		font-weight: 500;
	}
	
	.search-form {
		position: relative;
		width: 100%;
		max-width: 400px;
	}
	
	.search-form input {
		width: 100%;
		padding: 0.5rem 1rem 0.5rem 2.5rem;
		border: 1px solid #d1d5db;
		border-radius: 9999px;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.2s ease;
	}
	
	.search-form input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.search-form button {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		font-size: 1rem;
		color: #6b7280;
		cursor: pointer;
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
	
	.dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		min-width: 320px;
		z-index: 100;
		overflow: hidden;
	}
	
	.notifications-dropdown {
		right: 100px;
	}
	
	.user-dropdown {
		right: 0;
	}
	
	.dropdown-header {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.dropdown-header h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: #111827;
	}
	
	.mark-read {
		font-size: 0.75rem;
		color: #3b82f6;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}
	
	.dropdown-content {
		max-height: 400px;
		overflow-y: auto;
	}
	
	.notification-item {
		padding: 1rem;
		border-bottom: 1px solid #f3f4f6;
	}
	
	.notification-item.unread {
		background: #f0f9ff;
	}
	
	.notification-item:last-child {
		border-bottom: none;
	}
	
	.notification-text {
		font-size: 0.875rem;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	
	.notification-time {
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.empty {
		padding: 2rem 1rem;
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}
	
	.user-info {
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.user-avatar-large {
		font-size: 2rem;
	}
	
	.user-name-large {
		font-weight: 600;
		color: #111827;
	}
	
	.user-role {
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: #374151;
		text-decoration: none;
		font-size: 0.875rem;
		transition: background 0.2s ease;
	}
	
	.dropdown-item:hover {
		background: #f9fafb;
	}
	
	.dropdown-item.logout {
		color: #ef4444;
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