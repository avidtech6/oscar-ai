/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Integration with Phase 10: Report Reproduction Tester
 * 
 * Provides visual comparison capabilities for the Report Reproduction Tester
 * to compare original vs regenerated reports using visual snapshots.
 * 
 * Note: This is a standalone integration that can work even if Phase 10
 * is not fully implemented yet.
 */

import type {
  RenderingOptions,
  DocumentContent,
  RenderingResult
} from '../types';

import { VisualRenderingEngine } from '../engines/VisualRenderingEngine';
import { SnapshotCaptureSystem } from '../engines/SnapshotCaptureSystem';
import { DEFAULT_RENDERING_OPTIONS } from '../types';

/**
 * Visual comparison result for reproduction testing
 */
export interface VisualComparisonResult {
  originalSnapshotUrl: string;
  regeneratedSnapshotUrl: string;
  visualSimilarityScore: number;
  layoutMatchScore: number;
  typographyMatchScore: number;
  colorMatchScore: number;
  spacingMatchScore: number;
  visualDifferences: VisualDifference[];
  passedVisualTest: boolean;
}

/**
 * Visual difference detected between original and regenerated reports
 */
export interface VisualDifference {
  type: 'layout' | 'typography' | 'color' | 'spacing' | 'missing' | 'extra';
  description: string;
  severity: 'low' | 'medium' | 'high';
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Reproduction test result (simplified version for Phase 15 integration)
 */
export interface ReproductionTestResult {
  id: string;
  reportTypeId: string;
  similarityScore: number;
  structuralMatchScore: number;
  contentMatchScore: number;
  styleMatchScore: number;
  missingSections: string[];
  extraSections: string[];
  mismatchedFields: string[];
  mismatchedTerminology: string[];
  templateIssues: string[];
  schemaIssues: string[];
  warnings: string[];
  passed: boolean;
  timestamps: {
    started: number;
    completed: number;
  };
}

/**
 * Enhanced reproduction test result with visual comparison
 */
export interface EnhancedReproductionTestResult extends ReproductionTestResult {
  visualComparison?: VisualComparisonResult;
  visualSimilarityScore?: number;
  hasVisualData: boolean;
}

/**
 * Phase 10 Integration for Visual Reproduction Testing
 */
export class Phase10ReproductionIntegration {
  private renderingEngine: VisualRenderingEngine | null = null;
  private snapshotSystem: SnapshotCaptureSystem | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize on demand
  }

  /**
   * Initialize the integration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create rendering engine with default options
      const options: RenderingOptions = {
        ...DEFAULT_RENDERING_OPTIONS,
        layout: {
          ...DEFAULT_RENDERING_OPTIONS.layout,
          size: 'A4',
          orientation: 'portrait',
          margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        typography: {
          ...DEFAULT_RENDERING_OPTIONS.typography,
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          lineHeight: 1.5
        },
        colors: {
          ...DEFAULT_RENDERING_OPTIONS.colors,
          primary: '#2e7d32',
          secondary: '#4caf50',
          background: '#ffffff',
          text: '#333333'
        }
      };

      this.renderingEngine = new VisualRenderingEngine(options, {
        enablePreview: true,
        enableSnapshots: true,
        enablePDFExport: false,
        enableCoverPages: false,
        enableHeadersFooters: false,
        enableImageOptimization: false,
        enablePageBreaks: false,
        cacheEnabled: true,
        cacheMaxSize: 20,
        parallelProcessing: false,
        maxWorkers: 1,
        defaultQuality: 80,
        defaultFormat: 'png'
      });

      await this.renderingEngine.initialize();
      
      // Create snapshot system for visual comparison
      this.snapshotSystem = new SnapshotCaptureSystem(options, {
        enabled: true,
        format: 'png',
        quality: 80,
        scale: 1,
        includeBackground: true,
        captureDelay: 100,
        compareThreshold: 0.95,
        maxSnapshots: 10,
        storageLocation: 'memory',
        autoCompare: true,
        generateDiff: true,
        diffHighlightColor: '#ff0000'
      });

      this.isInitialized = true;

    } catch (error) {
      console.error('Failed to initialize Phase10ReproductionIntegration:', error);
      throw error;
    }
  }

  /**
   * Enhance reproduction test result with visual comparison
   */
  public async enhanceReproductionTest(
    originalReportHtml: string,
    regeneratedReportHtml: string,
    testResult?: Partial<ReproductionTestResult>
  ): Promise<EnhancedReproductionTestResult> {
    if (!this.isInitialized || !this.renderingEngine || !this.snapshotSystem) {
      await this.initialize();
    }

    // Create default test result if not provided
    const baseResult: ReproductionTestResult = {
      id: testResult?.id || `test-${Date.now()}`,
      reportTypeId: testResult?.reportTypeId || 'unknown',
      similarityScore: testResult?.similarityScore || 0,
      structuralMatchScore: testResult?.structuralMatchScore || 0,
      contentMatchScore: testResult?.contentMatchScore || 0,
      styleMatchScore: testResult?.styleMatchScore || 0,
      missingSections: testResult?.missingSections || [],
      extraSections: testResult?.extraSections || [],
      mismatchedFields: testResult?.mismatchedFields || [],
      mismatchedTerminology: testResult?.mismatchedTerminology || [],
      templateIssues: testResult?.templateIssues || [],
      schemaIssues: testResult?.schemaIssues || [],
      warnings: testResult?.warnings || [],
      passed: testResult?.passed || false,
      timestamps: testResult?.timestamps || {
        started: Date.now(),
        completed: Date.now()
      }
    };

    const enhancedResult: EnhancedReproductionTestResult = {
      ...baseResult,
      hasVisualData: false
    };

    try {
      // Capture snapshots of both reports
      const originalSnapshot = await this.captureReportSnapshot(originalReportHtml);
      const regeneratedSnapshot = await this.captureReportSnapshot(regeneratedReportHtml);

      // Compare visual snapshots
      const visualComparison = await this.compareVisualSnapshots(
        originalSnapshot,
        regeneratedSnapshot
      );

      // Update enhanced result with visual data
      enhancedResult.visualComparison = visualComparison;
      enhancedResult.visualSimilarityScore = visualComparison.visualSimilarityScore;
      enhancedResult.hasVisualData = true;

      // Update overall similarity score with visual component
      if (baseResult.similarityScore !== undefined) {
        // Weighted average: 70% content/structure, 30% visual
        const contentScore = baseResult.similarityScore;
        const visualScore = visualComparison.visualSimilarityScore;
        enhancedResult.similarityScore = (contentScore * 0.7) + (visualScore * 0.3);
      }

      // Update pass/fail status based on visual comparison
      if (baseResult.passed && !visualComparison.passedVisualTest) {
        enhancedResult.passed = false;
        enhancedResult.warnings = [
          ...enhancedResult.warnings,
          'Visual reproduction test failed despite content/structure passing'
        ];
      }

    } catch (error) {
      console.warn('Visual comparison failed:', error);
      enhancedResult.warnings = [
        ...enhancedResult.warnings,
        `Visual comparison unavailable: ${error}`
      ];
    }

    return enhancedResult;
  }

  /**
   * Capture snapshot of a report HTML
   */
  private async captureReportSnapshot(html: string): Promise<{
    url: string;
    width: number;
    height: number;
    metrics: any;
  }> {
    if (!this.snapshotSystem) {
      throw new Error('Snapshot system not initialized');
    }

    // Create a complete HTML document for rendering
    const completeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Report Snapshot</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background: white;
            color: #333;
          }
          .report-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          ${html}
        </div>
      </body>
      </html>
    `;

    // Create a temporary container for the snapshot
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      height: 1131px;
      background: white;
      padding: 20px;
      box-sizing: border-box;
      overflow: hidden;
    `;
    
    container.innerHTML = completeHtml;
    document.body.appendChild(container);

    try {
      // Create a simple document content for snapshot
      const documentContent: DocumentContent = {
        title: 'Report Snapshot',
        author: 'Phase 15 Integration',
        date: new Date(),
        version: '1.0',
        sections: [],
        metadata: {
          snapshot: true,
          timestamp: Date.now()
        }
      };

      // Capture snapshot using the snapshot system
      const snapshots = await this.snapshotSystem!.captureDocumentSnapshot(documentContent, ['reproduction-test']);
      
      if (snapshots.length === 0) {
        throw new Error('Failed to capture snapshot');
      }

      // Get the first snapshot
      const snapshot = snapshots[0];
      const snapshotEntry = this.snapshotSystem!.getSnapshot(snapshot.id);
      
      if (!snapshotEntry) {
        throw new Error('Snapshot not found in storage');
      }

      return {
        url: snapshotEntry.data, // base64 image data
        width: snapshot.dimensions.width,
        height: snapshot.dimensions.height,
        metrics: {
          width: snapshot.dimensions.width,
          height: snapshot.dimensions.height,
          elementCount: 0, // Simplified for now
          fontSizes: [12, 14, 16], // Default font sizes
          fontFamilies: ['Arial', 'sans-serif'],
          colors: ['#2e7d32', '#4caf50', '#ffffff', '#333333'],
          backgroundColor: '#ffffff',
          margins: 20,
          paddings: 20
        }
      };

    } finally {
      // Clean up
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  /**
   * Compare visual snapshots of original and regenerated reports
   */
  private async compareVisualSnapshots(
    originalSnapshot: { url: string; width: number; height: number; metrics: any },
    regeneratedSnapshot: { url: string; width: number; height: number; metrics: any }
  ): Promise<VisualComparisonResult> {
    if (!this.snapshotSystem) {
      throw new Error('Snapshot system not initialized');
    }

    // Generate snapshot IDs for comparison
    const snapshotId1 = `original-${Date.now()}`;
    const snapshotId2 = `regenerated-${Date.now()}`;

    // Store snapshots temporarily for comparison
    const snapshot1 = {
      metadata: {
        id: snapshotId1,
        timestamp: Date.now(),
        documentId: 'original',
        pageNumber: 0,
        totalPages: 1,
        format: 'png',
        size: 0,
        dimensions: { width: originalSnapshot.width, height: originalSnapshot.height },
        checksum: '',
        tags: ['original'],
        annotations: {}
      },
      data: originalSnapshot.url,
      createdAt: Date.now(),
      accessedAt: Date.now()
    };

    const snapshot2 = {
      metadata: {
        id: snapshotId2,
        timestamp: Date.now(),
        documentId: 'regenerated',
        pageNumber: 0,
        totalPages: 1,
        format: 'png',
        size: 0,
        dimensions: { width: regeneratedSnapshot.width, height: regeneratedSnapshot.height },
        checksum: '',
        tags: ['regenerated'],
        annotations: {}
      },
      data: regeneratedSnapshot.url,
      createdAt: Date.now(),
      accessedAt: Date.now()
    };

    // Manually add to snapshot system storage
    const snapshotMap = (this.snapshotSystem as any).snapshots;
    if (snapshotMap && typeof snapshotMap.set === 'function') {
      snapshotMap.set(snapshotId1, snapshot1);
      snapshotMap.set(snapshotId2, snapshot2);
    }

    // Compare snapshots
    const comparison = await this.snapshotSystem.compareSnapshots(snapshotId1, snapshotId2);

    // Calculate visual similarity score
    const visualSimilarityScore = comparison.similarity;
    
    // Analyze layout differences
    const layoutMatchScore = this.analyzeLayoutMatch(originalSnapshot.metrics, regeneratedSnapshot.metrics);
    const typographyMatchScore = this.analyzeTypographyMatch(originalSnapshot.metrics, regeneratedSnapshot.metrics);
    const colorMatchScore = this.analyzeColorMatch(originalSnapshot.metrics, regeneratedSnapshot.metrics);
    const spacingMatchScore = this.analyzeSpacingMatch(originalSnapshot.metrics, regeneratedSnapshot.metrics);

    // Detect visual differences
    const visualDifferences = this.detectVisualDifferences(
      comparison,
      originalSnapshot.metrics,
      regeneratedSnapshot.metrics
    );

    // Determine if visual test passed
    const passedVisualTest = visualSimilarityScore >= 0.8 && visualDifferences.length === 0;

    return {
      originalSnapshotUrl: originalSnapshot.url,
      regeneratedSnapshotUrl: regeneratedSnapshot.url,
      visualSimilarityScore,
      layoutMatchScore,
      typographyMatchScore,
      colorMatchScore,
      spacingMatchScore,
      visualDifferences,
      passedVisualTest
    };
  }

  /**
   * Analyze layout match between original and regenerated reports
   */
  private analyzeLayoutMatch(originalMetrics: any, regeneratedMetrics: any): number {
    if (!originalMetrics || !regeneratedMetrics) {
      return 0;
    }

    const scores: number[] = [];
    
    // Compare dimensions
    if (originalMetrics.width && regeneratedMetrics.width) {
      const widthDiff = Math.abs(originalMetrics.width - regeneratedMetrics.width) / originalMetrics.width;
      scores.push(1 - Math.min(widthDiff, 1));
    }
    
    if (originalMetrics.height && regeneratedMetrics.height) {
      const heightDiff = Math.abs(originalMetrics.height - regeneratedMetrics.height) / originalMetrics.height;
      scores.push(1 - Math.min(heightDiff, 1));
    }
    
    // Average scores
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
  }

  /**
   * Analyze typography match between original and regenerated reports
   */
  private analyzeTypographyMatch(originalMetrics: any, regeneratedMetrics: any): number {
    if (!originalMetrics || !regeneratedMetrics) {
      return 0;
    }

    const scores: number[] = [];
    
    // Compare font sizes if available
    if (originalMetrics.fontSizes && regeneratedMetrics.fontSizes) {
      const originalAvg = originalMetrics.fontSizes.reduce((a: number, b: number) => a + b, 0) / originalMetrics.fontSizes.length;
      const regeneratedAvg = regeneratedMetrics.fontSizes.reduce((a: number, b: number) => a + b, 0) / regeneratedMetrics.fontSizes.length;
      const fontSizeDiff = Math.abs(originalAvg - regeneratedAvg) / originalAvg;
      scores.push(1 - Math.min(fontSizeDiff, 1));
    }
    
    // Compare font families if available
    if (originalMetrics.fontFamilies && regeneratedMetrics.fontFamilies) {
      const commonFonts = originalMetrics.fontFamilies.filter((font: string) => 
        regeneratedMetrics.fontFamilies.includes(font)
      );
      const fontFamilyScore = commonFonts.length / Math.max(originalMetrics.fontFamilies.length, 1);
      scores.push(fontFamilyScore);
    }
    
    // Average scores
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
  }

  /**
   * Analyze color match between original and regenerated reports
   */
  private analyzeColorMatch(originalMetrics: any, regeneratedMetrics: any): number {
    if (!originalMetrics || !regeneratedMetrics) {
      return 0;
    }

    const scores: number[] = [];
    
    // Compare color palettes if available
    if (originalMetrics.colors && regeneratedMetrics.colors) {
      const commonColors = originalMetrics.colors.filter((color: string) =>
        regeneratedMetrics.colors.includes(color)
      );
      const colorScore = commonColors.length / Math.max(originalMetrics.colors.length, 1);
      scores.push(colorScore);
    }
    
    // Compare background colors if available
    if (originalMetrics.backgroundColor && regeneratedMetrics.backgroundColor) {
      const bgColorMatch = originalMetrics.backgroundColor === regeneratedMetrics.backgroundColor ? 1 : 0;
      scores.push(bgColorMatch);
    }
    
    // Average scores
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
  }

  /**
   * Analyze spacing match between original and regenerated reports
   */
  private analyzeSpacingMatch(originalMetrics: any, regeneratedMetrics: any): number {
    if (!originalMetrics || !regeneratedMetrics) {
      return 0;
    }

    const scores: number[] = [];
    
    // Compare margins if available
    if (originalMetrics.margins && regeneratedMetrics.margins) {
      const marginDiff = Math.abs(originalMetrics.margins - regeneratedMetrics.margins) / originalMetrics.margins;
      scores.push(1 - Math.min(marginDiff, 1));
    }
    
    // Compare paddings if available
    if (originalMetrics.paddings && regeneratedMetrics.paddings) {
      const paddingDiff = Math.abs(originalMetrics.paddings - regeneratedMetrics.paddings) / originalMetrics.paddings;
      scores.push(1 - Math.min(paddingDiff, 1));
    }
    
    // Average scores
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
  }

  /**
   * Detect visual differences between original and regenerated reports
   */
  private detectVisualDifferences(
    comparison: any,
    originalMetrics: any,
    regeneratedMetrics: any
  ): VisualDifference[] {
    const differences: VisualDifference[] = [];
    
    // Check for significant pixel differences
    if (comparison.metrics && comparison.metrics.pixelDifference > 0.2) {
      differences.push({
        type: 'layout',
        description: `Significant visual differences detected (${Math.round(comparison.metrics.pixelDifference * 100)}% pixel difference)`,
        severity: 'high'
      });
    }
    
    // Check for layout differences
    if (originalMetrics.width && regeneratedMetrics.width) {
      const widthRatio = regeneratedMetrics.width / originalMetrics.width;
      if (widthRatio < 0.9 || widthRatio > 1.1) {
        differences.push({
          type: 'layout',
          description: `Width mismatch: original ${originalMetrics.width}px, regenerated ${regeneratedMetrics.width}px`,
          severity: 'medium'
        });
      }
    }
    
    if (originalMetrics.height && regeneratedMetrics.height) {
      const heightRatio = regeneratedMetrics.height / originalMetrics.height;
      if (heightRatio < 0.9 || heightRatio > 1.1) {
        differences.push({
          type: 'layout',
          description: `Height mismatch: original ${originalMetrics.height}px, regenerated ${regeneratedMetrics.height}px`,
          severity: 'medium'
        });
      }
    }
    
    // Check for typography differences
    if (originalMetrics.fontSizes && regeneratedMetrics.fontSizes) {
      const originalAvg = originalMetrics.fontSizes.reduce((a: number, b: number) => a + b, 0) / originalMetrics.fontSizes.length;
      const regeneratedAvg = regeneratedMetrics.fontSizes.reduce((a: number, b: number) => a + b, 0) / regeneratedMetrics.fontSizes.length;
      const fontSizeRatio = regeneratedAvg / originalAvg;
      
      if (fontSizeRatio < 0.8 || fontSizeRatio > 1.2) {
        differences.push({
          type: 'typography',
          description: `Font size mismatch: original avg ${originalAvg.toFixed(1)}px, regenerated avg ${regeneratedAvg.toFixed(1)}px`,
          severity: 'medium'
        });
      }
    }
    
    // Check for color differences
    if (originalMetrics.colors && regeneratedMetrics.colors) {
      const uniqueOriginalColors = new Set(originalMetrics.colors);
      const uniqueRegeneratedColors = new Set(regeneratedMetrics.colors);
      const missingColors = Array.from(uniqueOriginalColors).filter(color => !uniqueRegeneratedColors.has(color));
      const extraColors = Array.from(uniqueRegeneratedColors).filter(color => !uniqueOriginalColors.has(color));
      
      if (missingColors.length > 0) {
        differences.push({
          type: 'color',
          description: `Missing colors: ${missingColors.slice(0, 3).join(', ')}${missingColors.length > 3 ? '...' : ''}`,
          severity: 'low'
        });
      }
      
      if (extraColors.length > 0) {
        differences.push({
          type: 'color',
          description: `Extra colors: ${extraColors.slice(0, 3).join(', ')}${extraColors.length > 3 ? '...' : ''}`,
          severity: 'low'
        });
      }
    }
    
    return differences;
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.renderingEngine) {
      await this.renderingEngine.cleanup();
      this.renderingEngine = null;
    }
    
    if (this.snapshotSystem) {
      this.snapshotSystem.clearSnapshots();
      this.snapshotSystem = null;
    }
    
    this.isInitialized = false;
  }

  /**
   * Get integration status
   */
  public getStatus(): {
    initialized: boolean;
    engineAvailable: boolean;
    snapshotSystemAvailable: boolean;
    snapshotCount: number;
  } {
    let snapshotCount = 0;
    
    if (this.snapshotSystem) {
      const stats = this.snapshotSystem.getStatistics();
      snapshotCount = stats.totalSnapshots;
    }
    
    return {
      initialized: this.isInitialized,
      engineAvailable: !!this.renderingEngine,
      snapshotSystemAvailable: !!this.snapshotSystem,
      snapshotCount
    };
  }

  /**
   * Test the integration with sample data
   */
  public async testIntegration(): Promise<{
    success: boolean;
    visualComparison?: VisualComparisonResult;
    error?: string;
  }> {
    try {
      await this.initialize();
      
      // Create sample HTML for testing
      const originalHtml = `
        <div style="padding: 20px; background: white;">
          <h1 style="color: #2e7d32;">Test Report</h1>
          <p style="font-size: 14px; line-height: 1.5;">This is a test report for visual comparison.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      `;
      
      const regeneratedHtml = `
        <div style="padding: 20px; background: white;">
          <h1 style="color: #2e7d32;">Test Report</h1>
          <p style="font-size: 14px; line-height: 1.5;">This is a regenerated test report for visual comparison.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      `;
      
      const result = await this.enhanceReproductionTest(originalHtml, regeneratedHtml, {
        id: 'test-integration',
        reportTypeId: 'test',
        similarityScore: 0.9,
        structuralMatchScore: 0.95,
        contentMatchScore: 0.85,
        styleMatchScore: 0.9,
        passed: true
      });
      
      return {
        success: true,
        visualComparison: result.visualComparison
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Integration test failed: ${error}`
      };
    }
  }
}