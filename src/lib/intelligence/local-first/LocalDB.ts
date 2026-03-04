/**
 * Local DB (Phase 18)
 * 
 * Minimal placeholder for local IndexedDB/SQLite wrapper.
 */

export interface LocalDB {
	/** Open the database */
	open(): Promise<void>;
	/** Close the database */
	close(): Promise<void>;
	/** Save a document */
	save(key: string, value: unknown): Promise<void>;
	/** Load a document */
	load(key: string): Promise<unknown>;
	/** Delete a document */
	delete(key: string): Promise<void>;
	/** List all keys */
	listKeys(): Promise<string[]>;
}

export class DefaultLocalDB implements LocalDB {
	private db: Map<string, unknown> = new Map();

	async open(): Promise<void> {
		console.log('LocalDB open');
	}

	async close(): Promise<void> {
		console.log('LocalDB close');
	}

	async save(key: string, value: unknown): Promise<void> {
		this.db.set(key, value);
		console.log('LocalDB save:', key);
	}

	async load(key: string): Promise<unknown> {
		console.log('LocalDB load:', key);
		return this.db.get(key);
	}

	async delete(key: string): Promise<void> {
		this.db.delete(key);
		console.log('LocalDB delete:', key);
	}

	async listKeys(): Promise<string[]> {
		return Array.from(this.db.keys());
	}
}

export default DefaultLocalDB;