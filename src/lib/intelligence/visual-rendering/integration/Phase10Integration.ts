import type { ReproductionTestResult } from '../../reproduction/ReproductionTestResult';
import { SnapshotCaptureSystem } from '../SnapshotCaptureSystem';
import { VisualRenderingEngine } from '../VisualRenderingEngine';
import { defaultRenderingOptions } from '../types/RenderingOptions';

/**
 * Integrates Phase 10 (Reproduction Tester) with the visual rendering subsystem.
 */
export class Phase10Integration {
  private snapshotCaptureSystem: SnapshotCaptureSystem;
  private renderingEngine: VisualRenderingEngine;

  constructor() {
    this.snapshotCaptureSystem = new SnapshotCaptureSystem();
    this.renderingEngine = new VisualRenderingEngine(defaultRenderingOptions);
  }

  /**
   * Generates visual snapshots for a reproduction test.
   * @param originalReport Original report data (any)
   * @param reproducedReport Reproduced report data (any)
   * @param testResult Optional test result for metadata
   * @returns Object with snapshots
   */
  async generateVisualSnapshots(
    originalReport: any,
    reproducedReport: any,
    testResult?: ReproductionTestResult
  ): Promise<{
    originalSnapshot: any; // VisualSnapshot
    reproducedSnapshot: any;
    diffSnapshot?: any;
  }> {
    // Capture snapshot of original report
    const originalSnapshot = await this.captureSnapshotFromReport(originalReport);
    // Capture snapshot of reproduced report
    const reproducedSnapshot = await this.captureSnapshotFromReport(reproducedReport);
    // Generate diff snapshot
    const diffSnapshot = await this.snapshotCaptureSystem.generateDiffImage(originalSnapshot, reproducedSnapshot);

    return {
      originalSnapshot,
      reproducedSnapshot,
      diffSnapshot
    };
  }

  /**
   * Computes visual similarity score between original and reproduced reports.
   */
  async computeVisualSimilarity(
    originalSnapshot: any,
    reproducedSnapshot: any
  ): Promise<number> {
    const { similarity } = this.snapshotCaptureSystem.compare(originalSnapshot, reproducedSnapshot);
    return similarity;
  }

  /**
   * Updates a reproduction test result with visual similarity data.
   */
  async augmentTestResultWithVisualData(
    testResult: ReproductionTestResult,
    originalReport: any,
    reproducedReport: any
  ): Promise<ReproductionTestResult & { visualSimilarity?: number; visualSnapshots?: any }> {
    const snapshots = await this.generateVisualSnapshots(originalReport, reproducedReport, testResult);
    const visualSimilarity = await this.computeVisualSimilarity(
      snapshots.originalSnapshot,
      snapshots.reproducedSnapshot
    );

    // Return augmented result (extended type)
    return {
      ...testResult,
      visualSimilarity,
      visualSnapshots: {
        original: snapshots.originalSnapshot,
        reproduced: snapshots.reproducedSnapshot,
        diff: snapshots.diffSnapshot
      }
    };
  }

  /**
   * Renders a visual diff report HTML.
   */
  async renderVisualDiffReport(
    originalSnapshot: any,
    reproducedSnapshot: any,
    diffSnapshot: any,
    visualSimilarity?: number
  ): Promise<string> {
    const similarity = visualSimilarity ?? await this.computeVisualSimilarity(originalSnapshot, reproducedSnapshot);
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Visual Diff Report</title>
  <style>
    body { font-family: sans-serif; margin: 2em; }
    .comparison { display: flex; gap: 2em; }
    .column { flex: 1; }
    img { max-width: 100%; border: 1px solid #ccc; }
    .similarity { font-size: 1.2em; margin: 1em 0; }
  </style>
</head>
<body>
  <h1>Visual Reproduction Diff</h1>
  <div class="similarity">
    <strong>Visual Similarity:</strong> ${similarity.toFixed(3)}
  </div>
  <div class="comparison">
    <div class="column">
      <h2>Original</h2>
      <img src="${originalSnapshot.imageData}" alt="Original snapshot" />
    </div>
    <div class="column">
      <h2>Reproduced</h2>
      <img src="${reproducedSnapshot.imageData}" alt="Reproduced snapshot" />
    </div>
    <div class="column">
      <h2>Diff</h2>
      <img src="${diffSnapshot}" alt="Diff snapshot" />
    </div>
  </div>
</body>
</html>`;
  }

  // Private helpers

  private async captureSnapshotFromReport(report: any): Promise<any> {
    // If report is already HTML, capture directly; otherwise render first.
    let html = '';
    if (typeof report === 'string' && report.startsWith('<!DOCTYPE')) {
      html = report;
    } else {
      // Simulate rendering
      html = this.renderingEngine.renderToHTML(report);
    }
    // Use SnapshotCaptureSystem to capture
    return this.snapshotCaptureSystem.capture(html, report.reportId || 'unknown');
  }
}