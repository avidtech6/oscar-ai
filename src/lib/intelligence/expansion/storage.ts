/**
 * Storage for report type expansion results (Phase 11)
 * 
 * Persists expansion results to a JSON file in the workspace.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ReportTypeExpansionResult } from './ReportTypeExpansionResult';

const STORAGE_PATH = join(process.cwd(), 'workspace', 'report-type-expansions.json');

export class ReportTypeExpansionStorage {
	private results: ReportTypeExpansionResult[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Load results from disk
	 */
	load(): void {
		if (!existsSync(STORAGE_PATH)) {
			this.results = [];
			return;
		}

		try {
			const data = readFileSync(STORAGE_PATH, 'utf-8');
			const parsed = JSON.parse(data);
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
	 * Save results to disk
	 */
	save(): void {
		try {
			const data = JSON.stringify(this.results, null, 2);
			writeFileSync(STORAGE_PATH, data, 'utf-8');
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