/**
 * Report Template Generator (Phase 8)
 * 
 * Generates structured templates for any report type.
 */

import { EventEmitter } from '../events';
import { reportTypeRegistry } from '../registry/ReportTypeRegistry';
import { generateTemplate } from './generators/generateTemplate';
import { regenerateTemplate } from './generators/regenerateTemplate';
import { versionTemplate } from './generators/versionTemplate';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ReportTemplate } from './ReportTemplate';
import type { StyleProfile } from '../style-learner/StyleProfile';

const STORAGE_PATH = join(process.cwd(), 'workspace', 'report-templates.json');

export class ReportTemplateGenerator {
	private eventEmitter = new EventEmitter();
	private templates: ReportTemplate[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Generate a template for a report type
	 */
	generate(reportTypeId: string, styleProfileId: string | null = null): ReportTemplate {
		this.eventEmitter.emit('template:generating', { reportTypeId, styleProfileId });

		const reportType = reportTypeRegistry.getType(reportTypeId);
		if (!reportType) {
			throw new Error(`Report type "${reportTypeId}" not found`);
		}

		// In a real implementation, we would fetch the style profile by ID
		const styleProfile: StyleProfile | null = null; // placeholder

		const template = generateTemplate(reportTypeId, styleProfile);
		this.templates.push(template);
		this.save();

		this.eventEmitter.emit('template:generated', { template });
		this.eventEmitter.emit('template:completed', { template });

		return template;
	}

	/**
	 * Regenerate a template (e.g., after schema updates)
	 */
	regenerate(reportTypeId: string): ReportTemplate {
		this.eventEmitter.emit('template:regenerating', { reportTypeId });

		const existing = this.templates.find(t => t.reportTypeId === reportTypeId);
		const styleProfile: StyleProfile | null = null; // placeholder

		const template = regenerateTemplate(reportTypeId, styleProfile, existing);
		// Replace existing template
		if (existing) {
			const index = this.templates.indexOf(existing);
			this.templates[index] = template;
		} else {
			this.templates.push(template);
		}
		this.save();

		this.eventEmitter.emit('template:regenerated', { template });
		this.eventEmitter.emit('template:completed', { template });

		return template;
	}

	/**
	 * Get a template by report type ID
	 */
	getTemplate(reportTypeId: string): ReportTemplate | null {
		return this.templates.find(t => t.reportTypeId === reportTypeId) || null;
	}

	/**
	 * Get all templates
	 */
	getAllTemplates(): ReportTemplate[] {
		return [...this.templates];
	}

	/**
	 * Increment version of a template
	 */
	incrementVersion(reportTypeId: string): ReportTemplate | null {
		const existing = this.templates.find(t => t.reportTypeId === reportTypeId);
		if (!existing) {
			return null;
		}

		const updated = versionTemplate(existing);
		const index = this.templates.indexOf(existing);
		this.templates[index] = updated;
		this.save();

		this.eventEmitter.emit('template:versionIncremented', { template: updated });
		return updated;
	}

	/**
	 * Load templates from disk
	 */
	private load(): void {
		if (!existsSync(STORAGE_PATH)) {
			this.templates = [];
			return;
		}

		try {
			const data = readFileSync(STORAGE_PATH, 'utf-8');
			const parsed = JSON.parse(data);
			// Convert date strings
			this.templates = parsed.map((t: any) => ({
				...t,
				createdAt: new Date(t.createdAt),
				updatedAt: new Date(t.updatedAt)
			}));
		} catch (err) {
			console.error('Failed to load report templates:', err);
			this.templates = [];
		}
	}

	/**
	 * Save templates to disk
	 */
	private save(): void {
		try {
			const data = JSON.stringify(this.templates, null, 2);
			writeFileSync(STORAGE_PATH, data, 'utf-8');
		} catch (err) {
			console.error('Failed to save report templates:', err);
		}
	}

	/**
	 * Event subscription
	 */
	on(event: string, callback: (data: any) => void) {
		this.eventEmitter.on(event, callback);
	}

	/**
	 * Event unsubscription
	 */
	off(event: string, callback: (data: any) => void) {
		this.eventEmitter.off(event, callback);
	}
}