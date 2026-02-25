<script lang="ts">
	import { goto } from '$app/navigation';
	
	// Static placeholder data
	const notificationStats = {
		unread: 5,
		total: 23,
		important: 2
	};
	
	// Sample notifications
	const recentNotifications = [
		{ id: 1, text: 'New email from client', time: '10 min ago', read: false },
		{ id: 2, text: 'Campaign scheduled', time: '1 hour ago', read: true },
		{ id: 3, text: 'Calendar event reminder', time: '2 hours ago', read: true }
	];
	
	function navigateToNotifications() {
		goto('/communication/notifications');
	}
	
	function markAsRead(id: number) {
		// Placeholder for marking as read
		console.log('Mark notification as read:', id);
	}
</script>

<div 
	class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
	on:click={navigateToNotifications}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && navigateToNotifications()}
>
	<div class="flex items-start justify-between mb-3">
		<div>
			<h3 class="font-semibold text-gray-800">Notifications</h3>
			<p class="text-sm text-gray-500">Stay updated</p>
		</div>
		<div class="text-yellow-600">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
			</svg>
		</div>
	</div>
	
	<div class="grid grid-cols-3 gap-2 mt-4">
		<div class="text-center p-2 bg-yellow-50 rounded relative">
			{#if notificationStats.unread > 0}
				<div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
					{notificationStats.unread}
				</div>
			{/if}
			<div class="text-lg font-bold text-yellow-700">{notificationStats.unread}</div>
			<div class="text-xs text-yellow-600">Unread</div>
		</div>
		<div class="text-center p-2 bg-blue-50 rounded">
			<div class="text-lg font-bold text-blue-700">{notificationStats.total}</div>
			<div class="text-xs text-blue-600">Total</div>
		</div>
		<div class="text-center p-2 bg-red-50 rounded">
			<div class="text-lg font-bold text-red-700">{notificationStats.important}</div>
			<div class="text-xs text-red-600">Important</div>
		</div>
	</div>
	
	<!-- Recent Notifications List -->
	<div class="mt-4">
		<h4 class="text-sm font-medium text-gray-700 mb-2">Recent Notifications</h4>
		<div class="space-y-2">
			{#each recentNotifications as notification}
				<div 
					class="flex items-center justify-between p-2 {notification.read ? 'bg-gray-50' : 'bg-blue-50'} rounded"
					on:click|stopPropagation={() => markAsRead(notification.id)}
				>
					<div class="flex items-center gap-2">
						{#if !notification.read}
							<div class="w-2 h-2 rounded-full bg-blue-500"></div>
						{/if}
						<span class="text-sm {notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}">{notification.text}</span>
					</div>
					<span class="text-xs text-gray-500">{notification.time}</span>
				</div>
			{/each}
		</div>
	</div>
	
	<div class="mt-4 pt-3 border-t border-gray-100">
		<p class="text-sm text-gray-600">Click to view all notifications</p>
	</div>
</div>

<style>
	.card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background-color: white;
	}
</style>