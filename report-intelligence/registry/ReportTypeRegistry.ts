/**
 * Report Type Registry - Phase 1
 * Report Type Registry Class
 * 
 * Central authoritative system for managing report type definitions.
 */

import type { ReportTypeDefinition } from './ReportTypeDefinition';

export type RegistryEvent = 
  | 'type_registered' 
  | 'type_updated' 
  | 'type_deprecated'
  | 'registry_loaded'
  | 'registry_saved';

export type EventListener = (event: RegistryEvent, data: any) => void;

export class ReportTypeRegistry {
  private registry: Map<string, ReportTypeDefinition> = new Map();
  private eventListeners: Map<RegistryEvent, Set<EventListener>> = new Map();
  private storagePath: string = 'workspace/report-registry.json';

  constructor() {
    this.initializeEventSystem();
  }

  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const events: RegistryEvent[] = [
      'type_registered',
      'type_updated',
      'type_deprecated',
      'registry_loaded',
      'registry_saved'
    ];
    
    for (const event of events) {
      this.eventListeners.set(event, new Set());
    }
  }

  /**
   * Register a new report type
   */
  registerType(definition: ReportTypeDefinition): void {
    // Validate the definition
    this.validateDefinition(definition);
    
    // Check if already exists
    if (this.registry.has(definition.id)) {
      throw new Error(`Report type with ID "${definition.id}" already exists`);
    }
    
    // Set timestamps
    const now = new Date();
    definition.createdAt = now;
    definition.updatedAt = now;
    
    // Add to registry
    this.registry.set(definition.id, definition);
    
    // Emit event
    this.emitEvent('type_registered', {
      typeId: definition.id,
      definition
    });
    
    console.log(`Registered report type: ${definition.name} (${definition.id})`);
  }

  /**
   * Get a report type by ID
   */
  getType(id: string): ReportTypeDefinition | undefined {
    return this.registry.get(id);
  }

  /**
   * Get all report types
   */
  getAllTypes(): ReportTypeDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get report types by category
   */
  getTypesByCategory(category: string): ReportTypeDefinition[] {
    return this.getAllTypes().filter(type => type.category === category);
  }

  /**
   * Get active (non-deprecated) report types
   */
  getActiveTypes(): ReportTypeDefinition[] {
    return this.getAllTypes().filter(type => !type.deprecated);
  }

  /**
   * Update an existing report type
   */
  updateType(definition: ReportTypeDefinition): void {
    // Validate the definition
    this.validateDefinition(definition);
    
    // Check if exists
    const existing = this.registry.get(definition.id);
    if (!existing) {
      throw new Error(`Report type with ID "${definition.id}" not found`);
    }
    
    // Update timestamps
    definition.updatedAt = new Date();
    definition.createdAt = existing.createdAt; // Preserve original creation date
    
    // Update in registry
    this.registry.set(definition.id, definition);
    
    // Emit event
    this.emitEvent('type_updated', {
      typeId: definition.id,
      previousVersion: existing,
      newVersion: definition
    });
    
    console.log(`Updated report type: ${definition.name} (${definition.id})`);
  }

  /**
   * Deprecate a report type
   */
  deprecateType(id: string, reason?: string): void {
    const definition = this.registry.get(id);
    if (!definition) {
      throw new Error(`Report type with ID "${id}" not found`);
    }
    
    // Mark as deprecated
    definition.deprecated = true;
    definition.deprecatedReason = reason;
    definition.updatedAt = new Date();
    
    // Update in registry
    this.registry.set(id, definition);
    
    // Emit event
    this.emitEvent('type_deprecated', {
      typeId: id,
      reason,
      definition
    });
    
    console.log(`Deprecated report type: ${definition.name} (${id}) - ${reason || 'No reason provided'}`);
  }

  /**
   * Validate a report structure against a report type
   */
  validateStructure(reportTypeId: string, structure: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    missingSections: string[];
  } {
    const definition = this.getType(reportTypeId);
    if (!definition) {
      throw new Error(`Report type with ID "${reportTypeId}" not found`);
    }
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingSections: string[] = [];
    
    // Check required sections
    for (const section of definition.requiredSections) {
      if (!structure.sections || !structure.sections[section.id]) {
        errors.push(`Missing required section: ${section.name} (${section.id})`);
        missingSections.push(section.id);
      }
    }
    
    // Check conditional sections
    for (const section of definition.conditionalSections) {
      if (section.conditionalLogic) {
        const { dependsOn, condition, value } = section.conditionalLogic;
        const dependentSection = structure.sections?.[dependsOn];
        
        let shouldBePresent = false;
        switch (condition) {
          case 'present':
            shouldBePresent = !!dependentSection;
            break;
          case 'absent':
            shouldBePresent = !dependentSection;
            break;
          case 'value':
            shouldBePresent = dependentSection?.value === value;
            break;
          case 'contains':
            shouldBePresent = dependentSection?.content?.includes?.(value) || false;
            break;
        }
        
        if (shouldBePresent && !structure.sections?.[section.id]) {
          warnings.push(`Missing conditional section: ${section.name} (${section.id})`);
        }
      }
    }
    
    // Validate compliance rules
    for (const rule of definition.complianceRules) {
      if (rule.severity === 'critical') {
        // For now, just log that validation would happen
        // In Phase 9, this will be implemented with actual validation logic
        console.log(`Compliance validation needed for rule: ${rule.name}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      missingSections
    };
  }

  /**
   * Get compliance rules for a report type
   */
  getComplianceRules(reportTypeId: string) {
    const definition = this.getType(reportTypeId);
    if (!definition) {
      throw new Error(`Report type with ID "${reportTypeId}" not found`);
    }
    
    return definition.complianceRules;
  }

  /**
   * Get AI guidance for a report type
   */
  getAIGuidance(reportTypeId: string) {
    const definition = this.getType(reportTypeId);
    if (!definition) {
      throw new Error(`Report type with ID "${reportTypeId}" not found`);
    }
    
    return definition.aiGuidance;
  }

  /**
   * Search for report types by tags
   */
  searchByTags(tags: string[]): ReportTypeDefinition[] {
    return this.getAllTypes().filter(type => 
      tags.some(tag => type.tags.includes(tag))
    );
  }

  /**
   * Get report types that support a specific format
   */
  getTypesByFormat(format: string): ReportTypeDefinition[] {
    return this.getAllTypes().filter(type => 
      type.supportedFormats.includes(format as any)
    );
  }

  /**
   * Validate a report type definition
   */
  private validateDefinition(definition: ReportTypeDefinition): void {
    const errors: string[] = [];
    
    // Check required fields
    if (!definition.id) errors.push('Missing required field: id');
    if (!definition.name) errors.push('Missing required field: name');
    if (!definition.description) errors.push('Missing required field: description');
    if (!definition.category) errors.push('Missing required field: category');
    if (!definition.version) errors.push('Missing required field: version');
    
    // Check section IDs are unique within the definition
    const allSectionIds = [
      ...definition.requiredSections,
      ...definition.optionalSections,
      ...definition.conditionalSections
    ].map(s => s.id);
    
    const duplicateSectionIds = allSectionIds.filter((id, index) => 
      allSectionIds.indexOf(id) !== index
    );
    
    if (duplicateSectionIds.length > 0) {
      errors.push(`Duplicate section IDs: ${duplicateSectionIds.join(', ')}`);
    }
    
    // Check compliance rules have required fields
    for (const rule of definition.complianceRules) {
      if (!rule.id) errors.push('Compliance rule missing id');
      if (!rule.name) errors.push('Compliance rule missing name');
      if (!rule.standard) errors.push('Compliance rule missing standard');
    }
    
    if (errors.length > 0) {
      throw new Error(`Invalid report type definition: ${errors.join('; ')}`);
    }
  }

  /**
   * Event system methods
   */
  on(event: RegistryEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  off(event: RegistryEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emitEvent(event: RegistryEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Storage methods
   */
  async saveToStorage(): Promise<void> {
    try {
      const data = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        types: this.getAllTypes()
      };
      
      // In a real implementation, this would write to the filesystem
      // For now, we'll log and simulate the storage
      console.log(`Saving registry to ${this.storagePath} with ${this.registry.size} types`);
      
      // Emit event
      this.emitEvent('registry_saved', {
        path: this.storagePath,
        typeCount: this.registry.size
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save registry:', error);
      throw error;
    }
  }

  async loadFromStorage(): Promise<void> {
    try {
      // In a real implementation, this would read from the filesystem
      // For now, we'll simulate loading
      console.log(`Loading registry from ${this.storagePath}`);
      
      // Clear current registry
      this.registry.clear();
      
      // Emit event
      this.emitEvent('registry_loaded', {
        path: this.storagePath,
        typeCount: this.registry.size
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to load registry:', error);
      throw error;
    }
  }

  /**
   * Export registry to JSON
   */
  exportToJSON(): string {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      typeCount: this.registry.size,
      types: this.getAllTypes()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import registry from JSON
   */
  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      
      if (!data.types || !Array.isArray(data.types)) {
        throw new Error('Invalid registry JSON: missing types array');
      }
      
      // Clear current registry
      this.registry.clear();
      
      // Register each type
      for (const typeDef of data.types) {
        try {
          // Convert string dates back to Date objects
          if (typeof typeDef.createdAt === 'string') {
            typeDef.createdAt = new Date(typeDef.createdAt);
          }
          if (typeof typeDef.updatedAt === 'string') {
            typeDef.updatedAt = new Date(typeDef.updatedAt);
          }
          
          this.registerType(typeDef);
        } catch (error) {
          console.warn(`Failed to import type ${typeDef.id}:`, error);
        }
      }
      
      console.log(`Imported ${data.types.length} report types from JSON`);
    } catch (error) {
      throw new Error(`Failed to import registry from JSON: ${error}`);
    }
  }
}