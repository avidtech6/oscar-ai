// Vault configuration and types

import type { APIKey, APIKeyInput, SyncStatus, VaultStats, VaultConfig } from './types'

// Default configuration
export const DEFAULT_CONFIG: VaultConfig = {
	autoSync: true,
	syncInterval: 30000, // 30 seconds
	maxRetries: 3,
	requireBiometric: false
}

// Vault configuration helper
export class VaultConfigManager {
	// Merge user config with defaults
	static mergeConfig(userConfig: Partial<VaultConfig> = {}): VaultConfig {
		return { ...DEFAULT_CONFIG, ...userConfig }
	}

	// Validate configuration
	static validateConfig(config: VaultConfig): boolean {
		return (
			typeof config.autoSync === 'boolean' &&
			typeof config.syncInterval === 'number' &&
			config.syncInterval > 0 &&
			typeof config.maxRetries === 'number' &&
			config.maxRetries > 0 &&
			typeof config.requireBiometric === 'boolean'
		)
	}

	// Get sync interval in seconds
	static getSyncIntervalSeconds(config: VaultConfig): number {
		return Math.floor(config.syncInterval / 1000)
	}
}