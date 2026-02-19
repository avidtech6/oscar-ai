/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * CSS Layout Engine
 * 
 * Responsible for generating CSS styles based on rendering options,
 * calculating layouts, and managing responsive design.
 */

import type {
  RenderingOptions,
  PageLayout,
  TypographyOptions,
  SpacingOptions,
  ColorScheme,
  ContentElement,
  PageContent,
  PageSize
} from '../types';

/**
 * CSS unit types
 */
export type CSSUnit = 'px' | 'em' | 'rem' | 'pt' | 'mm' | 'cm' | 'in' | '%' | 'vw' | 'vh';

/**
 * CSS property value
 */
export interface CSSProperty {
  name: string;
  value: string;
  important?: boolean;
  mediaQuery?: string;
}

/**
 * CSS rule
 */
export interface CSSRule {
  selector: string;
  properties: CSSProperty[];
  mediaQuery?: string;
  children?: CSSRule[];
}

/**
 * CSS stylesheet
 */
export interface CSSStylesheet {
  rules: CSSRule[];
  mediaQueries: Record<string, CSSRule[]>;
  variables: Record<string, string>;
  imports: string[];
}

/**
 * Layout calculation result
 */
export interface LayoutCalculation {
  width: number;
  height: number;
  unit: CSSUnit;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentWidth: number;
  contentHeight: number;
  overflow: boolean;
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/**
 * Element layout information
 */
export interface ElementLayout {
  element: ContentElement;
  computedStyles: Record<string, string>;
  position: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  display: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  float?: 'left' | 'right' | 'none';
  clear?: 'left' | 'right' | 'both' | 'none';
  overflow: 'visible' | 'hidden' | 'scroll' | 'auto';
  pageBreak?: 'auto' | 'always' | 'avoid' | 'left' | 'right';
}

/**
 * CSS Layout Engine
 */
export class CSSLayoutEngine {
  private options: RenderingOptions;
  private cache: Map<string, CSSRule[]> = new Map();
  private variables: Map<string, string> = new Map();
  
  constructor(options: RenderingOptions) {
    this.options = options;
    this.initializeVariables();
  }
  
  /**
   * Initialize CSS variables from options
   */
  private initializeVariables(): void {
    const { typography, spacing, colors, layout } = this.options;
    
    // Typography variables
    this.variables.set('--font-family', typography.fontFamily);
    this.variables.set('--font-size', `${typography.fontSize}pt`);
    this.variables.set('--line-height', typography.lineHeight.toString());
    this.variables.set('--font-weight', typography.fontWeight);
    this.variables.set('--font-color', typography.fontColor);
    
    if (typography.headingFontFamily) {
      this.variables.set('--heading-font-family', typography.headingFontFamily);
    }
    this.variables.set('--heading-font-size-multiplier', typography.headingFontSizeMultiplier.toString());
    
    // Spacing variables
    this.variables.set('--paragraph-spacing', `${spacing.paragraphSpacing}pt`);
    this.variables.set('--section-spacing', `${spacing.sectionSpacing}pt`);
    this.variables.set('--indent-size', `${spacing.indentSize}pt`);
    this.variables.set('--list-item-spacing', `${spacing.listItemSpacing}pt`);
    
    // Color variables
    this.variables.set('--color-primary', colors.primary);
    this.variables.set('--color-secondary', colors.secondary);
    this.variables.set('--color-accent', colors.accent);
    this.variables.set('--color-background', colors.background);
    this.variables.set('--color-text', colors.text);
    this.variables.set('--color-headings', colors.headings);
    this.variables.set('--color-borders', colors.borders);
    
    // Layout variables
    this.variables.set('--page-width', this.getPageWidth());
    this.variables.set('--page-height', this.getPageHeight());
    this.variables.set('--margin-top', `${layout.margins.top}mm`);
    this.variables.set('--margin-right', `${layout.margins.right}mm`);
    this.variables.set('--margin-bottom', `${layout.margins.bottom}mm`);
    this.variables.set('--margin-left', `${layout.margins.left}mm`);
  }
  
  /**
   * Get page width in CSS units
   */
  private getPageWidth(): string {
    const { layout } = this.options;
    
    if (layout.size === 'Custom' && layout.customWidth) {
      return `${layout.customWidth}mm`;
    }
    
    const sizes: Record<PageSize, number> = {
      A4: 210,
      A3: 297,
      Letter: 215.9,
      Legal: 215.9,
      Custom: 0
    };
    
    let width = sizes[layout.size];
    
    if (layout.orientation === 'landscape') {
      // For landscape, swap width/height from portrait dimensions
      const heightMap: Record<PageSize, number> = {
        A4: 297,
        A3: 420,
        Letter: 279.4,
        Legal: 355.6,
        Custom: 0
      };
      width = heightMap[layout.size];
    }
    
    return `${width}mm`;
  }
  
  /**
   * Get page height in CSS units
   */
  private getPageHeight(): string {
    const { layout } = this.options;
    
    if (layout.size === 'Custom' && layout.customHeight) {
      return `${layout.customHeight}mm`;
    }
    
    const sizes: Record<PageSize, number> = {
      A4: 297,
      A3: 420,
      Letter: 279.4,
      Legal: 355.6,
      Custom: 0
    };
    
    let height = sizes[layout.size];
    
    if (layout.orientation === 'landscape') {
      // For landscape, swap width/height from portrait dimensions
      const widthMap: Record<PageSize, number> = {
        A4: 210,
        A3: 297,
        Letter: 215.9,
        Legal: 215.9,
        Custom: 0
      };
      height = widthMap[layout.size];
    }
    
    return `${height}mm`;
  }
  
  /**
   * Generate complete CSS stylesheet
   */
  public generateStylesheet(): CSSStylesheet {
    const rules: CSSRule[] = [];
    
    // Reset and base styles
    rules.push(...this.generateResetStyles());
    
    // Page styles
    rules.push(...this.generatePageStyles());
    
    // Typography styles
    rules.push(...this.generateTypographyStyles());
    
    // Element styles
    rules.push(...this.generateElementStyles());
    
    // Layout styles
    rules.push(...this.generateLayoutStyles());
    
    // Responsive styles
    const mediaQueries = this.generateMediaQueries();
    
    // CSS variables
    const variables = this.generateCSSVariables();
    
    return {
      rules,
      mediaQueries,
      variables,
      imports: this.generateImports()
    };
  }
  
  /**
   * Generate CSS as string
   */
  public generateCSS(): string {
    const stylesheet = this.generateStylesheet();
    let css = '';
    
    // Add imports
    for (const importStatement of stylesheet.imports) {
      css += `@import ${importStatement};\n`;
    }
    
    // Add CSS variables
    if (Object.keys(stylesheet.variables).length > 0) {
      css += ':root {\n';
      for (const [name, value] of Object.entries(stylesheet.variables)) {
        css += `  ${name}: ${value};\n`;
      }
      css += '}\n\n';
    }
    
    // Add rules
    for (const rule of stylesheet.rules) {
      css += this.ruleToString(rule) + '\n';
    }
    
    // Add media queries
    for (const [query, rules] of Object.entries(stylesheet.mediaQueries)) {
      css += `@media ${query} {\n`;
      for (const rule of rules) {
        css += '  ' + this.ruleToString(rule).replace(/\n/g, '\n  ') + '\n';
      }
      css += '}\n\n';
    }
    
    return css.trim();
  }
  
  /**
   * Convert CSS rule to string
   */
  private ruleToString(rule: CSSRule): string {
    let ruleString = rule.selector + ' {\n';
    
    for (const property of rule.properties) {
      const important = property.important ? ' !important' : '';
      ruleString += `  ${property.name}: ${property.value}${important};\n`;
    }
    
    ruleString += '}';
    
    return ruleString;
  }
  
  /**
   * Generate reset styles
   */
  private generateResetStyles(): CSSRule[] {
    return [
      {
        selector: '*',
        properties: [
          { name: 'box-sizing', value: 'border-box' },
          { name: 'margin', value: '0' },
          { name: 'padding', value: '0' }
        ]
      },
      {
        selector: 'html, body',
        properties: [
          { name: 'width', value: '100%' },
          { name: 'height', value: '100%' },
          { name: 'font-family', value: 'var(--font-family)' },
          { name: 'font-size', value: 'var(--font-size)' },
          { name: 'line-height', value: 'var(--line-height)' },
          { name: 'color', value: 'var(--font-color)' }
        ]
      }
    ];
  }
  
  /**
   * Generate page styles
   */
  private generatePageStyles(): CSSRule[] {
    const { layout, header, footer } = this.options;
    
    return [
      {
        selector: '.page',
        properties: [
          { name: 'width', value: 'var(--page-width)' },
          { name: 'height', value: 'var(--page-height)' },
          { name: 'margin', value: '0 auto' },
          { name: 'padding', value: 'var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left)' },
          { name: 'background-color', value: 'var(--color-background)' },
          { name: 'position', value: 'relative' },
          { name: 'page-break-inside', value: 'avoid' },
          { name: 'page-break-after', value: 'always' }
        ]
      },
      {
        selector: '.page:last-child',
        properties: [
          { name: 'page-break-after', value: 'auto' }
        ]
      },
      {
        selector: '.page-content',
        properties: [
          { name: 'width', value: '100%' },
          { name: 'height', value: 'calc(100% - var(--margin-top) - var(--margin-bottom))' },
          { name: 'position', value: 'relative' }
        ]
      },
      {
        selector: '.page-header',
        properties: [
          { name: 'position', value: 'absolute' },
          { name: 'top', value: '0' },
          { name: 'left', value: '0' },
          { name: 'right', value: '0' },
          { name: 'height', value: `${header.height}mm` },
          { name: 'padding', value: '0 var(--margin-right) 0 var(--margin-left)' }
        ]
      },
      {
        selector: '.page-footer',
        properties: [
          { name: 'position', value: 'absolute' },
          { name: 'bottom', value: '0' },
          { name: 'left', value: '0' },
          { name: 'right', value: '0' },
          { name: 'height', value: `${footer.height}mm` },
          { name: 'padding', value: '0 var(--margin-right) 0 var(--margin-left)' }
        ]
      }
    ];
  }
  
  /**
   * Generate typography styles
   */
  private generateTypographyStyles(): CSSRule[] {
    const { typography } = this.options;
    const rules: CSSRule[] = [];
    
    // Base text styles
    rules.push({
      selector: 'p',
      properties: [
        { name: 'margin-bottom', value: 'var(--paragraph-spacing)' },
        { name: 'text-align', value: 'justify' }
      ]
    });
    
    // Heading styles
    for (let level = 1; level <= 6; level++) {
      const fontSizeMultiplier = Math.pow(typography.headingFontSizeMultiplier, 7 - level);
      const fontSize = `calc(var(--font-size) * ${fontSizeMultiplier})`;
      
      rules.push({
        selector: `h${level}`,
        properties: [
          { name: 'font-family', value: 'var(--heading-font-family, var(--font-family))' },
          { name: 'font-size', value: fontSize },
          { name: 'font-weight', value: 'bold' },
          { name: 'color', value: 'var(--color-headings)' },
          { name: 'margin-top', value: `calc(var(--section-spacing) * ${1.5 - (level * 0.1)})` },
          { name: 'margin-bottom', value: `calc(var(--paragraph-spacing) * ${1.2 - (level * 0.1)})` },
          { name: 'page-break-after', value: 'avoid' }
        ]
      });
    }
    
    // Text formatting
    rules.push(
      {
        selector: 'strong, b',
        properties: [
          { name: 'font-weight', value: 'bold' }
        ]
      },
      {
        selector: 'em, i',
        properties: [
          { name: 'font-style', value: 'italic' }
        ]
      },
      {
        selector: 'u',
        properties: [
          { name: 'text-decoration', value: 'underline' }
        ]
      },
      {
        selector: 's, del',
        properties: [
          { name: 'text-decoration', value: 'line-through' }
        ]
      }
    );
    
    return rules;
  }
  
  /**
   * Calculate layout for a page
   */
  public calculatePageLayout(pageContent: PageContent): LayoutCalculation {
    const { layout } = this.options;
    
    // Convert page dimensions to pixels (assuming 96 DPI)
    const mmToPixels = (mm: number) => Math.round((mm / 25.4) * 96);
    
    const pageWidth = mmToPixels(parseFloat(this.getPageWidth().replace('mm', '')));
    const pageHeight = mmToPixels(parseFloat(this.getPageHeight().replace('mm', '')));
    
    const marginTop = mmToPixels(layout.margins.top);
    const marginRight = mmToPixels(layout.margins.right);
    const marginBottom = mmToPixels(layout.margins.bottom);
    const marginLeft = mmToPixels(layout.margins.left);
    
    const contentWidth = pageWidth - marginLeft - marginRight;
    const contentHeight = pageHeight - marginTop - marginBottom;
    
    // Calculate if content overflows
    let totalContentHeight = 0;
    for (const element of pageContent.content) {
      // Simplified height calculation
      totalContentHeight += 20; // Approximate line height
    }
    
    const overflow = totalContentHeight > contentHeight;
    
    // Define breakpoints for responsive design
    const breakpoints = {
      xs: 480,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1536
    };
    
    return {
      width: pageWidth,
      height: pageHeight,
      unit: 'px',
      margins: {
        top: marginTop,
        right: marginRight,
        bottom: marginBottom,
        left: marginLeft
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      contentWidth,
      contentHeight,
      overflow,
      breakpoints
    };
  }
  
  /**
   * Calculate layout for an element
   */
  public calculateElementLayout(element: ContentElement): ElementLayout {
    const defaultStyles = this.getElementDefaultStyles(element);
    
    return {
      element,
      computedStyles: defaultStyles,
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      dimensions: {
        width: 100, // Default width percentage
        height: 20, // Default line height
        minWidth: 0,
        minHeight: 0,
        maxWidth: 100, // 100% by default
        maxHeight: undefined
      },
      margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      display: 'block',
      float: 'none',
      clear: 'none',
      overflow: 'visible',
      pageBreak: 'auto'
    };
  }
  
  /**
   * Get default styles for an element type
   */
  private getElementDefaultStyles(element: ContentElement): Record<string, string> {
    const styles: Record<string, string> = {};
    
    switch (element.type) {
      case 'text':
        styles.fontFamily = 'var(--font-family)';
        styles.fontSize = 'var(--font-size)';
        styles.color = 'var(--font-color)';
        break;
        
      case 'heading':
        const headingElement = element as any;
        const level = headingElement.level || 1;
        const fontSizeMultiplier = Math.pow(this.options.typography.headingFontSizeMultiplier, 7 - level);
        styles.fontSize = `calc(var(--font-size) * ${fontSizeMultiplier})`;
        styles.fontWeight = 'bold';
        styles.color = 'var(--color-headings)';
        styles.marginTop = `calc(var(--section-spacing) * ${1.5 - (level * 0.1)})`;
        styles.marginBottom = `calc(var(--paragraph-spacing) * ${1.2 - (level * 0.1)})`;
        break;
        
      case 'paragraph':
        styles.marginBottom = 'var(--paragraph-spacing)';
        styles.textAlign = 'justify';
        break;
        
      case 'list':
        styles.margin = 'var(--paragraph-spacing) 0';
        styles.paddingLeft = 'var(--indent-size)';
        break;
        
      case 'image':
        styles.maxWidth = '100%';
        styles.height = 'auto';
        styles.display = 'block';
        styles.margin = 'var(--paragraph-spacing) auto';
        break;
        
      case 'table':
        styles.width = '100%';
        styles.borderCollapse = 'collapse';
        styles.margin = 'var(--paragraph-spacing) 0';
        break;
        
      default:
        // Default styles
        styles.fontFamily = 'var(--font-family)';
        styles.fontSize = 'var(--font-size)';
        styles.color = 'var(--font-color)';
    }
    
    // Apply custom styles from element
    if (element.style) {
      Object.assign(styles, element.style);
    }
    
    return styles;
  }
  
  /**
   * Update options and regenerate variables
   */
  public updateOptions(newOptions: Partial<RenderingOptions>): void {
    // Merge new options with existing
    const mergedOptions = { ...this.options, ...newOptions };
    this.options = mergedOptions;
    
    // Clear cache
    this.cache.clear();
    
    // Reinitialize variables
    this.initializeVariables();
  }
  
  /**
   * Get CSS variable value
   */
  public getVariable(name: string): string | undefined {
    return this.variables.get(name);
  }
  
  /**
   * Set CSS variable value
   */
  public setVariable(name: string, value: string): void {
    this.variables.set(name, value);
    this.cache.clear(); // Clear cache since variables changed
  }
  
  /**
   * Clear all cached styles
   */
  public clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; hits: number } {
    return {
      size: this.cache.size,
      hits: 0 // Simplified - would track hits in a real implementation
    };
  }
  
  /**
   * Generate layout styles
   */
  private generateLayoutStyles(): CSSRule[] {
    const rules: CSSRule[] = [];
    
    // Flexbox utilities
    rules.push(
      {
        selector: '.flex',
        properties: [
          { name: 'display', value: 'flex' }
        ]
      },
      {
        selector: '.flex-column',
        properties: [
          { name: 'flex-direction', value: 'column' }
        ]
      },
      {
        selector: '.flex-wrap',
        properties: [
          { name: 'flex-wrap', value: 'wrap' }
        ]
      },
      {
        selector: '.justify-start',
        properties: [
          { name: 'justify-content', value: 'flex-start' }
        ]
      },
      {
        selector: '.justify-center',
        properties: [
          { name: 'justify-content', value: 'center' }
        ]
      },
      {
        selector: '.justify-end',
        properties: [
          { name: 'justify-content', value: 'flex-end' }
        ]
      },
      {
        selector: '.justify-between',
        properties: [
          { name: 'justify-content', value: 'space-between' }
        ]
      },
      {
        selector: '.align-start',
        properties: [
          { name: 'align-items', value: 'flex-start' }
        ]
      },
      {
        selector: '.align-center',
        properties: [
          { name: 'align-items', value: 'center' }
        ]
      },
      {
        selector: '.align-end',
        properties: [
          { name: 'align-items', value: 'flex-end' }
        ]
      }
    );
    
    // Grid utilities
    rules.push(
      {
        selector: '.grid',
        properties: [
          { name: 'display', value: 'grid' }
        ]
      },
      {
        selector: '.grid-cols-2',
        properties: [
          { name: 'grid-template-columns', value: 'repeat(2, 1fr)' }
        ]
      },
      {
        selector: '.grid-cols-3',
        properties: [
          { name: 'grid-template-columns', value: 'repeat(3, 1fr)' }
        ]
      },
      {
        selector: '.grid-cols-4',
        properties: [
          { name: 'grid-template-columns', value: 'repeat(4, 1fr)' }
        ]
      },
      {
        selector: '.gap-sm',
        properties: [
          { name: 'gap', value: '8px' }
        ]
      },
      {
        selector: '.gap-md',
        properties: [
          { name: 'gap', value: '16px' }
        ]
      },
      {
        selector: '.gap-lg',
        properties: [
          { name: 'gap', value: '24px' }
        ]
      }
    );
    
    // Spacing utilities
    rules.push(
      {
        selector: '.m-0',
        properties: [
          { name: 'margin', value: '0' }
        ]
      },
      {
        selector: '.m-1',
        properties: [
          { name: 'margin', value: '4px' }
        ]
      },
      {
        selector: '.m-2',
        properties: [
          { name: 'margin', value: '8px' }
        ]
      },
      {
        selector: '.m-3',
        properties: [
          { name: 'margin', value: '16px' }
        ]
      },
      {
        selector: '.m-4',
        properties: [
          { name: 'margin', value: '24px' }
        ]
      },
      {
        selector: '.p-0',
        properties: [
          { name: 'padding', value: '0' }
        ]
      },
      {
        selector: '.p-1',
        properties: [
          { name: 'padding', value: '4px' }
        ]
      },
      {
        selector: '.p-2',
        properties: [
          { name: 'padding', value: '8px' }
        ]
      },
      {
        selector: '.p-3',
        properties: [
          { name: 'padding', value: '16px' }
        ]
      },
      {
        selector: '.p-4',
        properties: [
          { name: 'padding', value: '24px' }
        ]
      }
    );
    
    return rules;
  }
  
  /**
   * Generate media queries
   */
  private generateMediaQueries(): Record<string, CSSRule[]> {
    const mediaQueries: Record<string, CSSRule[]> = {};
    
    // Print media query
    mediaQueries['print'] = [
      {
        selector: '.page',
        properties: [
          { name: 'margin', value: '0' },
          { name: 'padding', value: '0' },
          { name: 'box-shadow', value: 'none' }
        ]
      },
      {
        selector: '.no-print',
        properties: [
          { name: 'display', value: 'none' }
        ]
      }
    ];
    
    // Screen media queries
    if (this.options.responsive) {
      mediaQueries['screen and (max-width: 768px)'] = [
        {
          selector: '.page',
          properties: [
            { name: 'width', value: '100%' },
            { name: 'height', value: 'auto' },
            { name: 'margin', value: '0' },
            { name: 'padding', value: '16px' }
          ]
        },
        {
          selector: 'table',
          properties: [
            { name: 'display', value: 'block' },
            { name: 'overflow-x', value: 'auto' }
          ]
        }
      ];
    }
    
    return mediaQueries;
  }
  
  /**
   * Generate CSS variables
   */
  private generateCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {};
    
    for (const [key, value] of this.variables.entries()) {
      variables[key] = value;
    }
    
    return variables;
  }
  
  /**
   * Generate CSS imports
   */
  private generateImports(): string[] {
    const imports: string[] = [];
    
    // Add web fonts if specified
    if (this.options.typography.fontFamily.includes('Google')) {
      const fontFamily = this.options.typography.fontFamily.split(',')[0].trim();
      imports.push(`url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap')`);
    }
    
    return imports;
  }
  
  /**
   * Generate element styles
   */
  private generateElementStyles(): CSSRule[] {
    const { spacing } = this.options;
    const rules: CSSRule[] = [];
    
    // Lists
    rules.push(
      {
        selector: 'ul, ol',
        properties: [
          { name: 'margin', value: 'var(--paragraph-spacing) 0' },
          { name: 'padding-left', value: 'var(--indent-size)' }
        ]
      },
      {
        selector: 'li',
        properties: [
          { name: 'margin-bottom', value: 'var(--list-item-spacing)' },
          { name: 'page-break-inside', value: 'avoid' }
        ]
      },
      {
        selector: 'ul',
        properties: [
          { name: 'list-style-type', value: 'disc' }
        ]
      },
      {
        selector: 'ol',
        properties: [
          { name: 'list-style-type', value: 'decimal' }
        ]
      }
    );
    
    // Tables
    rules.push(
      {
        selector: 'table',
        properties: [
          { name: 'width', value: '100%' },
          { name: 'border-collapse', value: 'collapse' },
          { name: 'margin', value: 'var(--paragraph-spacing) 0' },
          { name: 'page-break-inside', value: 'avoid' }
        ]
      },
      {
        selector: 'th, td',
        properties: [
          { name: 'border', value: '1px solid var(--color-borders)' },
          { name: 'padding', value: '8px 12px' },
          { name: 'text-align', value: 'left' }
        ]
      },
      {
        selector: 'th',
        properties: [
          { name: 'background-color', value: 'var(--color-primary)' },
          { name: 'color', value: 'white' },
          { name: 'font-weight', value: 'bold' }
        ]
      },
      {
        selector: 'tr:nth-child(even)',
        properties: [
          { name: 'background-color', value: 'rgba(0, 0, 0, 0.05)' }
        ]
      }
    );
    
    // Images
    rules.push(
      {
        selector: 'img',
        properties: [
          { name: 'max-width', value: '100%' },
          { name: 'height', value: 'auto' },
          { name: 'display', value: 'block' },
          { name: 'margin', value: 'var(--paragraph-spacing) auto' },
          { name: 'page-break-inside', value: 'avoid' }
        ]
      },
      {
        selector: '.image-caption',
        properties: [
          { name: 'text-align', value: 'center' },
          { name: 'font-style', value: 'italic' },
          { name: 'font-size', value: '0.9em' },
          { name: 'color', value: 'var(--color-secondary)' },
          { name: 'margin-top', value: '4px' }
        ]
      }
    );
    
    // Code blocks
    rules.push(
      {
        selector: 'pre, code',
        properties: [
          { name: 'font-family', value: 'monospace' },
          { name: 'background-color', value: 'rgba(0, 0, 0, 0.05)' },
          { name: 'border-radius', value: '4px' }
        ]
      },
      {
        selector: 'pre',
        properties: [
          { name: 'padding', value: '16px' },
          { name: 'overflow', value: 'auto' },
          { name: 'page-break-inside', value: 'avoid' }
        ]
      },
      {
        selector: 'code',
        properties: [
          { name: 'padding', value: '2px 4px' },
          { name: 'font-size', value: '0.9em' }
        ]
      }
    );
    
    // Quotes
    rules.push(
      {
        selector: 'blockquote',
        properties: [
          { name: 'border-left', value: '4px solid var(--color-accent)' },
          { name: 'margin', value: 'var(--paragraph-spacing) 0' },
          { name: 'padding', value: '8px 16px' },
          { name: 'background-color', value: 'rgba(0, 0, 0, 0.02)' },
          { name: 'font-style', value: 'italic' }
        ]
      },
      {
        selector: '.quote-author',
        properties: [
          { name: 'text-align', value: 'right' },
          { name: 'font-weight', value: 'bold' },
          { name: 'margin-top', value: '8px' }
        ]
      }
    );
    
    // Dividers
    rules.push({
      selector: 'hr',
      properties: [
        { name: 'border', value: 'none' },
        { name: 'border-top', value: '1px solid var(--color-borders)' },
        { name: 'margin', value: 'var(--section-spacing) 0' }
      ]
    });
    
    // Sections
    rules.push({
      selector: '.section',
      properties: [
        { name: 'margin-bottom', value: 'var(--section-spacing)' },
        { name: 'page-break-inside', value: 'avoid' }
      ]
    });
    
    return rules;
  }