/**
 * Document Intelligence Layer – TypeScript definitions
 */

import type { LayoutBlock } from '../layout/LayoutTypes';

/**
 * Document tone options.
 */
export type DocumentTone =
  | 'professional'
  | 'friendly'
  | 'technical'
  | 'formal'
  | 'simplified'
  | 'client-facing'
  | 'regulatory';

/**
 * Document section.
 */
export interface DocumentSection {
  id: string;
  title: string;
  level: number; // heading level
  blocks: LayoutBlock[];
  children: DocumentSection[]; // nested subsections
}

/**
 * Document structure analysis result.
 */
export interface DocumentStructure {
  sections: DocumentSection[];
  headings: Array<{
    id: string;
    text: string;
    level: number;
    blockId: string;
  }>;
  blocks: LayoutBlock[];
  media: Array<{
    blockId: string;
    mediaId: string;
    type: string;
  }>;
  tables: Array<{
    blockId: string;
    headers: string[];
    rowCount: number;
  }>;
  readingOrder: LayoutBlock[]; // blocks in reading order
}

/**
 * Inconsistency detection result.
 */
export interface Inconsistency {
  type:
    | 'contradiction'
    | 'repetition'
    | 'missing_info'
    | 'terminology'
    | 'tone'
    | 'formatting'
    | 'numbering';
  severity: 'low' | 'medium' | 'high';
  location: {
    blockId?: string;
    sectionId?: string;
    text?: string;
  };
  description: string;
  suggestion?: string;
}

/**
 * Summary options.
 */
export interface SummaryOptions {
  length: 'short' | 'medium' | 'long';
  format: 'paragraph' | 'bullet' | 'executive';
  focus?: string[]; // e.g., ['key findings', 'recommendations']
}

/**
 * Rewrite options.
 */
export interface RewriteOptions {
  tone?: DocumentTone;
  clarity?: boolean;
  conciseness?: boolean;
  targetAudience?: string;
}

/**
 * Structural optimisation suggestion.
 */
export interface StructuralSuggestion {
  type: 'reorder' | 'merge' | 'split' | 'insert' | 'rename';
  sectionId?: string;
  targetSectionId?: string;
  newTitle?: string;
  reason: string;
}

/**
 * Document‑level event types.
 */
export type DocumentEventType =
  | 'documentOpen'
  | 'documentChange'
  | 'sectionChange'
  | 'toneChange'
  | 'mediaAdded'
  | 'layoutChange'
  | 'inconsistencyDetected'
  | 'summaryGenerated'
  | 'rewriteApplied'
  | 'structureOptimised';

/**
 * Document event payloads.
 */
export interface DocumentOpenEvent {
  type: 'documentOpen';
  document: any; // placeholder
}

export interface DocumentChangeEvent {
  type: 'documentChange';
  blocks: LayoutBlock[];
}

export interface SectionChangeEvent {
  type: 'sectionChange';
  section: DocumentSection;
}

export interface ToneChangeEvent {
  type: 'toneChange';
  tone: DocumentTone;
}

export interface MediaAddedEvent {
  type: 'mediaAdded';
  media: any;
}

export interface LayoutChangeEvent {
  type: 'layoutChange';
  block: LayoutBlock;
}

export interface InconsistencyDetectedEvent {
  type: 'inconsistencyDetected';
  inconsistencies: Inconsistency[];
}

export interface SummaryGeneratedEvent {
  type: 'summaryGenerated';
  summary: string;
  options: SummaryOptions;
}

export interface RewriteAppliedEvent {
  type: 'rewriteApplied';
  originalBlocks: LayoutBlock[];
  newBlocks: LayoutBlock[];
  options: RewriteOptions;
}

export interface StructureOptimisedEvent {
  type: 'structureOptimised';
  suggestions: StructuralSuggestion[];
  applied: boolean;
}

export type DocumentEvent =
  | DocumentOpenEvent
  | DocumentChangeEvent
  | SectionChangeEvent
  | ToneChangeEvent
  | MediaAddedEvent
  | LayoutChangeEvent
  | InconsistencyDetectedEvent
  | SummaryGeneratedEvent
  | RewriteAppliedEvent
  | StructureOptimisedEvent;

/**
 * Document‑level commands.
 */
export type DocumentCommand =
  | { type: 'analyseStructure'; blocks: LayoutBlock[] }
  | { type: 'detectInconsistencies'; blocks: LayoutBlock[] }
  | { type: 'rewriteDocument'; blocks: LayoutBlock[]; options: RewriteOptions }
  | { type: 'rewriteSection'; sectionId: string; blocks: LayoutBlock[]; options: RewriteOptions }
  | { type: 'summariseDocument'; blocks: LayoutBlock[]; options: SummaryOptions }
  | { type: 'optimiseStructure'; blocks: LayoutBlock[] }
  | { type: 'applyTone'; blocks: LayoutBlock[]; tone: DocumentTone }
  | { type: 'fixInconsistencies'; blocks: LayoutBlock[] };