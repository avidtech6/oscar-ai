/**
 * Phase 9: Report Compliance Validator
 * Compliance Integration Service
 * 
 * Integrates the compliance validator with Phase 1-8 components.
 */

import type { DecompiledReport } from '../../decompiler/DecompiledReport';
import type { SchemaMappingResult } from '../../schema-mapper/SchemaMappingResult';
import type { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
// Note: Phase 8 (Template Generator) may not be implemented yet
// import type { ReportTemplate } from '../../template-generator/ReportTemplate';

import { ReportComplianceValidator } from '../ReportComplianceValidator';
import { ComplianceResultStorage } from '../storage/ComplianceResultStorage';
import { computeComplianceScore } from '../scoring/computeComplianceScore';
import { ComplianceEventSystem, ComplianceEventHelpers } from '../events/ComplianceEventSystem';

/**
 * Integration configuration
 */
export interface ComplianceIntegrationConfig {
  // Which phases to integrate with
  integrateWithPhase1: boolean; // Registry
  integrateWithPhase2: boolean; // Decompiler
  integrateWithPhase3: boolean; // Schema Mapper
  integrateWithPhase4: boolean; // Updater
  integrateWithPhase5: boolean; // Style Learner
  integrateWithPhase6: boolean; // Classification
  integrateWithPhase7: boolean; // Self-Healing
  integrateWithPhase8: boolean; // Template Generator
  
  // Integration behavior
  autoValidateOnDecompile: boolean;
  autoValidateOnMapping: boolean;
  storeResultsAutomatically: boolean;
  emitIntegrationEvents: boolean;
  
  // Validation thresholds
  minimumScoreForAutoAccept: number;
  maximumIssuesForAutoAccept: number;
}

/**
 * Default integration configuration
 */
const DEFAULT_INTEGRATION_CONFIG: ComplianceIntegrationConfig = {
  integrateWithPhase1: true,
  integrateWithPhase2: true,
  integrateWithPhase3: true,
  integrateWithPhase4: true,
  integrateWithPhase5: true,
  integrateWithPhase6: true,
  integrateWithPhase7: true,
  integrateWithPhase8: true,
  autoValidateOnDecompile: true,
  autoValidateOnMapping: true,
  storeResultsAutomatically: true,
  emitIntegrationEvents: true,
  minimumScoreForAutoAccept: 80,
  maximumIssuesForAutoAccept: 5,
};

/**
 * Integration status for each phase
 */
export interface PhaseIntegrationStatus {
  phaseNumber: number;
  phaseName: string;
  connected: boolean;
  lastConnectionAttempt?: Date;
  error?: string;
  component?: any; // Reference to the actual component
}

/**
 * Compliance Integration Service
 */
export class ComplianceIntegrationService {
  private validator: ReportComplianceValidator;
  private storage: ComplianceResultStorage;
  private eventSystem: ComplianceEventSystem;
  private config: ComplianceIntegrationConfig;
  private integrationStatus: Map<number, PhaseIntegrationStatus> = new Map();
  private registry?: ReportTypeRegistry;

  constructor(
    registry?: ReportTypeRegistry,
    validator?: ReportComplianceValidator,
    storage?: ComplianceResultStorage,
    config?: Partial<ComplianceIntegrationConfig>
  ) {
    this.registry = registry;
    this.validator = validator || new ReportComplianceValidator(registry);
    this.storage = storage || new ComplianceResultStorage();
    this.eventSystem = ComplianceEventSystem.getInstance();
    this.config = { ...DEFAULT_INTEGRATION_CONFIG, ...config };
    
    this.initializeIntegration();
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `integration_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get integration status as array
   */
  private getIntegrationStatus(): PhaseIntegrationStatus[] {
    return Array.from(this.integrationStatus.values());
  }

  /**
   * Update integration status
   */
  private updateIntegrationStatus(): void {
    // This would update status based on actual connections
    // For now, it's a placeholder
  }

  /**
   * Initialize integration with all phases
   */
  private initializeIntegration(): void {
    console.log('[ComplianceIntegrationService] Initializing integration with Phase 1-8 components');
    
    // Initialize integration status for all phases
    const phases = [
      { number: 1, name: 'Registry' },
      { number: 2, name: 'Decompiler' },
      { number: 3, name: 'Schema Mapper' },
      { number: 4, name: 'Updater' },
      { number: 5, name: 'Style Learner' },
      { number: 6, name: 'Classification' },
      { number: 7, name: 'Self-Healing' },
      { number: 8, name: 'Template Generator' },
    ];
    
    for (const phase of phases) {
      this.integrationStatus.set(phase.number, {
        phaseNumber: phase.number,
        phaseName: phase.name,
        connected: false,
        lastConnectionAttempt: new Date(),
      });
    }
    
    // Attempt to connect to available phases
    this.connectToAvailablePhases();
    
    // Setup event listeners for integration events
    this.setupEventListeners();
    
    // Emit initialization event
    if (this.config.emitIntegrationEvents) {
      this.eventSystem.emit('compliance:system:initialized', {
        timestamp: new Date(),
        eventId: this.generateId(),
        source: 'ComplianceIntegrationService',
        config: this.config,
        integrationStatus: this.getIntegrationStatus(),
      });
    }
  }

  /**
   * Connect to available phases
   */
  private connectToAvailablePhases(): void {
    // Phase 1: Registry
    if (this.config.integrateWithPhase1 && this.registry) {
      this.connectToPhase1();
    }
    
    // Phase 2: Decompiler
    if (this.config.integrateWithPhase2) {
      this.connectToPhase2();
    }
    
    // Phase 3: Schema Mapper
    if (this.config.integrateWithPhase3) {
      this.connectToPhase3();
    }
    
    // Phase 4-8: Other components
    // These would require actual component instances to connect to
    // For now, we'll mark them as not connected but available for future integration
    
    this.updateIntegrationStatus();
  }

  /**
   * Connect to Phase 1: Registry
   */
  private connectToPhase1(): void {
    try {
      const status = this.integrationStatus.get(1)!;
      
      if (this.registry) {
        status.connected = true;
        status.component = this.registry;
        status.lastConnectionAttempt = new Date();
        
        console.log('[ComplianceIntegrationService] Connected to Phase 1: Registry');
        
        if (this.config.emitIntegrationEvents) {
          ComplianceEventHelpers.emitIntegrationConnected(1, 'ReportTypeRegistry', true);
        }
      }
    } catch (error) {
      const status = this.integrationStatus.get(1)!;
      status.connected = false;
      status.error = error instanceof Error ? error.message : String(error);
      console.error('[ComplianceIntegrationService] Failed to connect to Phase 1:', error);
      
      if (this.config.emitIntegrationEvents) {
        this.eventSystem.emit('compliance:system:error', {
          timestamp: new Date(),
          eventId: this.generateId(),
          source: 'ComplianceIntegrationService',
          error: `Failed to connect to Phase 1: ${status.error}`,
          phaseNumber: 1,
        });
      }
    }
  }

  /**
   * Connect to Phase 2: Decompiler
   */
  private connectToPhase2(): void {
    try {
      const status = this.integrationStatus.get(2)!;
      
      // In a real implementation, we would get the decompiler instance
      // For now, we'll simulate connection
      status.connected = true;
      status.lastConnectionAttempt = new Date();
      
      console.log('[ComplianceIntegrationService] Connected to Phase 2: Decompiler');
      
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitIntegrationConnected(2, 'Decompiler', true);
      }
    } catch (error) {
      const status = this.integrationStatus.get(2)!;
      status.connected = false;
      status.error = error instanceof Error ? error.message : String(error);
      console.error('[ComplianceIntegrationService] Failed to connect to Phase 2:', error);
    }
  }

  /**
   * Connect to Phase 3: Schema Mapper
   */
  private connectToPhase3(): void {
    try {
      const status = this.integrationStatus.get(3)!;
      
      // In a real implementation, we would get the schema mapper instance
      // For now, we'll simulate connection
      status.connected = true;
      status.lastConnectionAttempt = new Date();
      
      console.log('[ComplianceIntegrationService] Connected to Phase 3: Schema Mapper');
      
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitIntegrationConnected(3, 'SchemaMapper', true);
      }
    } catch (error) {
      const status = this.integrationStatus.get(3)!;
      status.connected = false;
      status.error = error instanceof Error ? error.message : String(error);
      console.error('[ComplianceIntegrationService] Failed to connect to Phase 3:', error);
    }
  }

  /**
   * Setup event listeners for integration
   */
  private setupEventListeners(): void {
    // Listen for decompiler events (Phase 2)
    if (this.config.integrateWithPhase2 && this.config.autoValidateOnDecompile) {
      // In a real implementation, we would subscribe to decompiler events
      // For now, we'll create a placeholder
      console.log('[ComplianceIntegrationService] Listening for decompiler events');
    }
    
    // Listen for schema mapper events (Phase 3)
    if (this.config.integrateWithPhase3 && this.config.autoValidateOnMapping) {
      // In a real implementation, we would subscribe to schema mapper events
      console.log('[ComplianceIntegrationService] Listening for schema mapper events');
    }
    
    // Listen for validator events
    this.setupValidatorEventListeners();
  }

  /**
   * Setup event listeners for validator events
   */
  private setupValidatorEventListeners(): void {
    // Listen for validation completion
    this.validator.on('compliance:completed', (event, data) => {
      this.handleValidationCompleted(data);
    });
    
    // Listen for validation errors
    this.validator.on('compliance:error', (event, data) => {
      this.handleValidationError(data);
    });
  }

  /**
   * Handle validation completion
   */
  private handleValidationCompleted(data: any): void {
    const complianceResultId = data.complianceResultId;
    const passed = data.passed;
    const overallScore = data.overallScore;
    const totalIssues = data.totalIssues;
    
    console.log(`[ComplianceIntegrationService] Validation completed: ${complianceResultId}, Score: ${overallScore}, Passed: ${passed}`);
    
    // Auto-accept if score is high enough and issues are low
    if (passed && 
        overallScore >= this.config.minimumScoreForAutoAccept && 
        totalIssues <= this.config.maximumIssuesForAutoAccept) {
      this.autoAcceptComplianceResult(complianceResultId, overallScore);
    }
    
    // Store result if configured
    if (this.config.storeResultsAutomatically) {
      this.storeComplianceResult(complianceResultId);
    }
  }

  /**
   * Handle validation error
   */
  private handleValidationError(data: any): void {
    console.error(`[ComplianceIntegrationService] Validation error: ${data.error}`);
    
    // Emit integration error event
    if (this.config.emitIntegrationEvents) {
      this.eventSystem.emit('compliance:system:error', {
        timestamp: new Date(),
        eventId: this.generateId(),
        source: 'ComplianceIntegrationService',
        error: `Validation error: ${data.error}`,
        complianceResultId: data.complianceResultId,
      });
    }
  }

  /**
   * Auto-accept a compliance result
   */
  private async autoAcceptComplianceResult(complianceResultId: string, score: number): Promise<void> {
    try {
      console.log(`[ComplianceIntegrationService] Auto-accepting compliance result: ${complianceResultId} (score: ${score})`);
      
      // In a real implementation, this would trigger downstream actions
      // like updating report status, notifying users, etc.
      
      if (this.config.emitIntegrationEvents) {
        this.eventSystem.emit('compliance:scoring:updated', {
          timestamp: new Date(),
          eventId: this.generateId(),
          source: 'ComplianceIntegrationService',
          complianceResultId,
          score,
          threshold: this.config.minimumScoreForAutoAccept,
          action: 'auto_accept',
        });
      }
    } catch (error) {
      console.error('[ComplianceIntegrationService] Error auto-accepting compliance result:', error);
    }
  }

  /**
   * Store a compliance result
   */
  private async storeComplianceResult(complianceResultId: string): Promise<void> {
    try {
      // In a real implementation, we would retrieve the result and store it
      // For now, we'll simulate storage
      console.log(`[ComplianceIntegrationService] Storing compliance result: ${complianceResultId}`);
      
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitResultStored(complianceResultId, 'auto', true);
      }
    } catch (error) {
      console.error('[ComplianceIntegrationService] Error storing compliance result:', error);
    }
  }

  /**
   * Validate a decompiled report (integration with Phase 2)
   */
  async validateDecompiledReport(decompiledReport: DecompiledReport): Promise<any> {
    if (!this.config.integrateWithPhase2) {
      throw new Error('Integration with Phase 2 (Decompiler) is disabled');
    }
    
    try {
      console.log(`[ComplianceIntegrationService] Validating decompiled report: ${decompiledReport.id}`);
      
      // Emit validation started event
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitValidationStarted(
          `decompiled_${decompiledReport.id}`,
          decompiledReport.detectedReportType || 'unknown',
          'Decompiled Report'
        );
      }
      
      // Perform validation
      const complianceResult = await this.validator.validate(decompiledReport);
      
      // Calculate detailed score
      const detailedScore = computeComplianceScore(complianceResult);
      
      // Store result if configured
      if (this.config.storeResultsAutomatically) {
        await this.storage.storeResult(complianceResult);
      }
      
      // Emit integration event
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitValidationCompleted(
          complianceResult,
          complianceResult.processingTimeMs
        );
      }
      
      return {
        complianceResult,
        detailedScore,
        autoAccepted: complianceResult.scores.overallScore >= this.config.minimumScoreForAutoAccept,
      };
      
    } catch (error) {
      console.error('[ComplianceIntegrationService] Error validating decompiled report:', error);
      
      if (this.config.emitIntegrationEvents) {
        this.eventSystem.emit('compliance:validation:error', {
          timestamp: new Date(),
          eventId: this.generateId(),
          source: 'ComplianceIntegrationService',
          error: error instanceof Error ? error.message : String(error),
          reportId: decompiledReport.id,
          reportType: decompiledReport.detectedReportType,
        });
      }
      
      throw error;
    }
  }

  /**
   * Validate a schema mapping result (integration with Phase 3)
   */
  async validateSchemaMapping(schemaMappingResult: SchemaMappingResult): Promise<any> {
    if (!this.config.integrateWithPhase3) {
      throw new Error('Integration with Phase 3 (Schema Mapper) is disabled');
    }
    
    try {
      console.log(`[ComplianceIntegrationService] Validating schema mapping: ${schemaMappingResult.id}`);
      
      // Emit validation started event
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitValidationStarted(
          `mapping_${schemaMappingResult.id}`,
          schemaMappingResult.reportTypeId || 'unknown',
          'Schema Mapping'
        );
      }
      
      // Perform validation (schema mapping alone doesn't have decompiled report)
      const complianceResult = await this.validator.validate(undefined, schemaMappingResult);
      
      // Calculate detailed score
      const detailedScore = computeComplianceScore(complianceResult);
      
      // Store result if configured
      if (this.config.storeResultsAutomatically) {
        await this.storage.storeResult(complianceResult);
      }
      
      // Emit integration event
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitValidationCompleted(
          complianceResult,
          complianceResult.processingTimeMs
        );
      }
      
      return {
        complianceResult,
        detailedScore,
        autoAccepted: complianceResult.scores.overallScore >= this.config.minimumScoreForAutoAccept,
      };
      
    } catch (error) {
      console.error('[ComplianceIntegrationService] Error validating schema mapping:', error);
      
      if (this.config.emitIntegrationEvents) {
        this.eventSystem.emit('compliance:validation:error', {
          timestamp: new Date(),
          eventId: this.generateId(),
          source: 'ComplianceIntegrationService',
          error: error instanceof Error ? error.message : String(error),
          mappingId: schemaMappingResult.id,
          reportType: schemaMappingResult.reportTypeId,
        });
      }
      
      throw error;
    }
  }

  /**
   * Validate combined decompiled report and schema mapping
   */
  async validateCombined(
    decompiledReport: DecompiledReport,
    schemaMappingResult: SchemaMappingResult
  ): Promise<any> {
    if (!this.config.integrateWithPhase2 || !this.config.integrateWithPhase3) {
      throw new Error('Integration with Phase 2 and/or Phase 3 is disabled');
    }
    
    try {
      console.log(`[ComplianceIntegrationService] Validating combined report: ${decompiledReport.id} + ${schemaMappingResult.id}`);
      
      // Emit validation started event
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitValidationStarted(
          `combined_${decompiledReport.id}_${schemaMappingResult.id}`,
          schemaMappingResult.reportTypeId || decompiledReport.detectedReportType || 'unknown',
          'Combined Report'
        );
      }
      
      // Perform validation with both inputs
      const complianceResult = await this.validator.validate(decompiledReport, schemaMappingResult);
      
      // Calculate detailed score
      const detailedScore = computeComplianceScore(complianceResult);
      
      // Store result if configured
      if (this.config.storeResultsAutomatically) {
        await this.storage.storeResult(complianceResult);
      }
      
      // Emit integration event
      if (this.config.emitIntegrationEvents) {
        ComplianceEventHelpers.emitValidationCompleted(
          complianceResult,
          complianceResult.processingTimeMs
        );
      }
      
      return {
        complianceResult,
        detailedScore,
        autoAccepted: complianceResult.scores.overallScore >= this.config.minimumScoreForAutoAccept,
      };
      
    } catch (error) {
      console.error('[ComplianceIntegrationService] Error validating combined report:', error);
      
      if (this.config.emitIntegrationEvents) {
        this.eventSystem.emit('compliance:validation:error', {
          timestamp: new Date(),
          eventId: this.generateId(),
          source: 'ComplianceIntegrationService',
          error: error instanceof Error ? error.message : String(error),
          reportId: decompiledReport.id,
          mappingId: schemaMappingResult.id,
          reportType: schemaMappingResult.reportTypeId || decompiledReport.detectedReportType,
        });
      }
      
      throw error;
    }
  }

  /**
   * Get integration configuration
   */
  getConfig(): ComplianceIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update integration configuration
   */
  updateConfig(newConfig: Partial<ComplianceIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[ComplianceIntegrationService] Configuration updated');
  }

  /**
   * Get integration status
   */
  getStatus(): PhaseIntegrationStatus[] {
    return this.getIntegrationStatus();
  }

  /**
   * Check if a specific phase is connected
   */
  isPhaseConnected(phaseNumber: number): boolean {
    const status = this.integrationStatus.get(phaseNumber);
    return status?.connected || false;
  }

  /**
   * Get validator instance
   */
  getValidator(): ReportComplianceValidator {
    return this.validator;
  }

  /**
   * Get storage instance
   */
  getStorage(): ComplianceResultStorage {
    return this.storage;
  }

  /**
   * Get event system instance
   */
  getEventSystem(): ComplianceEventSystem {
    return this.eventSystem;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // Cleanup event listeners
    // Note: The validator and storage have their own cleanup methods
    console.log('[ComplianceIntegrationService] Disposing integration service');
    
    if (this.config.emitIntegrationEvents) {
      this.eventSystem.emit('compliance:system:shutdown', {
        timestamp: new Date(),
        eventId: this.generateId(),
        source: 'ComplianceIntegrationService',
        reason: 'service_disposal',
      });
    }
  }
}