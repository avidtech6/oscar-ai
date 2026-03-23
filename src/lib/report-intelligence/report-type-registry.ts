/**
 * Report Type Registry for Oscar AI Phase Compliance Package
 *
 * This file implements the ReportTypeRegistry class that manages all report type definitions.
 * It implements Phase 1: Report Type Registry from the Report Intelligence System.
 *
 * File: src/lib/report-intelligence/report-type-registry.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import type { ReportTypeDefinition } from './report-type-definitions.js';
import { BUILTIN_REPORT_TYPES } from './report-type-definitions.js';

/**
 * Registry class for managing report type definitions
 */
export class ReportTypeRegistry {
  private static instance: ReportTypeRegistry;
  private reportTypes: Map<string, ReportTypeDefinition> = new Map();
  private customReportTypes: Map<string, ReportTypeDefinition> = new Map();

  /**
   * Private constructor to implement singleton pattern
   */
  private constructor() {
    this.initializeBuiltInTypes();
  }

  /**
   * Get the singleton instance of the registry
   */
  public static getInstance(): ReportTypeRegistry {
    if (!ReportTypeRegistry.instance) {
      ReportTypeRegistry.instance = new ReportTypeRegistry();
    }
    return ReportTypeRegistry.instance;
  }

  /**
   * Initialize built-in report types
   */
  private initializeBuiltInTypes(): void {
    BUILTIN_REPORT_TYPES.forEach(reportType => {
      this.registerReportType(reportType);
    });
  }

  /**
   * Register a report type in the registry
   * @param reportType - The report type definition to register
   * @param force - Whether to overwrite existing report type
   */
  public registerReportType(
    reportType: ReportTypeDefinition, 
    force: boolean = false
  ): boolean {
    if (this.reportTypes.has(reportType.id) && !force) {
      console.warn(`Report type with ID "${reportType.id}" already exists`);
      return false;
    }

    // Validate the report type definition
    if (!this.validateReportType(reportType)) {
      console.error(`Invalid report type definition for ID "${reportType.id}"`);
      return false;
    }

    // Add to appropriate registry
    if (reportType.id.startsWith('bs') || reportType.id.startsWith('arboricultural')) {
      this.reportTypes.set(reportType.id, reportType);
    } else {
      this.customReportTypes.set(reportType.id, reportType);
    }

    return true;
  }

  /**
   * Unregister a report type from the registry
   * @param typeId - The ID of the report type to unregister
   */
  public unregisterReportType(typeId: string): boolean {
    const removedFromBuiltIn = this.reportTypes.delete(typeId);
    const removedFromCustom = this.customReportTypes.delete(typeId);
    
    return removedFromBuiltIn || removedFromCustom;
  }

  /**
   * Get a report type by ID
   * @param typeId - The ID of the report type to retrieve
   */
  public getReportType(typeId: string): ReportTypeDefinition | undefined {
    return this.reportTypes.get(typeId) || this.customReportTypes.get(typeId);
  }

  /**
   * Get all report types
   */
  public getAllReportTypes(): ReportTypeDefinition[] {
    return [
      ...Array.from(this.reportTypes.values()),
      ...Array.from(this.customReportTypes.values())
    ];
  }

  /**
   * Get all built-in report types
   */
  public getBuiltInReportTypes(): ReportTypeDefinition[] {
    return Array.from(this.reportTypes.values());
  }

  /**
   * Get all custom report types
   */
  public getCustomReportTypes(): ReportTypeDefinition[] {
    return Array.from(this.customReportTypes.values());
  }

  /**
   * Find report types by category
   * @param category - The category to search for
   */
  public findByCategory(category: string): ReportTypeDefinition[] {
    return this.getAllReportTypes().filter(type => 
      type.metadata.category === category
    );
  }

  /**
   * Find report types by subcategory
   * @param subcategory - The subcategory to search for
   */
  public findBySubcategory(subcategory: string): ReportTypeDefinition[] {
    return this.getAllReportTypes().filter(type => 
      type.metadata.subcategory === subcategory
    );
  }

  /**
   * Find report types by tag
   * @param tag - The tag to search for
   */
  public findByTag(tag: string): ReportTypeDefinition[] {
    return this.getAllReportTypes().filter(type => 
      type.metadata.tags.includes(tag)
    );
  }

  /**
   * Find report types by complexity
   * @param complexity - The complexity level to search for
   */
  public findByComplexity(complexity: 'low' | 'medium' | 'high'): ReportTypeDefinition[] {
    return this.getAllReportTypes().filter(type => 
      type.metadata.complexity === complexity
    );
  }

  /**
   * Search report types by name or description
   * @param query - The search query
   */
  public search(query: string): ReportTypeDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllReportTypes().filter(type => 
      type.name.toLowerCase().includes(lowerQuery) ||
      type.description.toLowerCase().includes(lowerQuery) ||
      type.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get report types by estimated duration range
   * @param minDuration - Minimum duration in minutes
   * @param maxDuration - Maximum duration in minutes
   */
  public findByDurationRange(minDuration: number, maxDuration: number): ReportTypeDefinition[] {
    return this.getAllReportTypes().filter(type => {
      const duration = type.metadata.estimatedDuration || 0;
      return duration >= minDuration && duration <= maxDuration;
    });
  }

  /**
   * Validate a report type definition
   * @param reportType - The report type definition to validate
   */
  private validateReportType(reportType: ReportTypeDefinition): boolean {
    // Check required fields
    if (!reportType.id || !reportType.name || !reportType.description) {
      return false;
    }

    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(reportType.id)) {
      return false;
    }

    // Validate sections
    const allSections = [
      ...reportType.requiredSections,
      ...reportType.optionalSections
    ];

    const sectionIds = new Set<string>();
    for (const section of allSections) {
      if (!section.id || !section.name) {
        return false;
      }
      
      if (sectionIds.has(section.id)) {
        return false;
      }
      sectionIds.add(section.id);

      // Validate subsections
      if (section.subsections) {
        const subsectionIds = new Set<string>();
        for (const subsection of section.subsections) {
          if (!subsection.id || !subsection.name) {
            return false;
          }
          
          if (subsectionIds.has(subsection.id)) {
            return false;
          }
          subsectionIds.add(subsection.id);
        }
      }
    }

    // Validate required fields
    const fieldIds = new Set<string>();
    for (const field of reportType.requiredFields) {
      if (!field.id || !field.name) {
        return false;
      }
      
      if (fieldIds.has(field.id)) {
        return false;
      }
      fieldIds.add(field.id);

      // Validate field type
      const validTypes = ['string', 'number', 'date', 'boolean', 'select', 'multiselect'];
      if (!validTypes.includes(field.type)) {
        return false;
      }

      // Validate select fields have options
      if ((field.type === 'select' || field.type === 'multiselect') && 
          (!field.options || field.options.length === 0)) {
        return false;
      }
    }

    // Validate validation rules
    const validationIds = new Set<string>();
    for (const rule of reportType.validationRules) {
      if (!rule.id || !rule.description || !rule.validator) {
        return false;
      }
      
      if (validationIds.has(rule.id)) {
        return false;
      }
      validationIds.add(rule.id);

      // Validate severity
      const validSeverities = ['error', 'warning', 'info'];
      if (!validSeverities.includes(rule.severity)) {
        return false;
      }

      // Validate validator type
      const validTypes = ['structure', 'content', 'format', 'completeness', 'consistency'];
      if (!validTypes.includes(rule.type)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get statistics about the registry
   */
  public getStatistics(): {
    totalReportTypes: number;
    builtInReportTypes: number;
    customReportTypes: number;
    categories: string[];
    tags: string[];
    complexityDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  } {
    const allTypes = this.getAllReportTypes();
    
    const categories = new Set<string>();
    const tags = new Set<string>();
    const complexityDistribution = { low: 0, medium: 0, high: 0 };

    allTypes.forEach(type => {
      categories.add(type.metadata.category);
      type.metadata.tags.forEach(tag => tags.add(tag));
      complexityDistribution[type.metadata.complexity]++;
    });

    return {
      totalReportTypes: allTypes.length,
      builtInReportTypes: this.reportTypes.size,
      customReportTypes: this.customReportTypes.size,
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort(),
      complexityDistribution
    };
  }

  /**
   * Export all report types to JSON
   */
  public exportToJSON(): string {
    return JSON.stringify({
      builtInReportTypes: Array.from(this.reportTypes.values()),
      customReportTypes: Array.from(this.customReportTypes.values()),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  /**
   * Import report types from JSON
   * @param json - JSON string containing report types
   */
  public importFromJSON(json: string): boolean {
    try {
      const data = JSON.parse(json);
      
      if (data.customReportTypes) {
        data.customReportTypes.forEach((reportType: ReportTypeDefinition) => {
          this.registerReportType(reportType, true);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import report types from JSON:', error);
      return false;
    }
  }

  /**
   * Check if a report type exists
   * @param typeId - The ID of the report type to check
   */
  public hasReportType(typeId: string): boolean {
    return this.reportTypes.has(typeId) || this.customReportTypes.has(typeId);
  }

  /**
   * Clear all custom report types
   */
  public clearCustomReportTypes(): void {
    this.customReportTypes.clear();
  }

  /**
   * Get recommended report types based on tags
   * @param tags - Array of tags to match against
   */
  public getRecommendations(tags: string[]): ReportTypeDefinition[] {
    const scoredTypes = this.getAllReportTypes().map(type => {
      const matchingTags = type.metadata.tags.filter(tag => tags.includes(tag));
      return {
        reportType: type,
        score: matchingTags.length
      };
    });

    return scoredTypes
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.reportType);
  }
}

/**
 * Global instance for easy access
 */
export const reportTypeRegistry = ReportTypeRegistry.getInstance();

/**
 * Helper function to register a new report type
 */
export function registerReportType(
  reportType: ReportTypeDefinition, 
  force: boolean = false
): boolean {
  return reportTypeRegistry.registerReportType(reportType, force);
}

/**
 * Helper function to get a report type by ID
 */
export function getReportType(typeId: string): ReportTypeDefinition | undefined {
  return reportTypeRegistry.getReportType(typeId);
}

/**
 * Helper function to search report types
 */
export function searchReportTypes(query: string): ReportTypeDefinition[] {
  return reportTypeRegistry.search(query);
}

/**
 * Helper function to get all report types
 */
export function getAllReportTypes(): ReportTypeDefinition[] {
  return reportTypeRegistry.getAllReportTypes();
}