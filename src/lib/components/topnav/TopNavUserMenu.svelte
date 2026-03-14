<script lang="ts">
	export let user: {
		name: string;
		avatar: string;
		role: string;
	} = { name: '', avatar: '', role: '' };
	export let onClose: () => void = () => {};
</script>

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

	.user-dropdown {
		right: 0;
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

	.dropdown-content {
		max-height: 400px;
		overflow-y: auto;
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

	hr {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 0.5rem 0;
	}
</style>