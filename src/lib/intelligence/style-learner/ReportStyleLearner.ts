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

// Simple browser-compatible event emitter
const createEventEmitter = () => ({
  events: {} as Record<string, any[]>,
  on(event: string, callback: (data: any) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  off(event: string, callback: (data: any) => void) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event: string, data: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
});

const STORAGE_PATH = '/style-profiles.json';

export class ReportStyleLearner {
  private eventEmitter = createEventEmitter();
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
        formattingPreferences: Object.entries(formattingPreferences).map(([key, value]) => ({ type: key, preference: value })),
        terminologyPreferences,
        structuralPreferences: Object.entries(structuralPreferences).map(([key, value]) => ({ type: key, preference: value }))
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
   * Update an existing style profile with new data
   */
  private updateStyleProfile(
    profile: StyleProfile,
    newFeatures: {
      tone: any;
      sentencePatterns: any[];
      paragraphPatterns: any[];
      sectionOrdering: string[];
      preferredPhrasing: string[];
      formattingPreferences: any[];
      terminologyPreferences: string[];
      structuralPreferences: any[];
    }
  ): StyleProfile {
    // Merge existing features with new ones
    const mergedProfile = {
      ...profile,
      tone: this.mergeTone(profile.tone, newFeatures.tone),
      sentencePatterns: this.mergePatterns(profile.sentencePatterns, newFeatures.sentencePatterns),
      paragraphPatterns: this.mergePatterns(profile.paragraphPatterns, newFeatures.paragraphPatterns),
      sectionOrdering: this.mergeSectionOrdering(profile.sectionOrdering, newFeatures.sectionOrdering),
      preferredPhrasing: this.mergePhrasing(profile.preferredPhrasing, newFeatures.preferredPhrasing),
      formattingPreferences: this.mergeFormatting(profile.formattingPreferences, newFeatures.formattingPreferences),
      terminologyPreferences: this.mergeTerminology(profile.terminologyPreferences, newFeatures.terminologyPreferences),
      structuralPreferences: this.mergeStructural(profile.structuralPreferences, newFeatures.structuralPreferences),
      version: (parseFloat(profile.version) + 1).toFixed(1),
      timestamps: {
        ...profile.timestamps,
        updated: new Date()
      }
    };

    return mergedProfile;
  }

  /**
   * Merge tone profiles
   */
  private mergeTone(existing: any, newTone: any): any {
    if (!existing) return newTone;

    return {
      formality: this.mergeWeightedValue(existing.formality, newTone.formality),
      complexity: this.mergeWeightedValue(existing.complexity, newTone.complexity),
      sentiment: this.mergeWeightedValue(existing.sentiment, newTone.sentiment),
      confidence: Math.max(existing.confidence, newTone.confidence)
    };
  }

  /**
   * Merge pattern arrays
   */
  private mergePatterns(existing: any[], newPatterns: any[]): any[] {
    const merged = [...existing];
    newPatterns.forEach(newPattern => {
      const existingIndex = merged.findIndex(p => p.pattern === newPattern.pattern);
      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          frequency: Math.max(merged[existingIndex].frequency, newPattern.frequency),
          confidence: Math.max(merged[existingIndex].confidence, newPattern.confidence)
        };
      } else {
        merged.push(newPattern);
      }
    });
    return merged;
  }

  /**
   * Merge section ordering
   */
  private mergeSectionOrdering(existing: string[], newOrdering: string[]): string[] {
    // For section ordering, we'll keep the most common ordering
    if (existing.length === 0) return newOrdering;
    if (newOrdering.length === 0) return existing;

    // Simple approach: prefer the existing ordering if both exist
    return existing;
  }

  /**
   * Merge phrasing preferences
   */
  private mergePhrasing(existing: string[], newPhrasing: string[]): string[] {
    const merged = [...existing];
    newPhrasing.forEach(newPhrase => {
      if (!merged.includes(newPhrase)) {
        merged.push(newPhrase);
      }
    });
    return merged;
  }

  /**
   * Merge formatting preferences
   */
  private mergeFormatting(existing: any[], newFormatting: any[]): any[] {
    const merged = [...existing];
    newFormatting.forEach(newFormat => {
      const existingIndex = merged.findIndex(f => f.type === newFormat.type);
      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          preference: Math.max(merged[existingIndex].preference, newFormat.preference)
        };
      } else {
        merged.push(newFormat);
      }
    });
    return merged;
  }

  /**
   * Merge terminology preferences
   */
  private mergeTerminology(existing: string[], newTerminology: string[]): string[] {
    const merged = [...existing];
    newTerminology.forEach(newTerm => {
      if (!merged.includes(newTerm)) {
        merged.push(newTerm);
      }
    });
    return merged;
  }

  /**
   * Merge structural preferences
   */
  private mergeStructural(existing: any[], newStructural: any[]): any[] {
    const merged = [...existing];
    newStructural.forEach(newStruct => {
      const existingIndex = merged.findIndex(s => s.type === newStruct.type);
      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          preference: Math.max(merged[existingIndex].preference, newStruct.preference)
        };
      } else {
        merged.push(newStruct);
      }
    });
    return merged;
  }

  /**
   * Merge weighted values
   */
  private mergeWeightedValue(existing: number, newValue: number): number {
    // Simple average weighted by confidence
    return (existing + newValue) / 2;
  }

  /**
   * Load profiles from localStorage
   */
  private load(): void {
    try {
      const data = localStorage.getItem(STORAGE_PATH);
      if (data) {
        const parsed = JSON.parse(data);
        this.profiles = parsed.map((r: any) => ({
          ...r,
          timestamps: {
            created: new Date(r.timestamps.created),
            updated: new Date(r.timestamps.updated)
          }
        }));
      } else {
        this.profiles = [];
      }
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
      localStorage.setItem(STORAGE_PATH, data);
    } catch (err) {
      console.error('Failed to save style profiles:', err);
    }
  }

  /**
   * Get all profiles for a user
   */
  getProfilesForUser(userId: string): StyleProfile[] {
    return this.profiles.filter(p => p.userId === userId);
  }

  /**
   * Get profile for a specific user and report type
   */
  getProfile(userId: string, reportTypeId: string): StyleProfile | null {
    return this.profiles.find(p => p.userId === userId && p.reportTypeId === reportTypeId) || null;
  }

  /**
   * Delete a profile
   */
  deleteProfile(userId: string, reportTypeId: string): boolean {
    const index = this.profiles.findIndex(p => p.userId === userId && p.reportTypeId === reportTypeId);
    if (index >= 0) {
      this.profiles.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Get event emitter for listening to events
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter as unknown as EventEmitter;
  }
}