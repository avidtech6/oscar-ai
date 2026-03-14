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
import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import type { SchemaMappingResult } from '../schema-mapper/SchemaMappingResult';
import type { ClassificationResult } from '../classification/ClassificationResult';
import { reportTypeRegistry } from '../registry/ReportTypeRegistry';
import { SchemaUpdaterEngine } from '../schema-updater/SchemaUpdaterEngine';
import { generateHealingActions } from './generators/generateHealingActions';
import { type SelfHealingAction, SelfHealingActionType, Severity } from './SelfHealingAction';
const STORAGE_KEY = 'self-healing-actions';

export class ReportSelfHealingEngine {
	private eventEmitter = createEventEmitter();
	private actions: SelfHealingAction[] = [];
	private schemaUpdater = new SchemaUpdaterEngine();

	constructor() {
		this.load();
	}

	/**
	 * Analyse a decompiled report and its classification/mapping results
	 */
	analyse(
		decompiledReport: DecompiledReport,
		classificationResult: ClassificationResult | null = null,
		mappingResult: SchemaMappingResult | null = null
	): SelfHealingAction[] {
		this.eventEmitter.emit('selfHealing:analysisStarted', {
			decompiledReportId: decompiledReport.id,
			classificationResult,
			mappingResult
		});

		const reportTypeId = classificationResult?.detectedReportTypeId || decompiledReport.detectedReportType;
		const reportType = reportTypeId ? reportTypeRegistry.getType(reportTypeId) : null;

		if (!reportType) {
			this.eventEmitter.emit('selfHealing:analysisComplete', { actions: [] });
			return [];
		}

		// Generate healing actions
		const actions = generateHealingActions(decompiledReport, reportType);
		this.actions.push(...actions);
		this.save();

		this.eventEmitter.emit('selfHealing:actionsGenerated', { actions });
		this.eventEmitter.emit('selfHealing:analysisComplete', { actions });

		return actions;
	}

	/**
	 * Apply healing actions (delegates to Schema Updater Engine)
	 */
	applyHealingActions(actions: SelfHealingAction[]): void {
		this.eventEmitter.emit('selfHealing:actionsApplied', { actions });

		const updateActions = actions
			.map(action => this.convertToUpdateAction(action))
			.filter((action): action is any => action !== null);

		if (updateActions.length > 0) {
			const result = this.schemaUpdater.applyUpdates(updateActions);
			// Mark applied actions
			for (const action of actions) {
				if (result.applied > 0) {
					action.appliedAt = new Date();
				}
			}
		}

		this.save();
		this.eventEmitter.emit('selfHealing:completed', { appliedCount: actions.length });
	}

	/**
	 * Convert a self‑healing action to a schema update action
	 */
	private convertToUpdateAction(action: SelfHealingAction): any | null {
		// target is a string (reportTypeId)
		const reportTypeId = action.target;
		switch (action.type) {
			case SelfHealingActionType.ADD_MISSING_SECTION:
				return {
					type: 'addSection',
					reportTypeId,
					payload: { sectionName: action.payload.sectionName, sectionType: 'required' },
					description: action.reason,
					createdAt: new Date(),
					status: 'pending'
				};
			case SelfHealingActionType.ADD_MISSING_FIELD:
				return {
					type: 'addField',
					reportTypeId,
					payload: { fieldName: action.payload.fieldName, fieldType: 'string' },
					description: action.reason,
					createdAt: new Date(),
					status: 'pending'
				};
			case SelfHealingActionType.ADD_MISSING_COMPLIANCE_RULE:
				return {
					type: 'addComplianceRule',
					reportTypeId,
					payload: { rule: action.payload.rule },
					description: action.reason,
					createdAt: new Date(),
					status: 'pending'
				};
			case SelfHealingActionType.ADD_MISSING_TERMINOLOGY:
				return {
					type: 'addTerminology',
					reportTypeId,
					payload: { term: action.payload.term },
					description: action.reason,
					createdAt: new Date(),
					status: 'pending'
				};
			default:
				return null;
		}
	}

	/**
	 * Get healing summary
	 */
	getHealingSummary() {
		const applied = this.actions.filter(a => a.appliedAt !== null).length;
		const pending = this.actions.filter(a => a.appliedAt === null).length;
		const bySeverity = {
			[Severity.LOW]: this.actions.filter(a => a.severity === Severity.LOW).length,
			[Severity.MEDIUM]: this.actions.filter(a => a.severity === Severity.MEDIUM).length,
			[Severity.HIGH]: this.actions.filter(a => a.severity === Severity.HIGH).length,
			[Severity.CRITICAL]: this.actions.filter(a => a.severity === Severity.CRITICAL).length
		};
		return {
			total: this.actions.length,
			applied,
			pending,
			bySeverity
		};
	}

	/**
	 * Load actions from localStorage
	 */
	private load(): void {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				this.actions = [];
				return;
			}

			const parsed = JSON.parse(stored);
			// Convert date strings
			this.actions = parsed.map((a: any) => ({
				...a,
				createdAt: new Date(a.createdAt),
				appliedAt: a.appliedAt ? new Date(a.appliedAt) : null
			}));
		} catch (err) {
			console.error('Failed to load self‑healing actions:', err);
			this.actions = [];
		}
	}

	/**
	 * Save actions to localStorage
	 */
	private save(): void {
		try {
			const data = JSON.stringify(this.actions, null, 2);
			localStorage.setItem(STORAGE_KEY, data);
		} catch (err) {
			console.error('Failed to save self‑healing actions:', err);
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