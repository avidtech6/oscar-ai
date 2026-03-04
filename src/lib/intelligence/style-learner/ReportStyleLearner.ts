/**
 * Report Style Learner (Phase 5)
 * 
 * Learns the user's writing style, tone, structure, formatting preferences, and report‑specific habits.
 */

import { EventEmitter } from '../events';
import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { StyleProfile } from './StyleProfile';
import { createStyleProfile } from './StyleProfile';
import { extractTone } from './extractors/extractTone';
import { extractSentencePatterns } from './extractors/extractSentencePatterns';
import { extractParagraphPatterns } from './extractors/extractParagraphPatterns';
import { extractSectionOrdering } from './extractors/extractSectionOrdering';
import { extractPreferredPhrasing } from './extractors/extractPreferredPhrasing';
import { extractFormattingPreferences } from './extractors/extractFormattingPreferences';
import { extractTerminologyPreferences } from './extractors/extractTerminologyPreferences';
import { extractStructuralPreferences } from './extractors/extractStructuralPreferences';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const STORAGE_PATH = join(process.cwd(), 'workspace', 'style-profiles.json');

export class ReportStyleLearner {
	private eventEmitter = new EventEmitter();
	private profiles: StyleProfile[] = [];

	constructor() {
		this.load();
	}

	/**
	 * Analyse a decompiled report and build/update a style profile
	 */
	analyse(decompiledReport: DecompiledReport, userId: string, reportTypeId: string | null = null): StyleProfile {
		this.eventEmitter.emit('styleLearner:analysisStarted', { decompiledReportId: decompiledReport.id });

		// Extract all style features
		const tone = extractTone(decompiledReport);
		const sentencePatterns = extractSentencePatterns(decompiledReport);
		const paragraphPatterns = extractParagraphPatterns(decompiledReport);
		const sectionOrdering = extractSectionOrdering(decompiledReport);
		const preferredPhrasing = extractPreferredPhrasing(decompiledReport);
		const formattingPreferences = extractFormattingPreferences(decompiledReport);
		const terminologyPreferences = extractTerminologyPreferences(decompiledReport);
		const structuralPreferences = extractStructuralPreferences(decompiledReport);

		// Find existing profile for this user and report type
		let existingProfile = this.profiles.find(p =>
			p.userId === userId && p.reportTypeId === reportTypeId
		);

		if (existingProfile) {
			// Update existing profile (merge)
			existingProfile = this.updateStyleProfile(existingProfile, {
				tone,
				sentencePatterns,
				paragraphPatterns,
				sectionOrdering,
				preferredPhrasing,
				formattingPreferences,
				terminologyPreferences,
				structuralPreferences
			});
			this.eventEmitter.emit('styleLearner:profileUpdated', { profile: existingProfile });
		} else {
			// Create new profile
			existingProfile = createStyleProfile(
				userId,
				reportTypeId,
				tone,
				sentencePatterns,
				paragraphPatterns,
				sectionOrdering,
				preferredPhrasing,
				formattingPreferences,
				terminologyPreferences,
				structuralPreferences,
				0.7 // initial confidence
			);
			this.profiles.push(existingProfile);
			this.eventEmitter.emit('styleLearner:profileCreated', { profile: existingProfile });
		}

		this.save();
		this.eventEmitter.emit('styleLearner:analysisComplete', { profile: existingProfile });
		return existingProfile;
	}

	/**
	 * Update an existing style profile with new extracted features
	 */
	private updateStyleProfile(
		profile: StyleProfile,
		updates: {
			tone: string;
			sentencePatterns: string[];
			paragraphPatterns: string[];
			sectionOrdering: string[];
			preferredPhrasing: string[];
			formattingPreferences: Record<string, any>;
			terminologyPreferences: string[];
			structuralPreferences: Record<string, any>;
		}
	): StyleProfile {
		// Merge arrays (unique)
		const mergeArrays = (oldArr: string[], newArr: string[]) => {
			const set = new Set([...oldArr, ...newArr]);
			return Array.from(set);
		};

		// Merge objects (shallow)
		const mergeObjects = (oldObj: Record<string, any>, newObj: Record<string, any>) => ({
			...oldObj,
			...newObj
		});

		profile.tone = updates.tone as any;
		profile.sentencePatterns = mergeArrays(profile.sentencePatterns, updates.sentencePatterns);
		profile.paragraphPatterns = mergeArrays(profile.paragraphPatterns, updates.paragraphPatterns);
		profile.sectionOrdering = mergeArrays(profile.sectionOrdering, updates.sectionOrdering);
		profile.preferredPhrasing = mergeArrays(profile.preferredPhrasing, updates.preferredPhrasing);
		profile.formattingPreferences = mergeObjects(profile.formattingPreferences, updates.formattingPreferences);
		profile.terminologyPreferences = mergeArrays(profile.terminologyPreferences, updates.terminologyPreferences);
		profile.structuralPreferences = mergeObjects(profile.structuralPreferences, updates.structuralPreferences);
		profile.confidenceScore = Math.min(1, profile.confidenceScore + 0.1); // increase confidence
		profile.updatedAt = new Date();
		profile.version = this.incrementVersion(profile.version);

		return profile;
	}

	/**
	 * Increment version string (simple)
	 */
	private incrementVersion(version: string): string {
		const parts = version.split('.').map(Number);
		parts[parts.length - 1] += 1;
		return parts.join('.');
	}

	/**
	 * Get style profile for a user and report type
	 */
	getStyleProfile(userId: string, reportTypeId: string | null = null): StyleProfile | undefined {
		return this.profiles.find(p => p.userId === userId && p.reportTypeId === reportTypeId);
	}

	/**
	 * Get all style profiles for a user
	 */
	getUserProfiles(userId: string): StyleProfile[] {
		return this.profiles.filter(p => p.userId === userId);
	}

	/**
	 * Apply a style profile to a report (placeholder)
	 */
	applyStyleProfile(profile: StyleProfile, reportContent: string): string {
		this.eventEmitter.emit('styleLearner:applied', { profileId: profile.id });
		// In a real implementation, we would adjust tone, phrasing, structure, etc.
		// For now, just return the original content.
		return reportContent;
	}

	/**
	 * Load profiles from disk
	 */
	private load(): void {
		if (!existsSync(STORAGE_PATH)) {
			this.profiles = [];
			return;
		}

		try {
			const data = readFileSync(STORAGE_PATH, 'utf-8');
			const parsed = JSON.parse(data);
			// Convert date strings
			this.profiles = parsed.map((p: any) => ({
				...p,
				createdAt: new Date(p.createdAt),
				updatedAt: new Date(p.updatedAt)
			}));
		} catch (err) {
			console.error('Failed to load style profiles:', err);
			this.profiles = [];
		}
	}

	/**
	 * Save profiles to disk
	 */
	private save(): void {
		try {
			const data = JSON.stringify(this.profiles, null, 2);
			writeFileSync(STORAGE_PATH, data, 'utf-8');
		} catch (err) {
			console.error('Failed to save style profiles:', err);
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