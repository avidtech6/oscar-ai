<script lang="ts">
	import { onMount } from 'svelte';
	import { notificationsStore, markAsRead, clearAll } from '$lib/stores/notifications';

	let filter: 'all' | 'unread' = 'all';

	function getFilteredNotifications() {
		const all = $notificationsStore;
		if (filter === 'unread') {
			return all.filter(n => !n.read);
		}
		return all;
	}

	function markAllAsRead() {
		$notificationsStore.forEach(n => {
			if (!n.read) markAsRead(n.id);
		});
	}
</script>

<div class="flex flex-col min-h-[60vh] p-4">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

	<!-- Controls -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex gap-2">
			<button
				class="px-4 py-2 rounded-lg {filter === 'all' ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-700'}"
				on:click={() => filter = 'all'}
			>
				All
			</button>
			<button
				class="px-4 py-2 rounded-lg {filter === 'unread' ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-700'}"
				on:click={() => filter = 'unread'}
			>
				Unread
			</button>
		</div>
		<div class="flex gap-2">
			<button
				on:click={markAllAsRead}
				class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
				disabled={$notificationsStore.filter(n => !n.read).length === 0}
			>
				Mark all as read
			</button>
			<button
				on:click={clearAll}
				class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
			>
				Clear all
			</button>
		</div>
	</div>

	<!-- Notifications list -->
	<div class="space-y-4">
		{#if getFilteredNotifications().length === 0}
			<div class="text-center py-12 text-gray-500">
				<svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				<p class="text-lg">No notifications</p>
				<p class="text-sm">You're all caught up!</p>
			</div>
		{:else}
			{#each getFilteredNotifications() as notification (notification.id)}
				<div class="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4 {notification.read ? 'opacity-75' : ''}">
					<div class="flex-shrink-0 w-10 h-10 rounded-full {notification.type === 'info' ? 'bg-blue-100' : notification.type === 'success' ? 'bg-green-100' : notification.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100'} flex items-center justify-center">
						{#if notification.type === 'info'}
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{:else if notification.type === 'success'}
							<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						{:else if notification.type === 'warning'}
							<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						{:else}
							<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
					</div>
					<div class="flex-1">
						<div class="flex justify-between items-start">
							<h3 class="font-medium text-gray-900">{notification.title}</h3>
							<div class="flex items-center gap-2">
								<span class="text-xs text-gray-500">{notification.timeAgo}</span>
								{#if !notification.read}
									<span class="w-2 h-2 bg-red-500 rounded-full"></span>
								{/if}
							</div>
						</div>
						<p class="text-gray-600 text-sm mt-1">{notification.message}</p>
						{#if notification.action}
							<div class="mt-3">
								<button
									on:click={() => notification.action?.callback()}
									class="text-sm text-forest-600 hover:text-forest-800 font-medium"
								>
									{notification.action.label}
								</button>
							</div>
						{/if}
					</div>
					<button
						on:click={() => markAsRead(notification.id)}
						class="text-gray-400 hover:text-gray-600 p-1"
						title="Mark as read"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					</button>
				</div>
			{/each}
		{/if}
	</div>
</div>