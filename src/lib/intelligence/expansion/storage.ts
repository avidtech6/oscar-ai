/**
 * Storage for report type expansion results (Phase 11)
 * 
 * Persists expansion results to a JSON file in the workspace.
 */

import type { ReportTypeExpansionResult } from './ReportTypeExpansionResult';

const STORAGE_KEY = 'report-type-expansions';

export class ReportTypeExpansionStorage {
	private results: ReportTypeExpansionResult[] = [];

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
				timestamps: {
					createdAt: new Date(r.timestamps.createdAt),
					updatedAt: new Date(r.timestamps.updatedAt),
					analysedAt: new Date(r.timestamps.analysedAt)
				}
			}));
		} catch (err) {
			console.error('Failed to load expansion results:', err);
			this.results = [];
		}
	}

	/**
	 * Save results to localStorage
	 */
	save(): void {
		try {
			const data = JSON.stringify(this.results, null, 2);
			localStorage.setItem(STORAGE_KEY, data);
		} catch (err) {
			console.error('Failed to save expansion results:', err);
		}
	}

	/**
	 * Add a new expansion result
	 */
	add(result: ReportTypeExpansionResult): void {
		this.results.push(result);
		this.save();
	}

	/**
	 * Get all expansion results
	 */
	getAll(): ReportTypeExpansionResult[] {
		return [...this.results];
	}

	/**
	 * Get expansion result by ID
	 */
	getById(id: string): ReportTypeExpansionResult | undefined {
		return this.results.find(r => r.id === id);
	}

	/**
	 * Delete an expansion result by ID
	 */
	delete(id: string): void {
		const index = this.results.findIndex(r => r.id === id);
		if (index >= 0) {
			this.results.splice(index, 1);
			this.save();
		}
	}

	/**
	 * Clear all expansion results
	 */
	clear(): void {
		this.results = [];
		this.save();
	}
}

/**
 * Singleton instance
 */
export const reportTypeExpansionStorage = new ReportTypeExpansionStorage();