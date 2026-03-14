<script lang="ts">
	export let notifications: Array<{
		id: number;
		text: string;
		time: string;
		unread: boolean;
	}> = [];
	export let markAllAsRead: () => void = () => {};
	export let onClose: () => void = () => {};
</script>

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
				<div class="notification-item {notification.unread ? 'unread' : ''}">
					<div class="notification-text">{notification.text}</div>
					<div class="notification-time">{notification.time}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
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
</style>