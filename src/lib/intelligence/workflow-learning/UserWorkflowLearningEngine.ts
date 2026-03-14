/**
 * User Workflow Learning Engine (Phase 13)
 * 
 * Observes user interactions, analyses report creation sequences, detects workflow patterns,
 * builds workflow profiles, and provides predictions and suggestions.
 */

// Custom EventEmitter implementation for browser compatibility
class EventEmitter {
	private listeners: Map<string, Function[]> = new Map();
	
	on(event: string, listener: Function): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(listener);
	}
	
	off(event: string, listener: Function): void {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			const index = eventListeners.indexOf(listener);
			if (index > -1) {
				eventListeners.splice(index, 1);
			}
		}
	}
	
	emit(event: string, ...args: any[]): boolean {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.slice().forEach(listener => listener(...args));
			return true;
		}
		return false;
	}
}
import type { WorkflowProfile } from './WorkflowProfile';
import { createWorkflowProfile, updateWorkflowProfile } from './WorkflowProfile';
import { generateWorkflowProfile, type WorkflowObservationBatch } from './generators/generateWorkflowProfile';
import { updateWorkflowProfile as updateProfile } from './generators/updateWorkflowProfile';
import { mergeWorkflowProfiles } from './generators/mergeWorkflowProfiles';
import { computeWorkflowConfidence, computeConfidenceFactors } from './generators/computeWorkflowConfidence';
import type { SectionOrderObservation } from './analyzers/analyzeSectionOrder';
import type { OmissionObservation } from './analyzers/analyzeOmissions';
import type { CorrectionObservation } from './analyzers/analyzeCorrections';
import type { InteractionObservation } from './analyzers/analyzeInteractionPatterns';
import type { DataSourceObservation } from './analyzers/analyzeDataSources';

export interface UserInteractionEvent {
	type: 'sectionOrder' | 'omission' | 'correction' | 'interaction' | 'dataSource';
	userId: string;
	reportId: string;
	reportTypeId: string | null;
	data: any;
	timestamp: Date;
}

export class UserWorkflowLearningEngine {
	private emitter: EventEmitter;
	private observations: Map<string, WorkflowObservationBatch>; // userId -> batch
	private profiles: Map<string, WorkflowProfile[]>; // userId -> array of profiles

	constructor() {
		this.emitter = new EventEmitter();
		this.observations = new Map();
		this.profiles = new Map();
	}

	// Event handling
	on(event: string, listener: (...args: any[]) => void) {
		this.emitter.on(event, listener);
	}

	emit(event: string, ...args: any[]) {
		this.emitter.emit(event, ...args);
	}

	/**
	 * Observe a user interaction and store it for later analysis.
	 */
	observeInteraction(event: UserInteractionEvent): void {
		const { userId, reportId, reportTypeId, type, data, timestamp } = event;

		// Ensure observation batch exists for this user
		if (!this.observations.has(userId)) {
			this.observations.set(userId, {
				sectionOrders: [],
				omissions: [],
				corrections: [],
				interactions: [],
				dataSources: [],
			});
		}
		const batch = this.observations.get(userId)!;

		// Add observation to appropriate array
		switch (type) {
			case 'sectionOrder':
				batch.sectionOrders.push({
					reportId,
					reportTypeId: reportTypeId || 'unknown',
					sectionOrder: data.sectionOrder,
					timestamp,
				});
				break;
			case 'omission':
				batch.omissions.push({
					reportId,
					reportTypeId: reportTypeId || 'unknown',
					missingSections: data.missingSections,
					missingFields: data.missingFields,
					timestamp,
				});
				break;
			case 'correction':
				batch.corrections.push({
					reportId,
					reportTypeId: reportTypeId || 'unknown',
					correctedSections: data.correctedSections,
					correctedFields: data.correctedFields,
					correctionTypes: data.correctionTypes,
					timestamp,
				});
				break;
			case 'interaction':
				batch.interactions.push({
					reportId,
					reportTypeId: reportTypeId || 'unknown',
					interactionType: data.interactionType,
					interactionDetail: data.interactionDetail,
					timestamp,
				});
				break;
			case 'dataSource':
				batch.dataSources.push({
					reportId,
					reportTypeId: reportTypeId || 'unknown',
					dataSourceType: data.dataSourceType,
					dataSourceDetail: data.dataSourceDetail,
					timestamp,
				});
				break;
			default:
				console.warn(`Unknown observation type: ${type}`);
				return;
		}

		this.emit('workflow:interactionObserved', { userId, type, timestamp });
	}

	/**
	 * Analyse all stored interactions for a user and update/create workflow profiles.
	 */
	analyseInteractions(userId: string): WorkflowProfile[] {
		const batch = this.observations.get(userId);
		if (!batch || this.isEmptyBatch(batch)) {
			this.emit('workflow:analysisComplete', { userId, profiles: [] });
			return [];
		}

		// Group observations by reportTypeId
		const byReportType = this.groupObservationsByReportType(batch);

		const updatedProfiles: WorkflowProfile[] = [];

		for (const [reportTypeId, subBatch] of Object.entries(byReportType)) {
			const existingProfile = this.findProfile(userId, reportTypeId);
			let profile: WorkflowProfile;

			if (existingProfile) {
				profile = updateProfile(existingProfile, subBatch);
				this.emit('workflow:profileUpdated', { userId, profile });
			} else {
				profile = generateWorkflowProfile(userId, reportTypeId, subBatch);
				this.emit('workflow:profileCreated', { userId, profile });
			}

			// Re‑compute confidence with fresh factors
			const factors = computeConfidenceFactors(
				profile,
				this.countObservations(subBatch),
				this.getLatestObservationTime(subBatch),
				0.8 // placeholder consistency
			);
			profile.confidenceScore = computeWorkflowConfidence(profile, factors);

			updatedProfiles.push(profile);
			this.saveProfile(userId, profile);
		}

		// Merge profiles if needed (e.g., generic profile across report types)
		const mergedProfile = this.mergeProfilesForUser(userId);
		if (mergedProfile) {
			updatedProfiles.push(mergedProfile);
			this.emit('workflow:merged', { userId, mergedProfile });
		}

		this.observations.delete(userId); // Clear processed observations
		this.emit('workflow:analysisComplete', { userId, profiles: updatedProfiles });
		return updatedProfiles;
	}

	/**
	 * Get the workflow profile for a user (and optionally a specific report type).
	 */
	getWorkflowProfile(userId: string, reportTypeId?: string): WorkflowProfile | null {
		const profiles = this.profiles.get(userId) || [];
		if (reportTypeId) {
			return profiles.find(p => p.reportTypeId === reportTypeId) || null;
		}
		// Return the profile with highest confidence
		return profiles.reduce((best, curr) =>
			curr.confidenceScore > (best?.confidenceScore || -1) ? curr : best, null as WorkflowProfile | null
		);
	}

	/**
	 * Predict the next likely user action based on the workflow profile.
	 */
	predictNextAction(userId: string, reportTypeId?: string): string[] {
		const profile = this.getWorkflowProfile(userId, reportTypeId);
		if (!profile) {
			return [];
		}

		const predictions: string[] = [];

		// Predict next section based on commonSectionOrder
		if (profile.commonSectionOrder.length > 0) {
			predictions.push(`Complete section: ${profile.commonSectionOrder[0]}`);
		}

		// Warn about common omissions
		if (profile.commonOmissions.length > 0) {
			predictions.push(`Check for missing: ${profile.commonOmissions.slice(0, 3).join(', ')}`);
		}

		// Suggest data sources
		if (profile.typicalDataSources.length > 0) {
			predictions.push(`Consider data from: ${profile.typicalDataSources.slice(0, 2).join(', ')}`);
		}

		return predictions.slice(0, 5); // Limit to top 5
	}

	// Private helpers
	private isEmptyBatch(batch: WorkflowObservationBatch): boolean {
		return (
			batch.sectionOrders.length === 0 &&
			batch.omissions.length === 0 &&
			batch.corrections.length === 0 &&
			batch.interactions.length === 0 &&
			batch.dataSources.length === 0
		);
	}

	private groupObservationsByReportType(batch: WorkflowObservationBatch): Record<string, WorkflowObservationBatch> {
		const result: Record<string, WorkflowObservationBatch> = {};

		const add = (reportTypeId: string, data: any, array: keyof WorkflowObservationBatch) => {
			if (!result[reportTypeId]) {
				result[reportTypeId] = {
					sectionOrders: [],
					omissions: [],
					corrections: [],
					interactions: [],
					dataSources: [],
				};
			}
			(result[reportTypeId][array] as any[]).push(data);
		};

		batch.sectionOrders.forEach(obs => add(obs.reportTypeId, obs, 'sectionOrders'));
		batch.omissions.forEach(obs => add(obs.reportTypeId, obs, 'omissions'));
		batch.corrections.forEach(obs => add(obs.reportTypeId, obs, 'corrections'));
		batch.interactions.forEach(obs => add(obs.reportTypeId, obs, 'interactions'));
		batch.dataSources.forEach(obs => add(obs.reportTypeId, obs, 'dataSources'));

		return result;
	}

	private findProfile(userId: string, reportTypeId: string): WorkflowProfile | null {
		const profiles = this.profiles.get(userId) || [];
		return profiles.find(p => p.reportTypeId === reportTypeId) || null;
	}

	private saveProfile(userId: string, profile: WorkflowProfile): void {
		if (!this.profiles.has(userId)) {
			this.profiles.set(userId, []);
		}
		const list = this.profiles.get(userId)!;
		const index = list.findIndex(p => p.id === profile.id);
		if (index >= 0) {
			list[index] = profile;
		} else {
			list.push(profile);
		}
	}

	private mergeProfilesForUser(userId: string): WorkflowProfile | null {
		const profiles = this.profiles.get(userId) || [];
		if (profiles.length < 2) {
			return null;
		}
		// Merge the two most confident profiles
		const sorted = [...profiles].sort((a, b) => b.confidenceScore - a.confidenceScore);
		const merged = mergeWorkflowProfiles(sorted[0], sorted[1]);
		this.saveProfile(userId, merged);
		return merged;
	}

	private countObservations(batch: WorkflowObservationBatch): number {
		return (
			batch.sectionOrders.length +
			batch.omissions.length +
			batch.corrections.length +
			batch.interactions.length +
			batch.dataSources.length
		);
	}

	private getLatestObservationTime(batch: WorkflowObservationBatch): Date {
		const allTimes = [
			...batch.sectionOrders.map(o => o.timestamp),
			...batch.omissions.map(o => o.timestamp),
			...batch.corrections.map(o => o.timestamp),
			...batch.interactions.map(o => o.timestamp),
			...batch.dataSources.map(o => o.timestamp),
		];
		return new Date(Math.max(...allTimes.map(d => d.getTime())));
	}
}