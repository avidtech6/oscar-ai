/**
 * Storage for decompiled reports (Phase 2)
 *
 * Persists decompiled reports to browser localStorage.
 */

import type { DecompiledReport } from './DecompiledReport';

const STORAGE_KEY = 'decompiled-reports';

export class DecompiledReportStorage {
	private reports: DecompiledReport[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Load reports from localStorage
	 */
	load(): void {
		try {
			// Check if we're in a browser environment
			if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
				this.reports = [];
				return;
			}
			
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				this.reports = [];
				return;
			}

			const parsed = JSON.parse(stored);
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
	 * Save reports to localStorage
	 */
	save(): void {
		try {
			// Check if we're in a browser environment
			if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
				return;
			}
			
			const data = JSON.stringify(this.reports, null, 2);
			localStorage.setItem(STORAGE_KEY, data);
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