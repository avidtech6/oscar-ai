/**
 * Document Intelligence Layer - PHASE 24
 * Type definitions for the Document Intelligence System
 */

/**
 * Document section types
 */
export enum DocumentSectionType {
  INTRODUCTION = 'introduction',
  METHODOLOGY = 'methodology',
  RESULTS = 'results',
  DISCUSSION = 'discussion',
  CONCLUSION = 'conclusion',
  REFERENCES = 'references',
  APPENDIX = 'appendix',
  ABSTRACT = 'abstract',
  ACKNOWLEDGEMENTS = 'acknowledgements'
}

/**
 * Document section interface
 */
export interface DocumentSection {
  id: string;
  type: DocumentSectionType;
  title: string;
  content: string;
  metadata: {
    wordCount: number;
    paragraphCount: number;
    headingLevel: number;
    position: {
      startIndex: number;
      endIndex: number;
      page: number;
    };
    style: Record<string, any>;
  };
  subsections: DocumentSection[];
  references: string[];
  relatedSections: string[];
}

/**
 * Document structure analysis
 */
export interface DocumentStructure {
  sections: DocumentSection[];
  hierarchy: Array<{
    level: number;
    sections: DocumentSection[];
  }>;
  totalWords: number;
  totalParagraphs: number;
  readingTime: number;
  complexity: {
    score: number;
    level: 'simple' | 'moderate' | 'complex' | 'very_complex';
  };
}

/**
 * Document consistency check
 */
export interface DocumentConsistency {
  overallScore: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    suggestion: string;
  }>;
  metrics: {
    terminologyConsistency: number;
    formattingConsistency: number;
    structureConsistency: number;
    referenceConsistency: number;
  };
}

/**
 * Document summary
 */
export interface DocumentSummary {
  title: string;
  abstract: string;
  keyPoints: string[];
  topics: string[];
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    sections: Array<{
      section: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
    }>;
  };
  statistics: {
    wordCount: number;
    paragraphCount: number;
    sectionCount: number;
    readingTime: number;
    complexity: number;
  };
}

/**
 * Document analysis result
 */
export interface DocumentAnalysisResult {
  structure: DocumentStructure;
  consistency: DocumentConsistency;
  summary: DocumentSummary;
  insights: string[];
  recommendations: string[];
  quality: {
    overall: number;
    readability: number;
    completeness: number;
    consistency: number;
  };
}

/**
 * Document intelligence configuration
 */
export interface DocumentIntelligenceConfig {
  enableDeepAnalysis: boolean;
  enableConsistencyChecks: boolean;
  enableSummarization: boolean;
  enableSentimentAnalysis: boolean;
  maxSectionDepth: number;
  terminologyDatabase: string[];
  styleGuide: Record<string, any>;
}

/**
 * Document reference
 */
export interface DocumentReference {
  id: string;
  type: 'citation' | 'figure' | 'table' | 'appendix';
  label: string;
  description: string;
  location: {
    section: string;
    position: number;
  };
  content: string;
  metadata: Record<string, any>;
}

/**
 * Document comparison result
 */
export interface DocumentComparisonResult {
  similarity: number;
  differences: Array<{
    type: 'structural' | 'content' | 'style' | 'format';
    description: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
  }>;
  recommendations: string[];
}

/**
 * Document quality metrics
 */
export interface DocumentQualityMetrics {
  overall: number;
  readability: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  coherence: number;
  clarity: number;
  organization: number;
}

/**
 * Document analysis mode
 */
export enum DocumentAnalysisMode {
  BASIC = 'basic',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive'
}

/**
 * Document analysis options
 */
export interface DocumentAnalysisOptions {
  mode: DocumentAnalysisMode;
  includeStructure: boolean;
  includeConsistency: boolean;
  includeSummary: boolean;
  includeReferences: boolean;
  includeQuality: boolean;
  language: string;
  customRules?: Record<string, any>;
}

/**
 * Document terminology database entry
 */
export interface TerminologyEntry {
  term: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  context: string[];
  category: string;
  confidence: number;
}

/**
 * Document style rule
 */
export interface StyleRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  replacement: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
}

/**
 * Document validation result
 */
export interface DocumentValidationResult {
  valid: boolean;
  errors: Array<{
    type: string;
    message: string;
    location: string;
    severity: 'error' | 'warning' | 'info';
    rule?: string;
  }>;
  suggestions: string[];
  score: number;
}

/**
 * Document event types
 */
export enum DocumentEventType {
  ANALYSIS_STARTED = 'analysis_started',
  ANALYSIS_COMPLETED = 'analysis_completed',
  CONSISTENCY_CHECK = 'consistency_check',
  SUMMARY_GENERATED = 'summary_generated',
  VALIDATION_FAILED = 'validation_failed',
  QUALITY_SCORE_CALCULATED = 'quality_score_calculated'
}

/**
 * Document event
 */
export interface DocumentEvent {
  type: DocumentEventType;
  timestamp: Date;
  documentId?: string;
  data: Record<string, any>;
}

/**
 * Document event listener
 */
export type DocumentEventListener = (event: DocumentEvent) => void;

/**
 * Document manager configuration
 */
export interface DocumentManagerConfig {
  enableAutoAnalysis: boolean;
  autoAnalysisInterval: number;
  enableAutoSave: boolean;
  autoSaveInterval: number;
  maxHistory: number;
  enableUndoRedo: boolean;
  maxUndoSteps: number;
  listeners?: DocumentEventListener[];
}

/**
 * Document history entry
 */
export interface DocumentHistoryEntry {
  timestamp: Date;
  action: string;
  documentId: string;
  changes: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Document export options
 */
export interface DocumentExportOptions {
  format: 'html' | 'pdf' | 'markdown' | 'json' | 'docx';
  includeAnalysis: boolean;
  includeSummary: boolean;
  includeReferences: boolean;
  includeStyles: boolean;
  filename?: string;
}

/**
 * Document export result
 */
export interface DocumentExportResult {
  success: boolean;
  content: string;
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl?: string;
}

/**
 * Document search query
 */
export interface DocumentSearchQuery {
  text?: string;
  sectionType?: DocumentSectionType;
  minWordCount?: number;
  maxWordCount?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Document search result
 */
export interface DocumentSearchResult {
  results: DocumentSection[];
  total: number;
  page: number;
  pageSize: number;
  query: DocumentSearchQuery;
  suggestions: string[];
}

/**
 * Document collaboration options
 */
export interface DocumentCollaborationOptions {
  enableComments: boolean;
  enableTrackChanges: boolean;
  enableVersionControl: boolean;
  enableRealTime: boolean;
  maxConcurrentEditors: number;
}

/**
 * Document version
 */
export interface DocumentVersion {
  id: string;
  version: string;
  timestamp: Date;
  author: string;
  changes: string[];
  summary: string;
  size: number;
}

/**
 * Document performance metrics
 */
export interface DocumentPerformanceMetrics {
  analysisTime: number;
  validationTime: number;
  exportTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
}