/**
 * AI Layout Engine - PHASE 23
 * Type definitions for the Layout Intelligence System
 */

/**
 * Layout block types
 */
export enum LayoutBlockType {
  HEADER = 'header',
  PARAGRAPH = 'paragraph',
  LIST = 'list',
  TABLE = 'table',
  IMAGE = 'image',
  CODE = 'code',
  QUOTE = 'quote',
  SECTION = 'section',
  SUBSECTION = 'subsection',
  FOOTER = 'footer',
  PAGE_BREAK = 'page_break'
}

/**
 * Layout block interface
 */
export interface LayoutBlock {
  id: string;
  type: LayoutBlockType;
  content: string;
  metadata: {
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    style: {
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string;
      textAlign?: 'left' | 'center' | 'right' | 'justify';
      color?: string;
      backgroundColor?: string;
      padding?: number;
      margin?: number;
      lineHeight?: number;
      width?: number;
    };
    attributes: Record<string, any>;
  };
  children: LayoutBlock[];
  parent?: string;
  level: number;
}

/**
 * Layout template
 */
export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  blocks: LayoutBlock[];
  globalStyles: Record<string, any>;
  responsiveRules: Array<{
    breakpoint: string;
    styles: Record<string, any>;
  }>;
}

/**
 * Layout optimization options
 */
export interface LayoutOptimizationOptions {
  readability: {
    fontSize: number;
    lineHeight: number;
    paragraphSpacing: number;
    margin: number;
  };
  responsiveness: {
    breakpoints: Array<{
      name: string;
      maxWidth: number;
    }>;
    fluid: boolean;
  };
  aesthetics: {
    colorScheme: string;
    fontFamily: string;
    spacing: string;
    alignment: 'left' | 'center' | 'right' | 'justify';
  };
  accessibility: {
    contrast: number;
    fontSize: number;
    altText: boolean;
  };
}

/**
 * Layout optimization result
 */
export interface LayoutOptimizationResult {
  success: boolean;
  optimizedBlocks: LayoutBlock[];
  improvements: string[];
  score: number;
  processingTime: number;
  warnings: string[];
}

/**
 * Layout analysis result
 */
export interface LayoutAnalysisResult {
  structure: {
    totalBlocks: number;
    blockTypes: Record<LayoutBlockType, number>;
    hierarchy: Array<{
      level: number;
      blocks: LayoutBlock[];
    }>;
    readabilityScore: number;
    consistencyScore: number;
  };
  recommendations: string[];
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    suggestion: string;
  }>;
}

/**
 * Layout manipulation options
 */
export interface LayoutManipulationOptions {
  action: 'move' | 'resize' | 'align' | 'group' | 'ungroup';
  targetIds: string[];
  parameters: Record<string, any>;
}

/**
 * Layout manipulation result
 */
export interface LayoutManipulationResult {
  success: boolean;
  modifiedBlocks: LayoutBlock[];
  changes: Array<{
    blockId: string;
    action: string;
    changes: Record<string, any>;
  }>;
  warnings: string[];
}

/**
 * Layout export options
 */
export interface LayoutExportOptions {
  format: 'html' | 'css' | 'json' | 'pdf';
  includeStyles: boolean;
  includeScripts: boolean;
  responsive: boolean;
  minify: boolean;
}

/**
 * Layout export result
 */
export interface LayoutExportResult {
  success: boolean;
  content: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Layout breakpoint
 */
export interface LayoutBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  styles: Record<string, any>;
}

/**
 * Layout grid configuration
 */
export interface LayoutGrid {
  columns: number;
  gap: number;
  responsive: boolean;
  breakpoints: LayoutBreakpoint[];
}

/**
 * Layout animation
 */
export interface LayoutAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce';
  duration: number;
  easing: string;
  delay?: number;
  target: string;
}

/**
 * Layout event types
 */
export enum LayoutEventType {
  BLOCK_ADDED = 'block_added',
  BLOCK_REMOVED = 'block_removed',
  BLOCK_MODIFIED = 'block_modified',
  TEMPLATE_APPLIED = 'template_applied',
  OPTIMIZATION_COMPLETED = 'optimization_completed',
  EXPORT_COMPLETED = 'export_completed'
}

/**
 * Layout event
 */
export interface LayoutEvent {
  type: LayoutEventType;
  timestamp: Date;
  blockId?: string;
  templateId?: string;
  data: Record<string, any>;
}

/**
 * Layout event listener
 */
export type LayoutEventListener = (event: LayoutEvent) => void;

/**
 * Layout manager configuration
 */
export interface LayoutManagerConfig {
  enableAutoOptimization: boolean;
  autoOptimizationInterval: number;
  enableAutoSave: boolean;
  autoSaveInterval: number;
  maxHistory: number;
  enableUndoRedo: boolean;
  maxUndoSteps: number;
  listeners?: LayoutEventListener[];
}

/**
 * Layout history entry
 */
export interface LayoutHistoryEntry {
  timestamp: Date;
  action: string;
  blocks: LayoutBlock[];
  metadata: Record<string, any>;
}

/**
 * Layout comparison result
 */
export interface LayoutComparisonResult {
  similarities: number;
  differences: Array<{
    type: string;
    description: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  score: number;
}

/**
 * Layout validation result
 */
export interface LayoutValidationResult {
  valid: boolean;
  errors: Array<{
    type: string;
    message: string;
    location: string;
    severity: 'error' | 'warning';
  }>;
  suggestions: string[];
}

/**
 * Layout performance metrics
 */
export interface LayoutPerformanceMetrics {
  renderTime: number;
  optimizationTime: number;
  exportTime: number;
  memoryUsage: number;
  cpuUsage: number;
}