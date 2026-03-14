// Vault import/export manager

import type { SyncStatus } from './types'
import { exportEncryptedKeys, importEncryptedKeys } from './localVault'
import { checkCloudConnectivity } from './cloudVault'
import { syncOperation } from './vaultSyncOperations'

export class VaultImportExportManager {
	// Export vault data
	async exportVault(): Promise<string> {
		return exportEncryptedKeys()
	}

	// Import vault data
	async importVault(data: string): Promise<void> {
		await importEncryptedKeys(data)
		
		// Sync imported data to cloud
		await this.syncImportedData()
	}

	// Sync imported data to cloud
	private async syncImportedData(): Promise<void> {
		const connectivity = await checkCloudConnectivity()
		if (connectivity.connected) {
			try {
				await syncOperation()
			} catch (error) {
				console.warn('Failed to sync imported data:', error)
			}
		}
	}

	// Validate import data
	async validateImportData(data: string): Promise<boolean> {
		try {
			// Try to parse the data
			const parsed = JSON.parse(data)
			// Check if it has the expected structure
			return parsed && Array.isArray(parsed.keys)
		} catch {
			return false
		}
	}

	// Get import file size
	getImportFileSize(data: string): number {
		return new Blob([data]).size
	}

	// Check if data is too large for import
	isDataTooLarge(data: string, maxSizeMB: number = 10): boolean {
		const sizeBytes = this.getImportFileSize(data)
		const sizeMB = sizeBytes / (1024 * 1024)
		return sizeMB > maxSizeMB
	}
}