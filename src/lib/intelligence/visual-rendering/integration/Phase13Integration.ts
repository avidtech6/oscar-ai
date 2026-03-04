import type { WorkflowProfile } from '../../workflow-learning/WorkflowProfile';
import { VisualRenderingEngine } from '../VisualRenderingEngine';
import { CSSLayoutEngine } from '../CSSLayoutEngine';
import { HeaderFooterSystem } from '../HeaderFooterSystem';
import { CoverPageGenerator } from '../CoverPageGenerator';
import { PageBreakLogic } from '../PageBreakLogic';
import { defaultRenderingOptions } from '../types/RenderingOptions';
import { defaultA4PortraitLayout } from '../types/PageLayout';

/**
 * Integrates Phase 13 (User Workflow Learning) with the visual rendering subsystem.
 */
export class Phase13Integration {
  private renderingEngine: VisualRenderingEngine;
  private cssLayoutEngine: CSSLayoutEngine;
  private headerFooterSystem: HeaderFooterSystem;
  private coverPageGenerator: CoverPageGenerator;
  private pageBreakLogic: PageBreakLogic;

  constructor() {
    this.renderingEngine = new VisualRenderingEngine(defaultRenderingOptions);
    this.cssLayoutEngine = new CSSLayoutEngine(defaultA4PortraitLayout);
    this.headerFooterSystem = new HeaderFooterSystem();
    this.coverPageGenerator = new CoverPageGenerator();
    this.pageBreakLogic = new PageBreakLogic();
  }

  /**
   * Adapts rendering behavior based on a user's workflow profile.
   * @param profile WorkflowProfile from Phase 13
   * @param renderingOptions Current rendering options (will be modified)
   * @returns Adapted rendering options
   */
  adaptRenderingToWorkflow(
    profile: WorkflowProfile,
    renderingOptions: any
  ): any {
    const adapted = { ...renderingOptions };

    // Adapt based on common section order
    if (profile.commonSectionOrder?.length) {
      // Could reorder sections in the template before rendering
      adapted.sectionOrder = profile.commonSectionOrder;
    }

    // Adapt based on common omissions
    if (profile.commonOmissions?.length) {
      // Optionally hide or collapse commonly omitted sections
      adapted.hideOmittedSections = true;
    }

    // Adapt based on preferred interaction patterns
    if (profile.preferredInteractionPatterns?.length) {
      // Could add keyboard shortcuts to the preview window
      adapted.enableShortcuts = true;
    }

    // Adapt based on typical data sources
    if (profile.typicalDataSources?.includes('AI generation')) {
      // Could adjust AI guidance prompts in the template
      adapted.aiGuidanceLevel = 'high';
    }

    return adapted;
  }

  /**
   * Learns user layout preferences from a rendered document.
   * @param renderedHTML HTML of the rendered document
   * @param userInteractions Array of interaction events (clicks, scrolls, etc.)
   * @returns Partial WorkflowProfile with layout preferences (extended)
   */
  learnLayoutPreferences(
    renderedHTML: string,
    userInteractions: Array<{ type: string; target: string; timestamp: number }>
  ): Partial<WorkflowProfile> & { layoutPreferences?: any } {
    // Analyze HTML structure to infer layout preferences
    const prefersGrid = renderedHTML.includes('class="grid"');
    const prefersFlexbox = renderedHTML.includes('class="flex"');
    const prefersSidebar = renderedHTML.includes('class="sidebar"');
    const prefersTwoColumn = renderedHTML.includes('class="two-column"');

    // Analyze interactions
    const clicksOnImages = userInteractions.filter(i => i.type === 'click' && i.target.includes('img')).length;
    const scrollDepth = userInteractions.filter(i => i.type === 'scroll').length;

    return {
      // Extend with custom layout preferences (not part of original WorkflowProfile)
      layoutPreferences: {
        prefersGrid,
        prefersFlexbox,
        prefersSidebar,
        prefersTwoColumn,
        imageInteractionFrequency: clicksOnImages,
        averageScrollDepth: scrollDepth / Math.max(userInteractions.length, 1)
      }
    };
  }

  /**
   * Applies workflow‑learned preferences to a rendering engine.
   */
  applyPreferencesToRenderingEngine(
    profile: WorkflowProfile,
    renderingEngine: VisualRenderingEngine
  ): void {
    const options = renderingEngine.getOptions();

    // Adjust CSS theme based on layout preferences (if we have them)
    // (We could infer from commonSectionOrder or typicalDataSources)
    if (profile.commonSectionOrder?.length > 5) {
      // More sections might indicate preference for structured layout
      options.cssTheme = 'professional';
    }

    // Adjust header/footer visibility based on common omissions
    if (profile.commonOmissions?.includes('header')) {
      options.includeHeaderFooter = false;
    }

    // Adjust cover page inclusion
    if (profile.commonOmissions?.includes('cover')) {
      options.includeCoverPage = false;
    }

    renderingEngine.updateOptions(options);
  }

  /**
   * Generates a rendering‑focused workflow report.
   */
  generateRenderingWorkflowReport(profile: WorkflowProfile): string {
    return `
# Rendering Workflow Analysis

## User Preferences
- **Common section order:** ${profile.commonSectionOrder?.join(' → ') || 'Default'}
- **Common omissions:** ${profile.commonOmissions?.join(', ') || 'None'}
- **Common corrections:** ${profile.commonCorrections?.join(', ') || 'None'}
- **Preferred interaction patterns:** ${profile.preferredInteractionPatterns?.join(', ') || 'None'}
- **Typical data sources:** ${profile.typicalDataSources?.join(', ') || 'None'}
- **Workflow heuristics:** ${Object.keys(profile.workflowHeuristics).length} rules
- **Confidence score:** ${profile.confidenceScore.toFixed(2)}

## Recommended Rendering Adjustments
1. ${profile.commonOmissions?.includes('header') ? 'Hide headers' : 'Show headers'}
2. ${profile.commonSectionOrder?.length ? 'Reorder sections according to common sequence' : 'Keep default section order'}
3. ${profile.preferredInteractionPatterns?.length ? 'Enable keyboard shortcuts in preview' : 'Disable keyboard shortcuts'}
4. ${profile.typicalDataSources?.includes('AI generation') ? 'Increase AI guidance prominence' : 'Keep standard AI guidance'}

## Timestamps
- Created: ${profile.timestamps.created.toLocaleString()}
- Updated: ${profile.timestamps.updated.toLocaleString()}
- Last observed: ${profile.timestamps.lastObserved.toLocaleString()}
`;
  }
}