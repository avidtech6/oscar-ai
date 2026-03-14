import type { SyncStatus } from '$lib/storage/syncEngineTypes';

// Format time
export function formatTime(timestamp: number | null): string {
	if (!timestamp) return 'Never';
	
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	
	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins}m ago`;
	
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) return `${diffDays}d ago`;
	
	return date.toLocaleDateString();
}

// Format latency
export function formatLatency(latency: number | null): string {
	if (!latency) return 'N/A';
	return `${Math.round(latency)}ms`;
}

// Get sync status color (Tailwind classes)
export function getStatusColor(status: SyncStatus): string {
	if (status.isSyncing) return 'bg-blue-100 text-blue-800';
	if (!status.connectivity.connected) return 'bg-red-100 text-red-800';
	if (!status.connectivity.authenticated) return 'bg-yellow-100 text-yellow-800';
	if (status.queueStats.pending > 0) return 'bg-orange-100 text-orange-800';
	return 'bg-green-100 text-green-800';
}

// Get sync status text
export function getStatusText(status: SyncStatus): string {
	if (status.isSyncing) return 'Syncing...';
	if (!status.connectivity.connected) return 'Offline';
	if (!status.connectivity.authenticated) return 'Auth Required';
	if (status.queueStats.pending > 0) return `${status.queueStats.pending} pending`;
	return 'Synced';
}

// Get sync icon
export function getStatusIcon(status: SyncStatus): string {
	if (status.isSyncing) return '🔄';
	if (!status.connectivity.connected) return '🌐';
	if (!status.connectivity.authenticated) return '🔒';
	if (status.queueStats.pending > 0) return '⏳';
	return '✅';
}