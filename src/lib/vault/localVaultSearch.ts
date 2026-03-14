/**
 * Local vault search and filtering operations
 */

import type { ApiKey } from './localVaultTypes'
import { getAllApiKeys } from './localVaultCrud'

// Search API keys
export async function searchApiKeys(
	query: string,
	provider?: ApiKey['provider']
): Promise<ApiKey[]> {
	const allKeys = await getAllApiKeys()
	
	return allKeys.filter(key => {
		// Filter by provider if specified
		if (provider && key.provider !== provider) {
			return false
		}
		
		// Search in key name and model family
		const searchText = query.toLowerCase()
		return (
			key.keyName.toLowerCase().includes(searchText) ||
			(key.modelFamily && key.modelFamily.toLowerCase().includes(searchText))
		)
	})
}