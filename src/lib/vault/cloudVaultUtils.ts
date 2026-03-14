/**
 * Cloud vault utility functions
 */

import { browser } from '$app/environment'
import type { ApiKey } from './localVault'
import { getSupabaseClient } from './cloudVaultHelpers'
import { listCloudKeys } from './cloudVaultCrud'

// Get cloud vault statistics
export async function getCloudVaultStats(): Promise<{
	totalKeys: number
	activeKeys: number
	byProvider: Record<string, number>
	lastSync: string | null
}> {
	if (!browser) {
		return {
			totalKeys: 0,
			activeKeys: 0,
			byProvider: {},
			lastSync: null
		}
	}
	
	try {
		const cloudKeys = await listCloudKeys()
		
		const byProvider: Record<string, number> = {}
		let activeKeys = 0
		
		cloudKeys.forEach(key => {
			byProvider[key.provider] = (byProvider[key.provider] || 0) + 1
			if (key.isActive) {
				activeKeys++
			}
		})
		
		// Get most recent sync time
		const lastSync = cloudKeys.length > 0
			? new Date(Math.max(...cloudKeys.map(k => k.lastSyncedAt || 0))).toISOString()
			: null
		
		return {
			totalKeys: cloudKeys.length,
			activeKeys,
			byProvider,
			lastSync
		}
	} catch (error) {
		console.error('Failed to get cloud vault stats:', error)
		return {
			totalKeys: 0,
			activeKeys: 0,
			byProvider: {},
			lastSync: null
		}
	}
}

// Check cloud connectivity
export async function checkCloudConnectivity(): Promise<{
	connected: boolean
	authenticated: boolean
	latency: number | null
	error?: string
}> {
	if (!browser) {
		return { connected: false, authenticated: false, latency: null, error: 'Browser required' }
	}
	
	const supabase = getSupabaseClient()
	
	try {
		const startTime = performance.now()
		
		// Simple ping to Supabase
		const { data, error } = await supabase.from('api_keys').select('count').limit(1)
		
		const latency = performance.now() - startTime
		
		if (error) {
			// Check if it's an auth error
			if (error.message.includes('JWT')) {
				return {
					connected: true,
					authenticated: false,
					latency,
					error: 'Authentication required'
				}
			}
			
			return {
				connected: false,
				authenticated: false,
				latency,
				error: error.message
			}
		}
		
		// Check authentication status
		const { data: session } = await supabase.auth.getSession()
		
		return {
			connected: true,
			authenticated: !!session.session,
			latency
		}
	} catch (error: any) {
		return {
			connected: false,
			authenticated: false,
			latency: null,
			error: error.message || 'Unknown error'
		}
	}
}