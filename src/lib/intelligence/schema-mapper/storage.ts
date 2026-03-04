/**
 * Storage for schema mapping results (Phase 3)
 * 
 * Persists mapping results to a JSON file in the workspace.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { SchemaMappingResult } from './SchemaMappingResult';

const STORAGE_PATH = join(process.cwd(), 'workspace', 'schema-mapping-results.json');

export class SchemaMappingStorage {
	private results: SchemaMappingResult[] = [];

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
				createdAt: new Date(r.createdAt),
				updatedAt: new Date(r.updatedAt)
			}));
		} catch (err) {
			console.error('Failed to load schema mapping results:', err);
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