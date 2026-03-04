/**
 * Supabase Client (Phase 18)
 * 
 * Minimal placeholder for Supabase client wrapper.
 */

export interface SupabaseClient {
	/** Initialize the client */
	init(url: string, anonKey: string): void;
	/** Get the raw Supabase client */
	getClient(): unknown;
	/** Check if client is initialized */
	isInitialized(): boolean;
	/** Close the connection */
	close(): void;
}

export class DefaultSupabaseClient implements SupabaseClient {
	private initialized = false;
	private client: unknown = null;

	init(url: string, anonKey: string): void {
		console.log('SupabaseClient init:', url, anonKey.substring(0, 8) + '...');
		this.client = { url, anonKey };
		this.initialized = true;
	}

	getClient(): unknown {
		return this.client;
	}

	isInitialized(): boolean {
		return this.initialized;
	}

	close(): void {
		this.client = null;
		this.initialized = false;
		console.log('SupabaseClient closed');
	}
}

export default DefaultSupabaseClient;