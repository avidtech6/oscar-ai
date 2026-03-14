// Simple browser-compatible event emitter
const createEventEmitter = () => ({
  events: {},
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
});

import { EventEmitter } from '../events';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { SchemaUpdateAction, SchemaUpdateActionType } from './SchemaUpdateAction';
import { createSchemaUpdateAction } from './SchemaUpdateAction';
import { applyFieldUpdate } from './actions/applyFieldUpdate';
import { applySectionUpdate } from './actions/applySectionUpdate';
import { applyTerminologyUpdate } from './actions/applyTerminologyUpdate';
import { applyComplianceRuleUpdate } from './actions/applyComplianceRuleUpdate';
import { applyTemplateUpdate } from './actions/applyTemplateUpdate';
import { applyAIGuidanceUpdate } from './actions/applyAIGuidanceUpdate';
import { applyReportTypeUpdate } from './actions/applyReportTypeUpdate';
const STORAGE_KEY = 'schema-updates';

export class SchemaUpdaterEngine {
	private eventEmitter = createEventEmitter();
	private updateActions: SchemaUpdateAction[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Analyse a schema mapping result and generate update actions
	 */
	analyse(mappingResult: SchemaMappingResult): SchemaUpdateAction[] {
		this.eventEmitter.emit('schemaUpdater:analysisStarted', { mappingResultId: mappingResult.id });

		const actions: SchemaUpdateAction[] = [];

		const reportTypeId = mappingResult.reportTypeId;
		if (!reportTypeId) {
			// No report type identified, cannot generate updates
			this.eventEmitter.emit('schemaUpdater:analysisComplete', { actions: [] });
			return [];
		}

		// Generate actions based on gaps
		// 1. Missing required sections
		for (const missingSection of mappingResult.missingRequiredSections) {
			actions.push(
				createSchemaUpdateAction(
					'addSection',
					reportTypeId,
					{ sectionName: missingSection, sectionType: 'required' },
					`Missing required section "${missingSection}" detected in mapping`
				)
			);
		}

		// 2. Extra sections (could be added as optional)
		for (const extraSection of mappingResult.extraSections) {
			actions.push(
				createSchemaUpdateAction(
					'addSection',
					reportTypeId,
					{ sectionName: extraSection, sectionType: 'optional' },
					`Extra section "${extraSection}" found in report, adding as optional`
				)
			);
		}

		// 3. Unknown terminology
		for (const unknownTerm of mappingResult.unknownTerminology) {
			actions.push(
				createSchemaUpdateAction(
					'addTerminology',
					reportTypeId,
					{ term: unknownTerm },
					`Unknown terminology "${unknownTerm}" detected`
				)
			);
		}

		// 4. Schema gaps
		for (const gap of mappingResult.schemaGaps) {
			actions.push(
				createSchemaUpdateAction(
					'addComplianceRule',
					reportTypeId,
					{ rule: gap },
					`Schema gap: ${gap}`
				)
			);
		}

		this.eventEmitter.emit('schemaUpdater:analysisComplete', { actions });
		return actions;
	}

	/**
	 * Apply a list of update actions
	 */
	applyUpdates(actions: SchemaUpdateAction[]): { applied: number; failed: number; errors: string[] } {
		this.eventEmitter.emit('schemaUpdater:updatesApplying', { actionCount: actions.length });

		let applied = 0;
		let failed = 0;
		const errors: string[] = [];

		for (const action of actions) {
			const result = this.applySingleUpdate(action);
			if (result.success) {
				applied++;
				this.updateActions.push(action);
			} else {
				failed++;
				errors.push(`Failed to apply action ${action.id}: ${result.error}`);
				action.status = 'failed';
				action.error = result.error;
			}
		}

		if (applied > 0) {
			this.incrementVersion();
			this.persistUpdates();
		}

		this.eventEmitter.emit('schemaUpdater:updatesApplied', { applied, failed, errors });
		return { applied, failed, errors };
	}

	/**
	 * Apply a single update action
	 */
	private applySingleUpdate(action: SchemaUpdateAction): { success: boolean; error?: string } {
		const type = action.type;
		switch (type) {
			case 'addField':
				return applyFieldUpdate(action);
			case 'addSection':
			case 'updateSection':
				return applySectionUpdate(action);
			case 'addTerminology':
				return applyTerminologyUpdate(action);
			case 'addComplianceRule':
				return applyComplianceRuleUpdate(action);
			case 'updateTemplate':
				return applyTemplateUpdate(action);
			case 'updateAIGuidance':
				return applyAIGuidanceUpdate(action);
			case 'updateReportTypeDefinition':
				return applyReportTypeUpdate(action);
			default:
				return { success: false, error: `Unknown action type: ${type}` };
		}
	}

	/**
	 * Increment version (placeholder)
	 */
	private incrementVersion(): void {
		// In a real implementation, we would update a version number in a registry
		this.eventEmitter.emit('schemaUpdater:versionIncremented', { newVersion: '1.0.1' });
	}

	/**
	 * Persist updates to localStorage
	 */
	private persistUpdates(): void {
		try {
			const data = JSON.stringify(this.updateActions, null, 2);
			localStorage.setItem(STORAGE_KEY, data);
		} catch (err) {
			console.error('Failed to persist schema updates:', err);
		}
	}

	/**
	 * Load previous updates from localStorage
	 */
	private load(): void {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				this.updateActions = [];
				return;
			}

			const parsed = JSON.parse(stored);
			// Convert date strings
			this.updateActions = parsed.map((a: any) => ({
				...a,
				createdAt: new Date(a.createdAt),
				appliedAt: a.appliedAt ? new Date(a.appliedAt) : undefined
			}));
		} catch (err) {
			console.error('Failed to load schema updates:', err);
			this.updateActions = [];
		}
	}

	/**
	 * Get a summary of applied updates
	 */
	getUpdateSummary(): {
		totalUpdates: number;
		appliedUpdates: number;
		failedUpdates: number;
		lastUpdated?: Date;
	} {
		const applied = this.updateActions.filter(a => a.status === 'applied').length;
		const failed = this.updateActions.filter(a => a.status === 'failed').length;
		const lastUpdated = this.updateActions.length > 0
			? this.updateActions.reduce((latest, a) => (a.appliedAt && a.appliedAt > latest ? a.appliedAt : latest), new Date(0))
			: undefined;

		return {
			totalUpdates: this.updateActions.length,
			appliedUpdates: applied,
			failedUpdates: failed,
			lastUpdated
		};
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