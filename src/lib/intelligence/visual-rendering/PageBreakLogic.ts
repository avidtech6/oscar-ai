/**
 * Page break detection options.
 */
export interface PageBreakOptions {
  /** Maximum content height per page (in CSS units, e.g., '270mm') */
  maxPageHeight: string;
  /** Whether to avoid widows (single line at top of page) */
  avoidWidows: boolean;
  /** Whether to avoid orphans (single line at bottom of page) */
  avoidOrphans: boolean;
  /** Minimum lines to keep together */
  minLinesTogether: number;
  /** Whether to insert manual page breaks before certain elements (e.g., h1) */
  insertBeforeHeadings: boolean;
  /** Whether to keep tables together */
  keepTablesTogether: boolean;
  /** Whether to keep images with captions together */
  keepFiguresTogether: boolean;
}

/**
 * Default page break options.
 */
export const defaultPageBreakOptions: PageBreakOptions = {
  maxPageHeight: '270mm',
  avoidWidows: true,
  avoidOrphans: true,
  minLinesTogether: 3,
  insertBeforeHeadings: true,
  keepTablesTogether: true,
  keepFiguresTogether: true
};

/**
 * Page break logic that handles automatic page break detection, manual page break insertion, and widow/orphan control.
 */
export class PageBreakLogic {
  private options: PageBreakOptions;

  constructor(options: Partial<PageBreakOptions> = {}) {
    this.options = { ...defaultPageBreakOptions, ...options };
  }

  /**
   * Inserts page breaks into HTML content based on content height and rules.
   * @param html HTML content (without page breaks)
   * @returns HTML with inserted page‑break elements
   */
  insertPageBreaks(html: string): string {
    // This is a simplified placeholder implementation.
    // In a real implementation you would parse the HTML, compute rendered heights, and insert <div class="page-break"> accordingly.
    let processed = html;

    // Insert page breaks before h1 if configured
    if (this.options.insertBeforeHeadings) {
      processed = processed.replace(/<h1[^>]*>/gi, '<div class="page-break"></div>$&');
    }

    // Add a page‑break‑avoid class to tables and figures if configured
    if (this.options.keepTablesTogether) {
      processed = processed.replace(/<table[^>]*>/gi, '<table class="avoid-break">');
    }
    if (this.options.keepFiguresTogether) {
      processed = processed.replace(/<figure[^>]*>/gi, '<figure class="avoid-break">');
    }

    return processed;
  }

  /**
   * Detects where page breaks would naturally occur given the content height.
   * Returns an array of indices (character positions) where breaks should be inserted.
   */
  detectNaturalBreaks(html: string): number[] {
    // Placeholder: simulate detection by splitting after every 2000 characters
    const breaks: number[] = [];
    const chunkSize = 2000;
    for (let i = chunkSize; i < html.length; i += chunkSize) {
      breaks.push(i);
    }
    return breaks;
  }

  /**
   * Ensures widows and orphans are avoided by adjusting line counts.
   * @param html HTML content
   * @returns Adjusted HTML
   */
  protectWidowsAndOrphans(html: string): string {
    if (!this.options.avoidWidows && !this.options.avoidOrphans) return html;

    // This is a placeholder; a real implementation would need to understand line‑level rendering.
    // For now we just add CSS rules that encourage keeping lines together.
    const style = `
<style>
  .widow-orphan-protection p {
    orphans: ${this.options.minLinesTogether};
    widows: ${this.options.minLinesTogether};
  }
</style>`;
    return style + '<div class="widow-orphan-protection">' + html + '</div>';
  }

  /**
   * Updates page break options.
   */
  updateOptions(newOptions: Partial<PageBreakOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Returns current options.
   */
  getOptions(): PageBreakOptions {
    return { ...this.options };
  }

  /**
   * Generates CSS for page break control.
   */
  generatePageBreakCSS(): string {
    return `
.page-break {
  page-break-before: always;
  break-before: page;
}
.avoid-break {
  page-break-inside: avoid;
  break-inside: avoid;
}
.keep-with-next {
  page-break-after: avoid;
  break-after: avoid;
}
.keep-with-previous {
  page-break-before: avoid;
  break-before: avoid;
}
@media print {
  .page-break {
    margin-top: 0;
    padding-top: 0;
  }
}`;
  }
}