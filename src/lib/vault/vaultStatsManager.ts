// Vault statistics manager

import type { VaultStats } from './types'
import { getAllApiKeys } from './localVault'
import { getCloudVaultStats, checkCloudConnectivity } from './cloudVault'

export class VaultStatsManager {
	// Get vault statistics
	async getStats(lastSyncTime: Date | null): Promise<VaultStats> {
		const localKeys = await getAllApiKeys()
		const connectivity = await checkCloudConnectivity()

		const stats: VaultStats = {
			totalKeys: localKeys.length,
			localKeys: localKeys.length,
			cloudKeys: 0,
			syncedKeys: localKeys.filter(k => k.lastSyncedAt).length,
			lastSync: lastSyncTime,
			cloudAvailable: connectivity.connected && connectivity.authenticated,
			providers: {}
		}

		// Count by provider
		localKeys.forEach(key => {
			stats.providers[key.provider] = (stats.providers[key.provider] || 0) + 1
		})

		// Get cloud stats if available
		if (connectivity.connected && connectivity.authenticated) {
			try {
				const cloudStats = await getCloudVaultStats()
				stats.cloudKeys = cloudStats.totalKeys
			} catch (error) {
				console.warn('Failed to get cloud stats:', error)
			}
		}

		return stats
	}

	// Get provider statistics
	getProviderStats(keys: any[]): Record<string, number> {
		const providers: Record<string, number> = {}
		keys.forEach(key => {
			providers[key.provider] = (providers[key.provider] || 0) + 1
		})
		return providers
	}

	// Check if cloud is available
	async isCloudAvailable(): Promise<boolean> {
		const connectivity = await checkCloudConnectivity()
		return connectivity.connected && connectivity.authenticated
	}
}