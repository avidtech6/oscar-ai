import type { LayoutBlock } from '../layout/LayoutTypes';
import type {
  DocumentStructure,
  DocumentTone,
  DocumentSection,
  Inconsistency,
  SummaryOptions,
  RewriteOptions,
  StructuralSuggestion,
  DocumentCommand,
  DocumentEvent,
} from './DocumentTypes';

import { DocumentStructureAnalysisEngine } from './DocumentStructureAnalysisEngine';
import { CrossSectionConsistencyEngine } from './CrossSectionConsistencyEngine';
import { ToneStyleControlEngine } from './ToneStyleControlEngine';
import { DocumentLevelReasoningEngine } from './DocumentLevelReasoningEngine';
import { AutoSummaryEngine } from './AutoSummaryEngine';
import { AutoRewriteEngine } from './AutoRewriteEngine';
import { StructuralOptimisationEngine } from './StructuralOptimisationEngine';
import { DocumentAwareContextMode } from './DocumentAwareContextMode';
import { DocumentAwareChatMode } from './DocumentAwareChatMode';
import { DocumentEventModel } from './DocumentEventModel';

/**
 * Document Intelligence Layer – main orchestrator for all document intelligence.
 */
export class DocumentIntelligenceLayer {
  private structureEngine: DocumentStructureAnalysisEngine;
  private consistencyEngine: CrossSectionConsistencyEngine;
  private toneEngine: ToneStyleControlEngine;
  private reasoningEngine: DocumentLevelReasoningEngine;
  private summaryEngine: AutoSummaryEngine;
  private rewriteEngine: AutoRewriteEngine;
  private optimisationEngine: StructuralOptimisationEngine;
  private contextMode: DocumentAwareContextMode;
  private chatMode: DocumentAwareChatMode;
  private eventModel: DocumentEventModel;

  constructor() {
    this.structureEngine = new DocumentStructureAnalysisEngine();
    this.consistencyEngine = new CrossSectionConsistencyEngine();
    this.toneEngine = new ToneStyleControlEngine();
    this.reasoningEngine = new DocumentLevelReasoningEngine();
    this.summaryEngine = new AutoSummaryEngine();
    this.rewriteEngine = new AutoRewriteEngine();
    this.optimisationEngine = new StructuralOptimisationEngine();
    this.contextMode = new DocumentAwareContextMode();
    this.chatMode = new DocumentAwareChatMode();
    this.eventModel = new DocumentEventModel();

    // Forward events from context mode to event model via execution results
    // (We'll capture events in executeCommands)
  }

  /**
   * Get the event model for external subscription.
   */
  getEventModel(): DocumentEventModel {
    return this.eventModel;
  }

  /**
   * Get the context mode for direct manipulation.
   */
  getContextMode(): DocumentAwareContextMode {
    return this.contextMode;
  }

  /**
   * Get the chat mode for conversational document editing.
   */
  getChatMode(): DocumentAwareChatMode {
    return this.chatMode;
  }

  /**
   * Analyse the structure of a document.
   */
  analyseStructure(blocks: LayoutBlock[]): DocumentStructure {
    const result = this.structureEngine.analyse(blocks);
    this.eventModel.documentChange(blocks);
    return result;
  }

  /**
   * Detect inconsistencies across sections.
   */
  detectInconsistencies(blocks: LayoutBlock[]): Inconsistency[] {
    const inconsistencies = this.consistencyEngine.detect(blocks);
    if (inconsistencies.length > 0) {
      this.eventModel.inconsistencyDetected(inconsistencies);
    }
    return inconsistencies;
  }

  /**
   * Apply a tone to the document.
   */
  applyTone(blocks: LayoutBlock[], tone: DocumentTone): LayoutBlock[] {
    const result = this.toneEngine.rewrite(blocks, { tone });
    this.eventModel.toneChange(tone);
    return result;
  }

  /**
   * Get document‑level reasoning insights.
   */
  getReasoningInsights(blocks: LayoutBlock[]): {
    purpose: string | null;
    missingSections: string[];
    weakArguments: Array<{ blockId: string; reason: string }>;
    flowIssues: Array<{ fromBlockId: string; toBlockId: string; issue: string }>;
    readabilityScore: number;
    suggestions: StructuralSuggestion[];
  } {
    return this.reasoningEngine.analyse(blocks);
  }

  /**
   * Generate a summary of the document.
   */
  generateSummary(blocks: LayoutBlock[], options: SummaryOptions): string {
    const summary = this.summaryEngine.summarise(blocks, options);
    this.eventModel.summaryGenerated(summary, options);
    return summary;
  }

  /**
   * Rewrite the document with given options.
   */
  rewriteDocument(blocks: LayoutBlock[], options: RewriteOptions): LayoutBlock[] {
    const newBlocks = this.rewriteEngine.rewriteDocument(blocks, options);
    this.eventModel.rewriteApplied(blocks, newBlocks, options);
    return newBlocks;
  }

  /**
   * Optimise the document structure.
   */
  optimiseStructure(blocks: LayoutBlock[]): {
    suggestions: StructuralSuggestion[];
    optimisedBlocks: LayoutBlock[];
  } {
    const suggestions = this.optimisationEngine.analyse(blocks);
    const optimisedBlocks = this.optimisationEngine.applyAll(suggestions, blocks);
    this.eventModel.structureOptimised(suggestions, optimisedBlocks !== blocks);
    return { suggestions, optimisedBlocks };
  }

  /**
   * Process a chat message and return document‑level suggestions.
   */
  processChatMessage(message: string, currentBlocks: LayoutBlock[]): {
    response: string;
    shouldApply: boolean;
    command?: DocumentCommand;
  } {
    return this.chatMode.handleMessage(message, currentBlocks);
  }

  /**
   * Execute document commands.
   */
  executeCommands(commands: DocumentCommand[], currentBlocks: LayoutBlock[]): LayoutBlock[] {
    let blocks = currentBlocks;
    for (const command of commands) {
      const result = this.contextMode.execute(command, blocks);
      blocks = result.blocks;
      // Forward events to event model
      result.events.forEach(event => this.eventModel.emit(event));
    }
    return blocks;
  }

  /**
   * Subscribe to document events.
   */
  on(eventType: DocumentEvent['type'], callback: (event: DocumentEvent) => void): void {
    this.eventModel.on(eventType, callback);
  }

  /**
   * Unsubscribe from document events.
   */
  off(eventType: DocumentEvent['type'], callback: (event: DocumentEvent) => void): void {
    this.eventModel.off(eventType, callback);
  }

  /**
   * Export document intelligence state (for debugging).
   */
  exportState(blocks: LayoutBlock[]): any {
    const structure = this.structureEngine.analyse(blocks);
    const inconsistencies = this.consistencyEngine.detect(blocks);
    const tone = this.toneEngine.detectTone(blocks);
    const reasoning = this.reasoningEngine.analyse(blocks);
    const suggestions = this.optimisationEngine.analyse(blocks);

    return {
      blockCount: blocks.length,
      sectionCount: structure.sections.length,
      inconsistencies,
      tone,
      reasoning,
      suggestions,
    };
  }

  /**
   * Validate the document for common issues.
   */
  validateDocument(blocks: LayoutBlock[]): Array<{ type: string; description: string; severity: string }> {
    const issues: Array<{ type: string; description: string; severity: string }> = [];

    // Structure validation
    const structure = this.structureEngine.analyse(blocks);
    if (structure.sections.length === 0) {
      issues.push({ type: 'structure', description: 'Document has no sections', severity: 'low' });
    }

    // Inconsistency validation
    const inconsistencies = this.consistencyEngine.detect(blocks);
    inconsistencies.forEach(inc => {
      issues.push({ type: 'inconsistency', description: inc.description, severity: inc.severity });
    });

    // Tone validation
    const tone = this.toneEngine.detectTone(blocks);
    if (tone === null) {
      issues.push({ type: 'tone', description: 'Document tone could not be determined', severity: 'low' });
    }

    return issues;
  }
}