import type { APIKey, SyncStatus } from '$lib/vault/types';

// Format date
export function formatDate(timestamp?: number): string {
	if (!timestamp) return 'Never';
	return new Date(timestamp).toLocaleDateString();
}

// Get provider icon
export function getProviderIcon(provider: string): string {
	const icons: Record<string, string> = {
		openai: '🤖',
		anthropic: '🧠',
		google: '🔍',
		azure: '☁️',
		grok: '⚡',
		custom: '🔑'
	};
	return icons[provider] || '🔑';
}

// Get sync status color
export function getSyncStatusColor(status: string): string {
	switch (status) {
		case 'success': return 'bg-green-100 text-green-800';
		case 'error': return 'bg-red-100 text-red-800';
		case 'in-progress': return 'bg-blue-100 text-blue-800';
		case 'offline': return 'bg-yellow-100 text-yellow-800';
		default: return 'bg-gray-100 text-gray-800';
	}
}

// Create a sync status handler
export function createSyncStatusHandler(
	updateSyncStatus: (status: SyncStatus) => void,
	loadKeys: () => Promise<void>,
	loadStats: () => Promise<void>
) {
	return (status: SyncStatus) => {
		updateSyncStatus(status);
		if (status.status === 'success') {
			loadKeys();
			loadStats();
		}
	};
}