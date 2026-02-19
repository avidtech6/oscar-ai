/**
 * PDF Font Extractor
 * 
 * Extracts font families, sizes, weights, and styles from PDF files,
 * and analyzes typography patterns.
 */

import type {
  PDFParsingOptions,
  PDFStyleInfo,
} from './types';

export class PDFFontExtractor {
  private options: PDFParsingOptions;
  private isInitialized = false;
  private fontCache = new Map<string, PDFStyleInfo>();

  constructor(options: PDFParsingOptions) {
    this.options = options;
  }

  /**
   * Initialize the font extractor
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing PDF Font Extractor...');
    
    // Initialize font cache with common fonts
    this.initializeFontCache();
    
    this.isInitialized = true;
    console.log('PDF Font Extractor initialized');
  }

  /**
   * Initialize font cache with common fonts
   */
  private initializeFontCache(): void {
    const commonFonts = [
      this.createStyleInfo('Helvetica', 11, 'normal', 'normal', '#000000', 1.2, 0, 'left'),
      this.createStyleInfo('Helvetica', 11, 'bold', 'normal', '#000000', 1.2, 0, 'left'),
      this.createStyleInfo('Helvetica', 11, 'normal', 'italic', '#000000', 1.2, 0, 'left'),
      this.createStyleInfo('Helvetica', 16, 'bold', 'normal', '#000000', 1.3, 0, 'center'),
      this.createStyleInfo('Helvetica', 14, 'bold', 'normal', '#000000', 1.25, 0, 'left'),
      this.createStyleInfo('Times New Roman', 12, 'normal', 'normal', '#000000', 1.5, 0, 'justify'),
      this.createStyleInfo('Times New Roman', 12, 'bold', 'normal', '#000000', 1.5, 0, 'justify'),
      this.createStyleInfo('Courier New', 10, 'normal', 'normal', '#000000', 1.0, 0, 'left'),
      this.createStyleInfo('Arial', 11, 'normal', 'normal', '#000000', 1.2, 0, 'left'),
    ];
    
    commonFonts.forEach(font => {
      const key = this.getFontKey(font);
      this.fontCache.set(key, font);
    });
  }

  /**
   * Extract fonts and styles from a specific page
   */
  async extractStyles(
    pdfBuffer: Buffer,
    pageNumber: number
  ): Promise<PDFStyleInfo[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`Extracting fonts and styles from page ${pageNumber}...`);
    
    try {
      // In a real implementation, we would extract actual font data from PDF
      // For now, return simulated font extraction
      return this.simulateFontExtraction(pageNumber);
    } catch (error) {
      console.error(`Failed to extract fonts from page ${pageNumber}:`, error);
      return this.getDefaultStyles();
    }
  }

  /**
   * Simulate font extraction (for development/testing)
   */
  private simulateFontExtraction(pageNumber: number): PDFStyleInfo[] {
    const styles: PDFStyleInfo[] = [];
    
    if (pageNumber === 1) {
      // Cover page styles
      styles.push(
        this.createStyleInfo(
          'Helvetica',
          24,
          'bold',
          'normal',
          '#000000',
          1.3,
          0,
          'center',
          ['title']
        ),
        this.createStyleInfo(
          'Helvetica',
          14,
          'normal',
          'normal',
          '#333333',
          1.4,
          0,
          'center',
          ['subtitle', 'author']
        ),
        this.createStyleInfo(
          'Helvetica',
          12,
          'normal',
          'normal',
          '#666666',
          1.2,
          0,
          'center',
          ['date', 'version']
        )
      );
    } else {
      // Regular page styles
      styles.push(
        this.createStyleInfo(
          'Helvetica',
          16,
          'bold',
          'normal',
          '#000000',
          1.3,
          0,
          'left',
          [`heading-${pageNumber}-1`, `heading-${pageNumber}-2`]
        ),
        this.createStyleInfo(
          'Helvetica',
          14,
          'bold',
          'normal',
          '#000000',
          1.25,
          0,
          'left',
          [`subheading-${pageNumber}-1`]
        ),
        this.createStyleInfo(
          'Helvetica',
          11,
          'normal',
          'normal',
          '#000000',
          1.5,
          0,
          'justify',
          Array.from({ length: 5 }, (_, i) => `paragraph-${pageNumber}-${i}`)
        ),
        this.createStyleInfo(
          'Helvetica',
          11,
          'normal',
          'italic',
          '#333333',
          1.5,
          0,
          'justify',
          [`quote-${pageNumber}`]
        ),
        this.createStyleInfo(
          'Courier New',
          10,
          'normal',
          'normal',
          '#000000',
          1.0,
          0,
          'left',
          [`code-${pageNumber}`]
        )
      );
      
      // Add table styles for page 3
      if (pageNumber === 3) {
        styles.push(
          this.createStyleInfo(
            'Helvetica',
            11,
            'bold',
            'normal',
            '#000000',
            1.2,
            0,
            'center',
            [`table-header-${pageNumber}`]
          ),
          this.createStyleInfo(
            'Helvetica',
            10,
            'normal',
            'normal',
            '#000000',
            1.2,
            0,
            'center',
            [`table-cell-${pageNumber}`]
          )
        );
      }
    }
    
    // Calculate usage statistics
    return this.calculateUsageStatistics(styles);
  }

  /**
   * Create a style info object
   */
  private createStyleInfo(
    fontFamily: string,
    fontSize: number,
    fontWeight: PDFStyleInfo['fontWeight'],
    fontStyle: PDFStyleInfo['fontStyle'],
    color: string,
    lineHeight: number,
    letterSpacing: number,
    textAlign: PDFStyleInfo['textAlign'],
    elementIds: string[] = []
  ): PDFStyleInfo {
    const key = this.getFontKey({
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      color,
      lineHeight,
      letterSpacing,
      textAlign,
    });
    
    // Check if font exists in cache
    let styleInfo: PDFStyleInfo;
    if (this.fontCache.has(key)) {
      styleInfo = this.fontCache.get(key)!;
    } else {
      styleInfo = {
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        color,
        lineHeight,
        letterSpacing,
        textAlign,
        usage: {
          count: 0,
          percentage: 0,
          elements: [],
        },
      };
      this.fontCache.set(key, styleInfo);
    }
    
    // Update element IDs
    styleInfo.usage.elements = [...styleInfo.usage.elements, ...elementIds];
    styleInfo.usage.count += elementIds.length;
    
    return { ...styleInfo }; // Return a copy
  }

  /**
   * Calculate usage statistics for styles
   */
  private calculateUsageStatistics(styles: PDFStyleInfo[]): PDFStyleInfo[] {
    if (styles.length === 0) {
      return styles;
    }
    
    // Count total elements
    const totalElements = styles.reduce((sum, style) => sum + style.usage.elements.length, 0);
    
    // Calculate percentages
    return styles.map(style => ({
      ...style,
      usage: {
        ...style.usage,
        percentage: totalElements > 0 ? (style.usage.elements.length / totalElements) * 100 : 0,
      },
    }));
  }

  /**
   * Get a unique key for a font style
   */
  private getFontKey(style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: PDFStyleInfo['fontWeight'];
    fontStyle: PDFStyleInfo['fontStyle'];
    color: string;
    lineHeight: number;
    letterSpacing: number;
    textAlign: PDFStyleInfo['textAlign'];
  }): string {
    return `${style.fontFamily}-${style.fontSize}-${style.fontWeight}-${style.fontStyle}-${style.color}-${style.lineHeight}-${style.letterSpacing}-${style.textAlign}`;
  }

  /**
   * Analyze font usage patterns
   */
  analyzeFontPatterns(styles: PDFStyleInfo[]): {
    primaryFont: PDFStyleInfo | null;
    headingFont: PDFStyleInfo | null;
    bodyFont: PDFStyleInfo | null;
    accentFont: PDFStyleInfo | null;
    fontHierarchy: Array<{ style: PDFStyleInfo; level: number }>;
  } {
    if (styles.length === 0) {
      return {
        primaryFont: null,
        headingFont: null,
        bodyFont: null,
        accentFont: null,
        fontHierarchy: [],
      };
    }
    
    // Sort by usage count
    const sortedStyles = [...styles].sort((a, b) => b.usage.count - a.usage.count);
    
    // Identify fonts by type
    const primaryFont = sortedStyles[0] || null;
    
    const headingFont = sortedStyles.find(style => 
      style.fontSize >= 14 || style.fontWeight === 'bold'
    ) || primaryFont;
    
    const bodyFont = sortedStyles.find(style => 
      style.fontSize >= 10 && style.fontSize <= 12 && style.fontWeight === 'normal'
    ) || primaryFont;
    
    const accentFont = sortedStyles.find(style => 
      style.fontStyle === 'italic' || style.color !== '#000000'
    ) || null;
    
    // Create font hierarchy
    const fontHierarchy = sortedStyles.map((style, index) => ({
      style,
      level: this.calculateFontLevel(style),
    })).sort((a, b) => b.level - a.level);
    
    return {
      primaryFont,
      headingFont,
      bodyFont,
      accentFont,
      fontHierarchy,
    };
  }

  /**
   * Calculate font hierarchy level
   */
  private calculateFontLevel(style: PDFStyleInfo): number {
    let level = 0;
    
    // Size contributes most
    if (style.fontSize >= 20) level += 3;
    else if (style.fontSize >= 16) level += 2;
    else if (style.fontSize >= 14) level += 1;
    
    // Weight contributes
    if (style.fontWeight === 'bold') level += 2;
    else if (style.fontWeight === 'semibold') level += 1;
    
    // Style contributes
    if (style.fontStyle === 'italic') level += 0.5;
    
    // Color contributes (non-black is often accent)
    if (style.color !== '#000000') level += 0.5;
    
    return level;
  }

  /**
   * Detect font families in PDF
   */
  private detectFontFamilies(pdfBuffer: Buffer, pageNumber: number): string[] {
    // In a real implementation, extract actual font names from PDF
    // For now, return common fonts
    return ['Helvetica', 'Times New Roman', 'Courier New', 'Arial'];
  }

  /**
   * Get default styles (fallback)
   */
  private getDefaultStyles(): PDFStyleInfo[] {
    return [
      this.createStyleInfo('Helvetica', 11, 'normal', 'normal', '#000000', 1.2, 0, 'left', ['default']),
    ];
  }

  /**
   * Update extraction options
   */
  updateOptions(newOptions: PDFParsingOptions): void {
    this.options = newOptions;
    console.log('PDF Font Extractor options updated');
  }

  /**
   * Get font cache statistics
   */
  getFontCacheStats(): {
    totalFonts: number;
    fontFamilies: string[];
    mostUsedFont: string | null;
  } {
    const fontFamilies = Array.from(new Set(
      Array.from(this.fontCache.values()).map(font => font.fontFamily)
    ));
    
    let mostUsedFont: string | null = null;
    let maxCount = 0;
    
    this.fontCache.forEach((font, key) => {
      if (font.usage.count > maxCount) {
        maxCount = font.usage.count;
        mostUsedFont = font.fontFamily;
      }
    });
    
    return {
      totalFonts: this.fontCache.size,
      fontFamilies,
      mostUsedFont,
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up PDF Font Extractor resources...');
    this.fontCache.clear();
    this.isInitialized = false;
  }
}