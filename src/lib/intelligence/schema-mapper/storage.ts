/**
 * Storage for schema mapping results (Phase 3)
 *
 * Persists mapping results to browser localStorage.
 */

import type { SchemaMappingResult } from './SchemaMappingResult';

const STORAGE_KEY = 'schema-mapping-results';

export class SchemaMappingStorage {
	private results: SchemaMappingResult[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Load results from localStorage
	 */
	load(): void {
		try {
			// Check if we're in a browser environment
			if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
				this.results = [];
				return;
			}
			
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				this.results = [];
				return;
			}

			const parsed = JSON.parse(stored);
			// Convert date strings back to Date objects
			this.results = parsed.map((r: any) => ({
				...r,
				createdAt: new Date(r.createdAt),
				updatedAt: new Date(r.updatedAt)
			}));
		} catch (err) {
			console.error('Failed to load schema mapping results:', err);
			this.results = [];
		}
	}

	/**
	 * Save results to localStorage
	 */
	save(): void {
		try {
			// Check if we're in a browser environment
			if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
				return;
			}
			
			const data = JSON.stringify(this.results, null, 2);
			localStorage.setItem(STORAGE_KEY, data);
		} catch (err) {
			console.error('Failed to save schema mapping results:', err);
		}
	}

	/**
	 * Add a new mapping result
	 */
	add(result: SchemaMappingResult): void {
		this.results.push(result);
		this.save();
	}

	/**
	 * Get all mapping results
	 */
	getAll(): SchemaMappingResult[] {
		return [...this.results];
	}

	/**
	 * Get mapping result by ID
	 */
	getById(id: string): SchemaMappingResult | undefined {
		return this.results.find(r => r.id === id);
	}

	/**
	 * Get mapping results for a specific report type
	 */
	getByReportType(reportTypeId: string): SchemaMappingResult[] {
		return this.results.filter(r => r.reportTypeId === reportTypeId);
	}

	/**
	 * Delete a mapping result by ID
	 */
	delete(id: string): void {
		const index = this.results.findIndex(r => r.id === id);
		if (index >= 0) {
			this.results.splice(index, 1);
			this.save();
		}
	}

	/**
	 * Clear all mapping results
	 */
	clear(): void {
		this.results = [];
		this.save();
	}
}

/**
 * Singleton instance
 */
export const schemaMappingStorage = new SchemaMappingStorage();