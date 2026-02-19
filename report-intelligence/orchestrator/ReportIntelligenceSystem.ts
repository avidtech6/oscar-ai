/**
 * Report Intelligence System Orchestrator - Phase 14
 * 
 * Central orchestrator that integrates all subsystems of the Report Intelligence System.
 * Manages data flow, coordinates classification, mapping, template generation, reasoning, and validation.
 */

// Note: We use dynamic imports to avoid circular dependencies and missing modules
// The actual subsystem classes will be imported when needed

export type SystemEvent =
  | 'system:initialised'
  | 'system:pipelineStarted'
  | 'system:pipelineCompleted'
  | 'system:subsystemError'
  | 'system:integrationValidated'
  | 'system:ready'
  | 'system:classificationStarted'
  | 'system:classificationCompleted'
  | 'system:mappingStarted'
  | 'system:mappingCompleted'
  | 'system:templateGenerationStarted'
  | 'system:templateGenerationCompleted'
  | 'system:reasoningStarted'
  | 'system:reasoningCompleted'
  | 'system:workflowLearningStarted'
  | 'system:workflowLearningCompleted'
  | 'system:selfHealingStarted'
  | 'system:selfHealingCompleted'
  | 'system:complianceValidationStarted'
  | 'system:complianceValidationCompleted'
  | 'system:reproductionTestStarted'
  | 'system:reproductionTestCompleted';

export type EventListener = (event: SystemEvent, data: any) => void;

export interface SystemStatus {
  subsystems: {
    registry: boolean;
    decompiler: boolean;
    schemaMapper: boolean;
    schemaUpdater: boolean;
    styleLearner: boolean;
    classification: boolean;
    selfHealing: boolean;
    templateGenerator: boolean;
    complianceValidator: boolean;
    reproductionTester: boolean;
    typeExpansion: boolean;
    aiReasoning: boolean;
    workflowLearning: boolean;
    visualRendering: boolean;
  };
  pipelineStatus: 'idle' | 'running' | 'completed' | 'error';
  lastPipelineRun?: Date;
  pipelineResults?: any;
  errors: string[];
  warnings: string[];
}

export interface PipelineOptions {
  enableReasoning?: boolean;
  enableWorkflowLearning?: boolean;
  enableSelfHealing?: boolean;
  enableComplianceValidation?: boolean;
  enableReproductionTesting?: boolean;
  skipTemplateGeneration?: boolean;
  verbose?: boolean;
}

export class ReportIntelligenceSystem {
  // Subsystem instances - will be initialized dynamically
  private registry: any;
  private decompiler: any;
  private schemaMapper: any;
  private schemaUpdater: any;
  private styleLearner: any;
  private classification: any;
  private selfHealing: any;
  private templateGenerator: any;
  private complianceValidator: any;
  private reproductionTester: any;
  private typeExpansion: any;
  private aiReasoning: any;
  private workflowLearning: any;
  private visualRendering: any;

  // Event system
  private eventListeners: Map<SystemEvent, Set<EventListener>> = new Map();

  // System state
  private status: SystemStatus = {
    subsystems: {
      registry: false,
      decompiler: false,
      schemaMapper: false,
      schemaUpdater: false,
      styleLearner: false,
      classification: false,
      selfHealing: false,
      templateGenerator: false,
      complianceValidator: false,
      reproductionTester: false,
      typeExpansion: false,
      aiReasoning: false,
      workflowLearning: false,
      visualRendering: false
    },
    pipelineStatus: 'idle',
    errors: [],
    warnings: []
  };

  constructor() {
    this.initializeEventSystem();
  }

  /**
   * Initialize the event system
   */
  private initializeEventSystem(): void {
    const events: SystemEvent[] = [
      'system:initialised',
      'system:pipelineStarted',
      'system:pipelineCompleted',
      'system:subsystemError',
      'system:integrationValidated',
      'system:ready',
      'system:classificationStarted',
      'system:classificationCompleted',
      'system:mappingStarted',
      'system:mappingCompleted',
      'system:templateGenerationStarted',
      'system:templateGenerationCompleted',
      'system:reasoningStarted',
      'system:reasoningCompleted',
      'system:workflowLearningStarted',
      'system:workflowLearningCompleted',
      'system:selfHealingStarted',
      'system:selfHealingCompleted',
      'system:complianceValidationStarted',
      'system:complianceValidationCompleted',
      'system:reproductionTestStarted',
      'system:reproductionTestCompleted'
    ];
    
    for (const event of events) {
      this.eventListeners.set(event, new Set());
    }
  }

  /**
   * Event system methods
   */
  on(event: SystemEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  off(event: SystemEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emitEvent(event: SystemEvent, data: any): void {
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
   * Initialize all subsystems
   */
  async initializeSubsystems(): Promise<void> {
    this.emitEvent('system:initialised', { timestamp: new Date() });

    try {
      // Initialize Phase 1: Report Type Registry
      const { ReportTypeRegistry } = await import('../registry/ReportTypeRegistry');
      this.registry = new ReportTypeRegistry();
      this.status.subsystems.registry = true;

      // Initialize Phase 2: Report Decompiler
      const { ReportDecompiler } = await import('../decompiler/ReportDecompiler');
      this.decompiler = new ReportDecompiler();
      this.status.subsystems.decompiler = true;

      // Initialize Phase 3: Schema Mapper
      const { ReportSchemaMapper } = await import('../schema-mapper/ReportSchemaMapper');
      this.schemaMapper = new ReportSchemaMapper();
      this.status.subsystems.schemaMapper = true;

      // Initialize Phase 4: Schema Updater Engine
      const { SchemaUpdaterEngine } = await import('../schema-updater/SchemaUpdaterEngine');
      this.schemaUpdater = new SchemaUpdaterEngine();
      this.status.subsystems.schemaUpdater = true;

      // Initialize Phase 5: Style Learner
      const { ReportStyleLearner } = await import('../style-learner/ReportStyleLearner');
      this.styleLearner = new ReportStyleLearner();
      this.status.subsystems.styleLearner = true;

      // Initialize Phase 6: Classification Engine
      const { ReportClassificationEngine } = await import('../classification/ReportClassificationEngine');
      this.classification = new ReportClassificationEngine();
      this.status.subsystems.classification = true;

      // Initialize Phase 7: Self-Healing Engine
      const { SelfHealingEngine } = await import('../self-healing/SelfHealingEngine');
      this.selfHealing = new SelfHealingEngine();
      this.status.subsystems.selfHealing = true;

      // Note: Phase 8 (Template Generator) may not exist - we'll handle gracefully
      try {
        const { ReportTemplateGenerator } = await import('../template-generator/ReportTemplateGenerator');
        this.templateGenerator = new ReportTemplateGenerator();
        this.status.subsystems.templateGenerator = true;
      } catch (error) {
        this.status.warnings.push('Template Generator not available (Phase 8)');
      }

      // Note: Phase 9 (Compliance Validator) may not exist - we'll handle gracefully
      try {
        const { ComplianceValidator } = await import('../compliance/ComplianceValidator');
        this.complianceValidator = new ComplianceValidator();
        this.status.subsystems.complianceValidator = true;
      } catch (error) {
        this.status.warnings.push('Compliance Validator not available (Phase 9)');
      }

      // Initialize Phase 10: Reproduction Tester
      const { ReportReproductionTester } = await import('../reproduction-tester/ReportReproductionTester');
      this.reproductionTester = new ReportReproductionTester();
      this.status.subsystems.reproductionTester = true;

      // Note: Phase 11 (Type Expansion Framework) may not exist - we'll handle gracefully
      try {
        const { ReportTypeExpansionFramework } = await import('../type-expansion/ReportTypeExpansionFramework');
        this.typeExpansion = new ReportTypeExpansionFramework();
        this.status.subsystems.typeExpansion = true;
      } catch (error) {
        this.status.warnings.push('Type Expansion Framework not available (Phase 11)');
      }

      // Initialize Phase 12: AI Reasoning Engine
      const { AIReasoningEngine } = await import('../ai-reasoning/AIReasoningEngine');
      this.aiReasoning = new AIReasoningEngine();
      this.status.subsystems.aiReasoning = true;

      // Initialize Phase 13: Workflow Learning Engine
      const { UserWorkflowLearningEngine } = await import('../workflow-learning/UserWorkflowLearningEngine');
      this.workflowLearning = new UserWorkflowLearningEngine();
      this.status.subsystems.workflowLearning = true;

      // Note: Phase 15 (Visual Rendering Engine) may not exist - we'll handle gracefully
      try {
        const { VisualRenderingEngine } = await import('../visual-rendering/engines/VisualRenderingEngine');
        // Create with default options
        const defaultOptions: any = {
          layout: {
            size: 'A4' as const,
            orientation: 'portrait' as const,
            margins: { top: 25, right: 20, bottom: 25, left: 20 }
          },
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 11,
            lineHeight: 1.5,
            fontWeight: 'normal' as const,
            fontColor: '#000000',
            headingFontFamily: 'Arial, sans-serif',
            headingFontSizeMultiplier: 1.2
          },
          spacing: {
            paragraphSpacing: 12,
            sectionSpacing: 24,
            indentSize: 36,
            listItemSpacing: 6
          },
          colors: {
            primary: '#2f5233',
            secondary: '#6b7280',
            accent: '#059669',
            background: '#ffffff',
            text: '#000000',
            headings: '#2f5233',
            borders: '#e5e7eb'
          },
          header: {
            enabled: true,
            height: 15,
            showOnFirstPage: true,
            showPageNumbers: true
          },
          footer: {
            enabled: true,
            height: 15,
            showOnFirstPage: true,
            showPageNumbers: true
          },
          coverPage: {
            enabled: true,
            includeLogo: true,
            includeTitle: true,
            includeSubtitle: true,
            includeMetadata: true,
            includeDate: true
          },
          images: {
            maxWidth: 800,
            maxHeight: 600,
            quality: 85,
            format: 'original' as const,
            embedMethod: 'base64' as const,
            lazyLoading: true
          },
          pageBreaks: {
            automatic: true,
            avoidWidowOrphan: true,
            minLinesBeforeBreak: 3,
            minLinesAfterBreak: 3,
            breakBeforeSections: [],
            breakAfterSections: []
          },
          pdf: {
            quality: 'standard' as const,
            includeHyperlinks: true,
            includeBookmarks: true,
            compress: true
          },
          preview: {
            interactive: true,
            zoomLevel: 1.0,
            showRulers: false,
            showGrid: false,
            showMargins: true,
            autoRefresh: true
          },
          snapshot: {
            format: 'png' as const,
            quality: 90,
            scale: 1,
            includeBackground: true,
            captureDelay: 100
          },
          responsive: true,
          accessibility: true,
          language: 'en',
          timezone: 'UTC',
          title: 'Untitled Document',
          author: 'Oscar AI',
          creator: 'Oscar AI Visual Rendering Engine',
          creationDate: new Date()
        };
        this.visualRendering = new VisualRenderingEngine(defaultOptions);
        await this.visualRendering.initialize();
        this.status.subsystems.visualRendering = true;
      } catch (error) {
        this.status.warnings.push('Visual Rendering Engine not available (Phase 15)');
      }

      this.emitEvent('system:ready', {
        timestamp: new Date(),
        subsystems: this.status.subsystems,
        warnings: this.status.warnings
      });

      console.log('Report Intelligence System initialized with subsystems:', this.status.subsystems);
      if (this.status.warnings.length > 0) {
        console.warn('Warnings:', this.status.warnings);
      }
    } catch (error) {
      this.status.errors.push(`Failed to initialize subsystems: ${error}`);
      this.emitEvent('system:subsystemError', {
        error,
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Run full end-to-end pipeline
   */
  async runFullPipeline(
    reportContent: string,
    options: PipelineOptions = {}
  ): Promise<any> {
    const pipelineId = `pipeline_${Date.now()}`;
    this.status.pipelineStatus = 'running';
    this.status.lastPipelineRun = new Date();

    this.emitEvent('system:pipelineStarted', {
      pipelineId,
      timestamp: new Date(),
      options
    });

    const results: any = {
      pipelineId,
      startTime: new Date(),
      steps: {},
      errors: [],
      warnings: []
    };

    try {
      // Step 1: Decompile report
      if (!this.decompiler) throw new Error('Decompiler not initialized');
      results.steps.decompilation = await this.decompiler.decompile(reportContent);

      // Step 2: Classify report
      this.emitEvent('system:classificationStarted', { pipelineId });
      if (!this.classification) throw new Error('Classification engine not initialized');
      results.steps.classification = await this.classification.classifyReport(results.steps.decompilation);
      this.emitEvent('system:classificationCompleted', { pipelineId, result: results.steps.classification });

      // Step 3: Map schema
      this.emitEvent('system:mappingStarted', { pipelineId });
      if (!this.schemaMapper) throw new Error('Schema mapper not initialized');
      results.steps.mapping = await this.schemaMapper.mapSchema(
        results.steps.decompilation,
        results.steps.classification.reportTypeId
      );
      this.emitEvent('system:mappingCompleted', { pipelineId, result: results.steps.mapping });

      // Step 4: Update schema if needed
      if (!this.schemaUpdater) throw new Error('Schema updater not initialized');
      const schemaUpdateResult = await this.schemaUpdater.updateSchemaIfNeeded(
        results.steps.mapping,
        results.steps.classification.reportTypeId
      );
      if (schemaUpdateResult.actions && schemaUpdateResult.actions.length > 0) {
        results.steps.schemaUpdate = schemaUpdateResult;
      }

      // Step 5: Generate template (if available)
      if (!options.skipTemplateGeneration && this.templateGenerator) {
        this.emitEvent('system:templateGenerationStarted', { pipelineId });
        results.steps.template = await this.templateGenerator.generateTemplate(
          results.steps.classification.reportTypeId,
          results.steps.mapping
        );
        this.emitEvent('system:templateGenerationCompleted', { pipelineId, result: results.steps.template });
      }

      // Step 6: Apply style
      if (!this.styleLearner) throw new Error('Style learner not initialized');
      const styleResult = await this.styleLearner.applyStyle(
        results.steps.decompilation,
        results.steps.classification.reportTypeId
      );
      if (styleResult.applied) {
        results.steps.styleApplication = styleResult;
      }

      // Step 7: Validate compliance (if available)
      if (options.enableComplianceValidation !== false && this.complianceValidator) {
        this.emitEvent('system:complianceValidationStarted', { pipelineId });
        results.steps.compliance = await this.complianceValidator.validateCompliance(
          results.steps.decompilation,
          results.steps.classification.reportTypeId
        );
        this.emitEvent('system:complianceValidationCompleted', { pipelineId, result: results.steps.compliance });
      }

      // Step 8: Run reasoning
      if (options.enableReasoning !== false) {
        this.emitEvent('system:reasoningStarted', { pipelineId });
        if (!this.aiReasoning) throw new Error('AI reasoning engine not initialized');
        results.steps.reasoning = await this.aiReasoning.performReasoning(
          results.steps.decompilation,
          results.steps.classification.reportTypeId
        );
        this.emitEvent('system:reasoningCompleted', { pipelineId, result: results.steps.reasoning });
      }

      // Step 9: Run workflow learning
      if (options.enableWorkflowLearning !== false) {
        this.emitEvent('system:workflowLearningStarted', { pipelineId });
        if (!this.workflowLearning) throw new Error('Workflow learning engine not initialized');
        results.steps.workflowLearning = await this.workflowLearning.analyzeWorkflow(
          results.steps.decompilation,
          'system',
          pipelineId
        );
        this.emitEvent('system:workflowLearningCompleted', { pipelineId, result: results.steps.workflowLearning });
      }

      // Step 10: Run self-healing
      if (options.enableSelfHealing !== false) {
        this.emitEvent('system:selfHealingStarted', { pipelineId });
        if (!this.selfHealing) throw new Error('Self-healing engine not initialized');
        results.steps.selfHealing = await this.selfHealing.performHealing(
          results.steps.decompilation,
          results.steps.classification.reportTypeId,
          results.steps.mapping
        );
        this.emitEvent('system:selfHealingCompleted', { pipelineId, result: results.steps.selfHealing });
      }

      // Step 11: Regenerate template if needed (if available)
      if (!options.skipTemplateGeneration && this.templateGenerator && results.steps.selfHealing?.healingApplied) {
        this.emitEvent('system:templateGenerationStarted', { pipelineId, reason: 'post-healing' });
        results.steps.postHealingTemplate = await this.templateGenerator.generateTemplate(
          results.steps.classification.reportTypeId,
          results.steps.mapping
        );
        this.emitEvent('system:templateGenerationCompleted', {
          pipelineId,
          result: results.steps.postHealingTemplate,
          reason: 'post-healing'
        });
      }

      // Step 12: Run reproduction test
      if (options.enableReproductionTesting !== false) {
        this.emitEvent('system:reproductionTestStarted', { pipelineId });
        if (!this.reproductionTester) throw new Error('Reproduction tester not initialized');
        results.steps.reproductionTest = await this.reproductionTester.testReproduction(
          results.steps.decompilation,
          results.steps.classification.reportTypeId
        );
        this.emitEvent('system:reproductionTestCompleted', { pipelineId, result: results.steps.reproductionTest });
      }

      results.endTime = new Date();
      results.durationMs = results.endTime.getTime() - results.startTime.getTime();
      results.success = true;

      this.status.pipelineStatus = 'completed';
      this.status.pipelineResults = results;

      this.emitEvent('system:pipelineCompleted', {
        pipelineId,
        result: results,
        timestamp: new Date()
      });

      return results;
    } catch (error) {
      results.endTime = new Date();
      results.durationMs = results.endTime.getTime() - results.startTime.getTime();
      results.success = false;
      results.error = error;

      this.status.pipelineStatus = 'error';
      this.status.errors.push(`Pipeline ${pipelineId} failed: ${error}`);

      this.emitEvent('system:subsystemError', {
        pipelineId,
        error,
        timestamp: new Date()
      });

      throw error;
    }
  }

  /**
   * Classify a report
   */
  async classifyReport(reportContent: string): Promise<any> {
    if (!this.decompiler || !this.classification) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    return await this.classification.classifyReport(decompiled);
  }

  /**
   * Map schema for a report
   */
  async mapSchema(reportContent: string, reportTypeId?: string): Promise<any> {
    if (!this.decompiler || !this.schemaMapper) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    
    if (!reportTypeId) {
      const classification = await this.classifyReport(reportContent);
      reportTypeId = classification.reportTypeId;
    }

    return await this.schemaMapper.mapSchema(decompiled, reportTypeId);
  }

  /**
   * Update schema if needed
   */
  async updateSchemaIfNeeded(mappingResult: any, reportTypeId: string): Promise<any> {
    if (!this.schemaUpdater) {
      throw new Error('Schema updater not initialized');
    }

    return await this.schemaUpdater.updateSchemaIfNeeded(mappingResult, reportTypeId);
  }

  /**
   * Generate template
   */
  async generateTemplate(reportTypeId: string, mappingResult: any): Promise<any> {
    if (!this.templateGenerator) {
      throw new Error('Template generator not initialized');
    }

    return await this.templateGenerator.generateTemplate(reportTypeId, mappingResult);
  }

  /**
   * Apply style
   */
  async applyStyle(reportContent: string, reportTypeId?: string): Promise<any> {
    if (!this.decompiler || !this.styleLearner) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    
    if (!reportTypeId) {
      const classification = await this.classifyReport(reportContent);
      reportTypeId = classification.reportTypeId;
    }

    return await this.styleLearner.applyStyle(decompiled, reportTypeId);
  }

  /**
   * Validate compliance
   */
  async validateCompliance(reportContent: string, reportTypeId?: string): Promise<any> {
    if (!this.decompiler || !this.complianceValidator) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    
    if (!reportTypeId) {
      const classification = await this.classifyReport(reportContent);
      reportTypeId = classification.reportTypeId;
    }

    return await this.complianceValidator.validateCompliance(decompiled, reportTypeId);
  }

  /**
   * Run reasoning
   */
  async runReasoning(reportContent: string, reportTypeId?: string): Promise<any> {
    if (!this.decompiler || !this.aiReasoning) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    
    if (!reportTypeId) {
      const classification = await this.classifyReport(reportContent);
      reportTypeId = classification.reportTypeId;
    }

    return await this.aiReasoning.performReasoning(decompiled, reportTypeId);
  }

  /**
   * Run workflow learning
   */
  async runWorkflowLearning(reportContent: string, userId: string = 'system'): Promise<any> {
    if (!this.decompiler || !this.workflowLearning) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    return await this.workflowLearning.analyzeWorkflow(decompiled, userId, `analysis_${Date.now()}`);
  }

  /**
   * Run self-healing
   */
  async runSelfHealing(reportContent: string, reportTypeId?: string): Promise<any> {
    if (!this.decompiler || !this.selfHealing) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    
    if (!reportTypeId) {
      const classification = await this.classifyReport(reportContent);
      reportTypeId = classification.reportTypeId;
    }

    const mapping = await this.mapSchema(reportContent, reportTypeId);
    return await this.selfHealing.performHealing(decompiled, reportTypeId, mapping);
  }

  /**
   * Run reproduction test
   */
  async runReproductionTest(reportContent: string, reportTypeId?: string): Promise<any> {
    if (!this.decompiler || !this.reproductionTester) {
      throw new Error('Subsystems not initialized');
    }

    const decompiled = await this.decompiler.decompile(reportContent);
    
    if (!reportTypeId) {
      const classification = await this.classifyReport(reportContent);
      reportTypeId = classification.reportTypeId;
    }

    return await this.reproductionTester.testReproduction(decompiled, reportTypeId);
  }

  /**
   * Get system status
   */
  getSystemStatus(): SystemStatus {
    return { ...this.status };
  }

  /**
   * Clear errors and warnings
   */
  clearSystemIssues(): void {
    this.status.errors = [];
    this.status.warnings = [];
  }

  /**
   * Get subsystem instance (for advanced use)
   */
  getSubsystem<T>(subsystemName: keyof SystemStatus['subsystems']): T | undefined {
    const subsystemMap: Record<string, any> = {
      registry: this.registry,
      decompiler: this.decompiler,
      schemaMapper: this.schemaMapper,
      schemaUpdater: this.schemaUpdater,
      styleLearner: this.styleLearner,
      classification: this.classification,
      selfHealing: this.selfHealing,
      templateGenerator: this.templateGenerator,
      complianceValidator: this.complianceValidator,
      reproductionTester: this.reproductionTester,
      typeExpansion: this.typeExpansion,
      aiReasoning: this.aiReasoning,
      workflowLearning: this.workflowLearning,
      visualRendering: this.visualRendering
    };

    return subsystemMap[subsystemName] as T;
  }
}