/**
 * Storage for decompiled reports (Phase 2)
 * 
 * Persists decompiled reports to a JSON file in the workspace.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DecompiledReport } from './DecompiledReport';

const STORAGE_PATH = path.join(process.cwd(), 'workspace', 'decompiled-reports.json');

export class DecompiledReportStorage {
	private reports: DecompiledReport[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Load reports from disk
	 */
	load(): void {
		if (!fs.existsSync(STORAGE_PATH)) {
			this.reports = [];
			return;
		}

		try {
			const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
			const parsed = JSON.parse(data);
			// Convert date strings back to Date objects
			this.reports = parsed.map((r: any) => ({
				...r,
				createdAt: new Date(r.createdAt),
				updatedAt: new Date(r.updatedAt)
			}));
		} catch (err) {
			console.error('Failed to load decompiled reports:', err);
			this.reports = [];
		}
	}

	/**
	 * Save reports to disk
	 */
	save(): void {
		try {
			const data = JSON.stringify(this.reports, null, 2);
			fs.writeFileSync(STORAGE_PATH, data, 'utf-8');
		} catch (err) {
			console.error('Failed to save decompiled reports:', err);
		}
	}

	/**
	 * Add a new decompiled report
	 */
	add(report: DecompiledReport): void {
		this.reports.push(report);
		this.save();
	}

	/**
	 * Get all decompiled reports
	 */
	getAll(): DecompiledReport[] {
		return [...this.reports];
	}

	/**
	 * Get decompiled report by ID
	 */
	getById(id: string): DecompiledReport | undefined {
		return this.reports.find(r => r.id === id);
	}

	/**
	 * Delete a decompiled report by ID
	 */
	delete(id: string): void {
		const index = this.reports.findIndex(r => r.id === id);
		if (index >= 0) {
			this.reports.splice(index, 1);
			this.save();
		}
	}

	/**
	 * Clear all decompiled reports
	 */
	clear(): void {
		this.reports = [];
		this.save();
	}
}

/**
 * Singleton instance
 */
export const decompiledReportStorage = new DecompiledReportStorage();