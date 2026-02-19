/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Rendering Result Type Definitions
 */

import type { RenderingOptions } from './RenderingOptions';
import type { DocumentContent, PageContent } from './RenderingContent';

/**
 * Rendering status
 */
export type RenderingStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Rendering error types
 */
export type RenderingErrorType =
  | 'validation'
  | 'layout'
  | 'resource'
  | 'export'
  | 'timeout'
  | 'unknown';

/**
 * Rendering error details
 */
export interface RenderingError {
  type: RenderingErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp: Date;
}

/**
 * Rendering performance metrics
 */
export interface RenderingMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  memoryUsage?: number; // bytes
  cpuUsage?: number; // percentage
  pageCount: number;
  elementCount: number;
  imageCount: number;
  layoutPasses: number;
  cacheHits: number;
  cacheMisses: number;
}

/**
 * Page rendering result
 */
export interface PageRenderingResult {
  pageNumber: number;
  html: string;
  css: string;
  width: number;
  height: number;
  unit: 'mm' | 'px' | 'in';
  elementCount: number;
  renderTime: number; // milliseconds
  hasOverflow: boolean;
  warnings: string[];
}

/**
 * Snapshot capture result
 */
export interface SnapshotResult {
  id: string;
  pageNumber: number;
  format: 'png' | 'jpeg' | 'webp';
  dataUrl: string;
  width: number;
  height: number;
  size: number; // bytes
  quality: number;
  captureTime: Date;
  metadata?: Record<string, any>;
}

/**
 * PDF export result
 */
export interface PDFExportResult {
  id: string;
  fileName: string;
  fileSize: number; // bytes
  pageCount: number;
  quality: 'standard' | 'high' | 'print';
  downloadUrl?: string;
  blob?: Blob;
  generationTime: number; // milliseconds
  metadata?: Record<string, any>;
}

/**
 * Visual comparison result
 */
export interface VisualComparisonResult {
  id: string;
  referenceSnapshotId: string;
  currentSnapshotId: string;
  similarityScore: number; // 0-100
  differences: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'addition' | 'removal' | 'modification';
    confidence: number;
  }>;
  passed: boolean;
  threshold: number;
  comparisonTime: Date;
}

/**
 * Complete rendering result
 */
export interface RenderingResult {
  // Identification
  id: string;
  jobId?: string;
  version: string;
  
  // Status
  status: RenderingStatus;
  progress: number; // 0-100
  errors: RenderingError[];
  warnings: string[];
  
  // Input
  content: DocumentContent;
  options: RenderingOptions;
  
  // Output
  html?: string;
  css?: string;
  pages: PageRenderingResult[];
  snapshots: SnapshotResult[];
  pdfExport?: PDFExportResult;
  
  // Performance
  metrics: RenderingMetrics;
  
  // Visual reproduction
  visualComparison?: VisualComparisonResult;
  reproductionScore?: number; // 0-100
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  tags?: string[];
}

/**
 * Rendering progress update
 */
export interface RenderingProgress {
  jobId: string;
  status: RenderingStatus;
  progress: number;
  currentStep: string;
  estimatedTimeRemaining?: number; // milliseconds
  metrics?: Partial<RenderingMetrics>;
  warnings?: string[];
}

/**
 * Rendering job configuration
 */
export interface RenderingJob {
  id: string;
  content: DocumentContent;
  options: RenderingOptions;
  priority: 'low' | 'normal' | 'high' | 'critical';
  callbackUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  scheduledFor?: Date;
}

/**
 * Rendering cache entry
 */
export interface RenderingCacheEntry {
  key: string;
  result: RenderingResult;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  lastAccessed: Date;
  size: number; // bytes
}

/**
 * Create a new rendering result
 */
export function createRenderingResult(
  content: DocumentContent,
  options: RenderingOptions,
  jobId?: string
): RenderingResult {
  const now = new Date();
  const id = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    jobId,
    version: '1.0.0',
    status: 'pending',
    progress: 0,
    errors: [],
    warnings: [],
    content,
    options,
    pages: [],
    snapshots: [],
    metrics: {
      startTime: now,
      pageCount: 0,
      elementCount: 0,
      imageCount: 0,
      layoutPasses: 0,
      cacheHits: 0,
      cacheMisses: 0
    },
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Update rendering progress
 */
export function updateRenderingProgress(
  result: RenderingResult,
  progress: number,
  status?: RenderingStatus,
  currentStep?: string
): RenderingResult {
  const updated = { ...result };
  updated.progress = Math.max(0, Math.min(100, progress));
  
  if (status) {
    updated.status = status;
  }
  
  updated.updatedAt = new Date();
  
  return updated;
}

/**
 * Add error to rendering result
 */
export function addRenderingError(
  result: RenderingResult,
  type: RenderingErrorType,
  message: string,
  details?: Record<string, any>
): RenderingResult {
  const updated = { ...result };
  updated.errors.push({
    type,
    message,
    details,
    timestamp: new Date()
  });
  updated.status = 'failed';
  updated.updatedAt = new Date();
  
  return updated;
}

/**
 * Add warning to rendering result
 */
export function addRenderingWarning(
  result: RenderingResult,
  warning: string
): RenderingResult {
  const updated = { ...result };
  updated.warnings.push(warning);
  updated.updatedAt = new Date();
  
  return updated;
}

/**
 * Complete rendering with final result
 */
export function completeRendering(
  result: RenderingResult,
  pages: PageRenderingResult[],
  html?: string,
  css?: string
): RenderingResult {
  const updated = { ...result };
  updated.status = 'completed';
  updated.progress = 100;
  updated.pages = pages;
  
  if (html) {
    updated.html = html;
  }
  
  if (css) {
    updated.css = css;
  }
  
  // Update metrics
  updated.metrics.endTime = new Date();
  updated.metrics.duration = updated.metrics.endTime.getTime() - updated.metrics.startTime.getTime();
  updated.metrics.pageCount = pages.length;
  updated.metrics.elementCount = pages.reduce((sum, page) => sum + page.elementCount, 0);
  
  updated.updatedAt = new Date();
  
  return updated;
}

/**
 * Add snapshot to rendering result
 */
export function addSnapshot(
  result: RenderingResult,
  snapshot: SnapshotResult
): RenderingResult {
  const updated = { ...result };
  updated.snapshots.push(snapshot);
  updated.updatedAt = new Date();
  
  return updated;
}

/**
 * Add PDF export to rendering result
 */
export function addPDFExport(
  result: RenderingResult,
  pdfExport: PDFExportResult
): RenderingResult {
  const updated = { ...result };
  updated.pdfExport = pdfExport;
  updated.updatedAt = new Date();
  
  return updated;
}

/**
 * Validate rendering result
 */
export function validateRenderingResult(result: RenderingResult): string[] {
  const errors: string[] = [];
  
  // Check required fields
  if (!result.id) {
    errors.push('Rendering result ID is required');
  }
  
  if (!result.content) {
    errors.push('Content is required');
  }
  
  if (!result.options) {
    errors.push('Options are required');
  }
  
  if (!result.metrics) {
    errors.push('Metrics are required');
  }
  
  // Validate status
  if (!['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(result.status)) {
    errors.push(`Invalid status: ${result.status}`);
  }
  
  // Validate progress
  if (result.progress < 0 || result.progress > 100) {
    errors.push(`Progress must be between 0 and 100, got ${result.progress}`);
  }
  
  // Validate dates
  if (!result.createdAt || !(result.createdAt instanceof Date)) {
    errors.push('CreatedAt must be a valid Date');
  }
  
  if (!result.updatedAt || !(result.updatedAt instanceof Date)) {
    errors.push('UpdatedAt must be a valid Date');
  }
  
  // Validate pages if completed
  if (result.status === 'completed' && (!result.pages || result.pages.length === 0)) {
    errors.push('Completed rendering must have pages');
  }
  
  return errors;
}

/**
 * Calculate reproduction score
 */
export function calculateReproductionScore(result: RenderingResult): number {
  if (!result.visualComparison) {
    return 0;
  }
  
  const comparison = result.visualComparison;
  
  // Base score from similarity
  let score = comparison.similarityScore;
  
  // Penalize for differences
  const differencePenalty = comparison.differences.length * 0.5;
  score = Math.max(0, score - differencePenalty);
  
  // Adjust based on threshold
  if (comparison.passed) {
    score = Math.min(100, score + 10);
  }
  
  return Math.round(score);
}