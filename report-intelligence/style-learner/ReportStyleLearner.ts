/**
 * Report Style Learner - Phase 5
 * ReportStyleLearner Class
 * 
 * Main engine responsible for learning user writing styles from decompiled reports,
 * extracting stylistic patterns, and applying learned styles to new reports.
 */

import type { DecompiledReport } from '../decompiler/DecompiledReport';
import type { ReportTypeDefinition } from '../registry/ReportTypeDefinition';
import type { ReportTypeRegistry } from '../registry/ReportTypeRegistry';
import type { StyleProfile, StyleApplicationResult } from './StyleProfile';
import {
  createStyleProfile,
  generateStyleProfileId,
  validateStyleProfile,
  mergeStyleProfiles
} from './StyleProfile';

/**
 * Event types emitted by the ReportStyleLearner
 */
export type StyleLearnerEvent = 
  | 'styleLearner:analysisStarted'
  | 'styleLearner:analysisComplete'
  | 'styleLearner:profileCreated'
  | 'styleLearner:profileUpdated'
  | 'styleLearner:applied'
  | 'styleLearner:completed'
  | 'styleLearner:error';

/**
 * Event data structure
 */
export interface StyleLearnerEventData {
  event: StyleLearnerEvent;
  data: any;
  timestamp: Date;
}

/**
 * Style learner configuration
 */
export interface StyleLearnerConfig {
  autoCreateProfiles: boolean;
  autoUpdateProfiles: boolean;
  minSamplesForConfidence: number;
  confidenceThreshold: number; // 0-1
  evolutionWeight: number; // 0-1 weight for new samples vs old
  maxProfilesPerUser: number;
  storagePath: string;
}

/**
 * Report Style Learner Class
 */
export class ReportStyleLearner {
  // Dependencies
  private registry?: ReportTypeRegistry;
  
  // Configuration
  private config: StyleLearnerConfig;
  
  // State
  private eventListeners: Map<StyleLearnerEvent, Function[]> = new Map();
  private isProcessing: boolean = false;
  private profiles: Map<string, StyleProfile> = new Map(); // In-memory cache
  
  // Statistics
  private totalAnalyses: number = 0;
  private totalProfilesCreated: number = 0;
  private totalProfilesUpdated: number = 0;
  private totalApplications: number = 0;
  
  /**
   * Constructor
   */
  constructor(
    registry?: ReportTypeRegistry,
    config: Partial<StyleLearnerConfig> = {}
  ) {
    this.registry = registry;
    
    // Default configuration
    this.config = {
      autoCreateProfiles: true,
      autoUpdateProfiles: true,
      minSamplesForConfidence: 3,
      confidenceThreshold: 0.6,
      evolutionWeight: 0.3, // 30% weight to new samples
      maxProfilesPerUser: 10,
      storagePath: 'workspace/style-profiles.json',
      ...config
    };
  }
  
  /**
   * Analyze a decompiled report and extract style patterns
   */
  public async analyse(decompiledReport: DecompiledReport): Promise<StyleProfile | null> {
    this.emit('styleLearner:analysisStarted', { reportId: decompiledReport.id });
    
    try {
      this.isProcessing = true;
      const startTime = Date.now();
      
      // Extract style components
      const tone = await this.extractTone(decompiledReport);
      const sentencePatterns = await this.extractSentencePatterns(decompiledReport);
      const paragraphPatterns = await this.extractParagraphPatterns(decompiledReport);
      const sectionOrdering = await this.extractSectionOrdering(decompiledReport);
      const preferredPhrasing = await this.extractPreferredPhrasing(decompiledReport);
      const formattingPreferences = await this.extractFormattingPreferences(decompiledReport);
      const terminologyPreferences = await this.extractTerminologyPreferences(decompiledReport);
      const structuralPreferences = await this.extractStructuralPreferences(decompiledReport);
      
      // Calculate confidence based on sample quality
      const confidence = this.calculateConfidence(
        decompiledReport,
        tone,
        sentencePatterns,
        paragraphPatterns
      );
      
      // Create or update profile
      const userId = decompiledReport.metadata?.author || 'unknown';
      const reportTypeId = decompiledReport.detectedReportType;
      
      let profile: StyleProfile | null = null;
      
      if (this.config.autoCreateProfiles) {
        profile = await this.buildStyleProfile(
          userId,
          reportTypeId,
          {
            tone,
            sentencePatterns,
            paragraphPatterns,
            sectionOrdering,
            preferredPhrasing,
            formattingPreferences,
            terminologyPreferences,
            structuralPreferences
          },
          confidence,
          decompiledReport
        );
      }
      
      const processingTime = Date.now() - startTime;
      
      this.emit('styleLearner:analysisComplete', {
        reportId: decompiledReport.id,
        userId,
        reportTypeId,
        confidence,
        processingTimeMs: processingTime,
        profileCreated: !!profile
      });
      
      this.totalAnalyses++;
      
      return profile;
      
    } catch (error) {
      this.emit('styleLearner:error', {
        error: error instanceof Error ? error.message : String(error),
        reportId: decompiledReport.id
      });
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Build a style profile from extracted components
   */
  public async buildStyleProfile(
    userId: string,
    reportTypeId: string | undefined,
    components: {
      tone: any;
      sentencePatterns: any[];
      paragraphPatterns: any[];
      sectionOrdering: any[];
      preferredPhrasing: any[];
      formattingPreferences: any;
      terminologyPreferences: any;
      structuralPreferences: any;
    },
    confidence: number,
    sourceReport?: DecompiledReport
  ): Promise<StyleProfile> {
    try {
      // Check for existing profile
      const existingProfile = await this.findProfile(userId, reportTypeId);
      const now = new Date();
      
      let profile: StyleProfile;
      
      if (existingProfile && this.config.autoUpdateProfiles) {
        // Update existing profile
        const baseProfile = createStyleProfile(userId, reportTypeId);
        
        profile = {
          ...baseProfile,
          id: existingProfile.id,
          userId,
          reportTypeId,
          profileName: reportTypeId 
            ? `Style for ${reportTypeId} (v${existingProfile.version})`
            : `General style for user ${userId} (v${existingProfile.version})`,
          tone: components.tone,
          sentencePatterns: components.sentencePatterns,
          paragraphPatterns: components.paragraphPatterns,
          sectionOrdering: components.sectionOrdering,
          preferredPhrasing: components.preferredPhrasing,
          formattingPreferences: components.formattingPreferences,
          terminologyPreferences: components.terminologyPreferences,
          structuralPreferences: components.structuralPreferences,
          confidence,
          sampleCount: existingProfile.sampleCount + 1,
          lastUpdated: now,
          createdAt: existingProfile.createdAt,
          version: this.incrementVersion(existingProfile.version),
          previousVersionId: existingProfile.id,
          evolutionNotes: [
            ...(existingProfile.evolutionNotes || []),
            `Updated from report ${sourceReport?.id || 'unknown'} at ${now.toISOString()}`
          ],
          applicationCount: existingProfile.applicationCount,
          successRate: existingProfile.successRate
        };
        
        // Merge with existing profile if we have evolution weight
        if (this.config.evolutionWeight > 0) {
          profile = mergeStyleProfiles(existingProfile, profile, this.config.evolutionWeight);
        }
        
        this.emit('styleLearner:profileUpdated', {
          profileId: profile.id,
          userId,
          reportTypeId,
          previousVersion: existingProfile.version,
          newVersion: profile.version
        });
        
        this.totalProfilesUpdated++;
        
      } else {
        // Create new profile
        const baseProfile = createStyleProfile(userId, reportTypeId);
        
        profile = {
          ...baseProfile,
          id: generateStyleProfileId(),
          userId,
          reportTypeId,
          profileName: reportTypeId 
            ? `Style for ${reportTypeId}`
            : `General style for user ${userId}`,
          tone: components.tone,
          sentencePatterns: components.sentencePatterns,
          paragraphPatterns: components.paragraphPatterns,
          sectionOrdering: components.sectionOrdering,
          preferredPhrasing: components.preferredPhrasing,
          formattingPreferences: components.formattingPreferences,
          terminologyPreferences: components.terminologyPreferences,
          structuralPreferences: components.structuralPreferences,
          confidence,
          sampleCount: 1,
          lastUpdated: now,
          createdAt: now,
          version: '1.0.0',
          evolutionNotes: [
            `Created from report ${sourceReport?.id || 'unknown'} at ${now.toISOString()}`
          ]
        };
        
        this.emit('styleLearner:profileCreated', {
          profileId: profile.id,
          userId,
          reportTypeId,
          confidence
        });
        
        this.totalProfilesCreated++;
      }
      
      // Validate profile
      const validation = validateStyleProfile(profile);
      if (!validation.isValid) {
        throw new Error(`Invalid style profile: ${validation.errors.join(', ')}`);
      }
      
      // Store profile
      await this.storeProfile(profile);
      
      // Update in-memory cache
      this.profiles.set(profile.id, profile);
      
      // Enforce max profiles per user
      await this.enforceMaxProfilesPerUser(userId);
      
      return profile;
      
    } catch (error) {
      this.emit('styleLearner:error', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        reportTypeId
      });
      throw error;
    }
  }
  
  /**
   * Apply a style profile to a report
   */
  public async applyStyleProfile(
    profileId: string,
    reportContent: any
  ): Promise<StyleApplicationResult> {
    this.emit('styleLearner:applied', { profileId });
    
    const startTime = Date.now();
    const result: StyleApplicationResult = {
      success: false,
      appliedProfileId: profileId,
      changes: [],
      warnings: [],
      errors: [],
      processingTimeMs: 0
    };
    
    try {
      // Load profile
      const profile = await this.getStyleProfile(profileId);
      if (!profile) {
        result.errors.push(`Profile ${profileId} not found`);
        return result;
      }
      
      // Apply tone adjustments
      if (profile.tone.confidence >= this.config.confidenceThreshold) {
        result.changes.push({
          type: 'tone',
          description: `Applied ${profile.tone.primaryTone} tone`,
          confidence: profile.tone.confidence
        });
      }
      
      // Apply phrasing adjustments
      if (profile.preferredPhrasing.length > 0) {
        const phrasingConfidence = profile.preferredPhrasing
          .reduce((sum, p) => sum + p.confidence, 0) / profile.preferredPhrasing.length;
        
        if (phrasingConfidence >= this.config.confidenceThreshold) {
          result.changes.push({
            type: 'phrasing',
            description: `Applied ${profile.preferredPhrasing.length} preferred phrasings`,
            confidence: phrasingConfidence
          });
        }
      }
      
      // Apply structural adjustments
      if (profile.structuralPreferences.sectionTemplates.length > 0) {
        result.changes.push({
          type: 'structure',
          description: 'Applied structural preferences',
          confidence: profile.confidence
        });
      }
      
      // Apply formatting adjustments
      result.changes.push({
        type: 'formatting',
        description: 'Applied formatting preferences',
        confidence: 0.8 // Formatting is usually high confidence
      });
      
      // Apply terminology adjustments
      if (profile.terminologyPreferences.preferredTerms.length > 0) {
        const terminologyConfidence = profile.terminologyPreferences.preferredTerms
          .reduce((sum, t) => sum + t.confidence, 0) / profile.terminologyPreferences.preferredTerms.length;
        
        if (terminologyConfidence >= this.config.confidenceThreshold) {
          result.changes.push({
            type: 'terminology',
            description: `Applied ${profile.terminologyPreferences.preferredTerms.length} terminology preferences`,
            confidence: terminologyConfidence
          });
        }
      }
      
      result.success = result.errors.length === 0;
      result.processingTimeMs = Date.now() - startTime;
      
      // Update profile statistics
      if (result.success) {
        profile.applicationCount++;
        // For simplicity, assume 100% success rate when no errors
        // In real implementation, would track actual success
        profile.successRate = (profile.successRate * (profile.applicationCount - 1) + 1) / profile.applicationCount;
        await this.storeProfile(profile);
      }
      
      this.emit('styleLearner:completed', { result });
      this.totalApplications++;
      
      return result;
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      result.processingTimeMs = Date.now() - startTime;
      
      this.emit('styleLearner:error', {
        error: error instanceof Error ? error.message : String(error),
        profileId
      });
      
      return result;
    }
  }
  
  /**
   * Get a style profile by ID
   */
  public async getStyleProfile(profileId: string): Promise<StyleProfile | null> {
    // Check in-memory cache first
    if (this.profiles.has(profileId)) {
      return this.profiles.get(profileId)!;
    }
    
    // Load from storage
    const profile = await this.loadProfile(profileId);
    if (profile) {
      this.profiles.set(profileId, profile);
    }
    
    return profile;
  }
  
  /**
   * Find profile for user and report type
   */
  public async findProfile(userId: string, reportTypeId?: string): Promise<StyleProfile | null> {
    // In a real implementation, would query storage
    // For now, return first matching profile from cache
    const profiles = Array.from(this.profiles.values());
    for (const profile of profiles) {
      if (profile.userId === userId && profile.reportTypeId === reportTypeId) {
        return profile;
      }
    }
    
    return null;
  }
  
  /**
   * Get all profiles for a user
   */
  public async getUserProfiles(userId: string): Promise<StyleProfile[]> {
    const profiles: StyleProfile[] = [];
    const allProfiles = Array.from(this.profiles.values());
    
    for (const profile of allProfiles) {
      if (profile.userId === userId) {
        profiles.push(profile);
      }
    }
    
    // Sort by confidence (highest first)
    profiles.sort((a, b) => b.confidence - a.confidence);
    
    return profiles;
  }
  
  /**
   * Style extraction methods (to be implemented in extractors/)
   */
  private async extractTone(decompiledReport: DecompiledReport): Promise<any> {
    // This would call the actual extractor
    // For now, return mock data
    return {
      primaryTone: 'professional',
      secondaryTones: ['technical', 'concise'],
      confidence: 0.8,
      characteristics: {
        sentenceLength: 'medium',
        vocabularyComplexity: 'moderate',
        formalityLevel: 'high',
        passiveVoiceUsage: 'medium',
        firstPersonUsage: 'low'
      },
      examples: []
    };
  }
  
  private async extractSentencePatterns(decompiledReport: DecompiledReport): Promise<any[]> {
    return [];
  }
  
  private async extractParagraphPatterns(decompiledReport: DecompiledReport): Promise<any[]> {
    return [];
  }
  
  private async extractSectionOrdering(decompiledReport: DecompiledReport): Promise<any[]> {
    return [];
  }
  
  private async extractPreferredPhrasing(decompiledReport: DecompiledReport): Promise<any[]> {
    return [];
  }
  
  private async extractFormattingPreferences(decompiledReport: DecompiledReport): Promise<any> {
    return {
      headings: {
        style: 'title-case',
        numbering: 'none',
        hierarchy: 'consistent'
      },
      lists: {
        bulletStyle: 'dash',
        indentation: 2,
        spacing: 'normal'
      },
      emphasis: {
        boldUsage: 'medium',
        italicUsage: 'medium',
        underlineUsage: 'low'
      },
      spacing: {
        lineSpacing: 'single',
        paragraphSpacing: 'normal',
        sectionSpacing: 'normal'
      }
    };
  }
  
  private async extractTerminologyPreferences(decompiledReport: DecompiledReport): Promise<any> {
    return {
      preferredTerms: [],
      avoidedTerms: [],
      domainSpecificTerms: [],
      acronymUsage: 'medium',
      abbreviationStyle: 'context-dependent'
    };
  }
  
  private async extractStructuralPreferences(decompiledReport: DecompiledReport): Promise<any> {
    return {
      sectionTemplates: [],
      reportFlow: 'linear',
      conclusionPlacement: 'end-only',
      recommendationStyle: 'separate-section'
    };
  }
  
  /**
   * Calculate confidence in extracted style
   */
  private calculateConfidence(
    decompiledReport: DecompiledReport,
    tone: any,
    sentencePatterns: any[],
    paragraphPatterns: any[]
  ): number {
    let confidence = 0;
    let factors = 0;
    
    // Factor 1: Report completeness
    if (decompiledReport.sections && decompiledReport.sections.length > 0) {
      const completeness = Math.min(decompiledReport.sections.length / 10, 1);
      confidence += completeness * 0.3;
      factors += 0.3;
    }
    
    // Factor 2: Tone confidence
    if (tone.confidence) {
      confidence += tone.confidence * 0.3;
      factors += 0.3;
    }
    
    // Factor 3: Pattern detection
    const patternCount = sentencePatterns.length + paragraphPatterns.length;
    const patternFactor = Math.min(patternCount / 20, 1) * 0.4;
    confidence += patternFactor;
    factors += 0.4;
    
    // Normalize
    return factors > 0 ? confidence / factors : 0;
  }
  
  /**
   * Event emitter methods
   */
  public on(event: StyleLearnerEvent, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  public off(event: StyleLearnerEvent, listener: Function): void {
    if (!this.eventListeners.has(event)) return;
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  private emit(event: StyleLearnerEvent, data: any): void {
    if (!this.eventListeners.has(event)) return;
    const eventData: StyleLearnerEventData = {
      event,
      data,
      timestamp: new Date()
    };
    this.eventListeners.get(event)!.forEach(listener => {
      try {
        listener(eventData);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  /**
   * Storage methods (simplified - would be implemented with proper storage)
   */
  private async storeProfile(profile: StyleProfile): Promise<void> {
    // In a real implementation, would save to file or database
    // For now, just update in-memory cache
    this.profiles.set(profile.id, profile);
    console.log(`Profile ${profile.id} stored (in-memory)`);
  }
  
  private async loadProfile(profileId: string): Promise<StyleProfile | null> {
    // In a real implementation, would load from file or database
    // For now, return from in-memory cache
    return this.profiles.get(profileId) || null;
  }
  
  private async enforceMaxProfilesPerUser(userId: string): Promise<void> {
    const userProfiles = await this.getUserProfiles(userId);
    
    if (userProfiles.length > this.config.maxProfilesPerUser) {
      // Sort by confidence (lowest first) and remove excess
      userProfiles.sort((a, b) => a.confidence - b.confidence);
      const profilesToRemove = userProfiles.slice(0, userProfiles.length - this.config.maxProfilesPerUser);
      
      for (const profile of profilesToRemove) {
        this.profiles.delete(profile.id);
        console.log(`Removed profile ${profile.id} to enforce max profiles limit`);
      }
    }
  }
  
  /**
   * Version management
   */
  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.').map(Number);
    parts[2] += 1; // Increment patch version
    return parts.join('.');
  }
  
  /**
   * Get engine statistics
   */
  public getStatistics(): {
    totalAnalyses: number;
    totalProfilesCreated: number;
    totalProfilesUpdated: number;
    totalApplications: number;
    activeProfiles: number;
  } {
    return {
      totalAnalyses: this.totalAnalyses,
      totalProfilesCreated: this.totalProfilesCreated,
      totalProfilesUpdated: this.totalProfilesUpdated,
      totalApplications: this.totalApplications,
      activeProfiles: this.profiles.size
    };
  }
  
  /**
   * Get current configuration
   */
  public getConfig(): StyleLearnerConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<StyleLearnerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Reset engine state
   */
  public reset(): void {
    this.profiles.clear();
    this.totalAnalyses = 0;
    this.totalProfilesCreated = 0;
    this.totalProfilesUpdated = 0;
    this.totalApplications = 0;
    this.isProcessing = false;
  }
}
  
