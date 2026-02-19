/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Page Break Logic
 * 
 * Responsible for detecting and managing page breaks in documents,
 * including automatic detection, manual insertion, and widow/orphan control.
 */

import type {
  RenderingOptions,
  ContentElement,
  DocumentContent,
  SectionElement,
  PageBreakElement
} from '../types';

import { CSSLayoutEngine } from './CSSLayoutEngine';

/**
 * Page break detection options
 */
export interface PageBreakOptions {
  enabled: boolean;
  automaticDetection: boolean;
  manualBreakSupport: boolean;
  widowControl: boolean;
  orphanControl: boolean;
  widowLineCount: number; // Minimum lines at top of page
  orphanLineCount: number; // Minimum lines at bottom of page
  maxContentHeight: number; // Maximum content height before break (in pixels)
  minContentHeight: number; // Minimum content height after break (in pixels)
  respectElementBoundaries: boolean;
  avoidBreakingInside: ('table' | 'list' | 'image' | 'code' | 'quote')[];
  pageBreakMargin: number; // Additional margin after page break (in pixels)
  pageBreakCSS: string; // Custom CSS for page breaks
}

/**
 * Default page break options
 */
export const DEFAULT_PAGE_BREAK_OPTIONS: PageBreakOptions = {
  enabled: true,
  automaticDetection: true,
  manualBreakSupport: true,
  widowControl: true,
  orphanControl: true,
  widowLineCount: 2,
  orphanLineCount: 2,
  maxContentHeight: 1000, // pixels
  minContentHeight: 100, // pixels
  respectElementBoundaries: true,
  avoidBreakingInside: ['table', 'image', 'code'],
  pageBreakMargin: 20,
  pageBreakCSS: '.page-break { page-break-before: always; }'
};

/**
 * Page break detection result
 */
export interface PageBreakResult {
  pages: ContentElement[][];
  pageHeights: number[];
  breakPositions: number[];
  warnings: string[];
  errors: string[];
}

/**
 * Element height estimation
 */
interface ElementHeightEstimate {
  element: ContentElement;
  estimatedHeight: number;
  canBreakBefore: boolean;
  canBreakAfter: boolean;
  canBreakInside: boolean;
}

/**
 * Page Break Logic
 */
export class PageBreakLogic {
  private options: RenderingOptions;
  private pageBreakOptions: PageBreakOptions;
  private cssEngine: CSSLayoutEngine;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(
    options: RenderingOptions,
    pageBreakOptions: Partial<PageBreakOptions> = {}
  ) {
    this.options = options;
    this.pageBreakOptions = { ...DEFAULT_PAGE_BREAK_OPTIONS, ...pageBreakOptions };
    this.cssEngine = new CSSLayoutEngine(options);
  }

  /**
   * Reset warning and error messages
   */
  private resetMessages(): void {
    this.warnings = [];
    this.errors = [];
  }

  /**
   * Estimate total height of elements
   */
  private estimatePageHeight(elements: ContentElement[]): number {
    return elements.reduce((total, element) => {
      return total + this.estimateElementHeight(element);
    }, 0);
  }

  /**
   * Apply page breaks to document content
   */
  public applyPageBreaks(
    document: DocumentContent
  ): PageBreakResult {
    this.resetMessages();

    if (!this.pageBreakOptions.enabled) {
      // Return single page with all content
      const allElements = this.extractAllElements(document);
      return {
        pages: [allElements],
        pageHeights: [this.estimatePageHeight(allElements)],
        breakPositions: [],
        warnings: this.warnings,
        errors: this.errors
      };
    }

    // Extract all elements from document
    const allElements = this.extractAllElements(document);
    
    // Estimate heights for all elements
    const heightEstimates = this.estimateElementHeights(allElements);
    
    // Apply page breaks
    const result = this.applyBreaksToElements(heightEstimates);
    
    return result;
  }

  /**
   * Extract all elements from document (flatten sections)
   */
  private extractAllElements(document: DocumentContent): ContentElement[] {
    const elements: ContentElement[] = [];
    
    for (const section of document.sections) {
      // Add section title as heading if it exists
      if (section.title) {
        const headingElement: ContentElement = {
          id: `${section.id}_title`,
          type: 'heading',
          content: section.title,
          metadata: { sectionTitle: true }
        };
        // Add level property for heading
        (headingElement as any).level = Math.min(6, (section.level || 1) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        elements.push(headingElement);
      }
      
      // Add section content
      elements.push(...section.content);
      
      // Add page break after section if configured
      if (section.pageBreakAfter) {
        const pageBreakElement: ContentElement = {
          id: `pagebreak_after_${section.id}`,
          type: 'page-break',
          content: ''
        };
        // Add breakType property for page break
        (pageBreakElement as any).breakType = 'section';
        elements.push(pageBreakElement);
      }
    }
    
    return elements;
  }

  /**
   * Estimate heights for all elements
   */
  private estimateElementHeights(elements: ContentElement[]): ElementHeightEstimate[] {
    return elements.map(element => {
      const estimatedHeight = this.estimateElementHeight(element);
      const canBreakBefore = this.canBreakBeforeElement(element);
      const canBreakAfter = this.canBreakAfterElement(element);
      const canBreakInside = this.canBreakInsideElement(element);
      
      return {
        element,
        estimatedHeight,
        canBreakBefore,
        canBreakAfter,
        canBreakInside
      };
    });
  }

  /**
   * Estimate height of a single element
   */
  private estimateElementHeight(element: ContentElement): number {
    // Base height estimates based on element type
    let baseHeight = 0;
    
    switch (element.type) {
      case 'text':
        baseHeight = 20; // Approximate line height
        break;
      case 'heading':
        const level = (element as any).level || 1;
        baseHeight = 40 - (level * 4); // Larger headings take more space
        break;
      case 'paragraph':
        // Estimate based on content length
        const content = element.content;
        if (typeof content === 'string') {
          baseHeight = Math.ceil(content.length / 100) * 20; // Approximate
        } else {
          baseHeight = 40; // Default for complex paragraphs
        }
        break;
      case 'list':
        const listItems = (element as any).content || [];
        baseHeight = listItems.length * 30;
        break;
      case 'table':
        const rows = (element as any).content || [];
        baseHeight = rows.length * 25;
        break;
      case 'image':
        const imageHeight = (element as any).height;
        if (typeof imageHeight === 'number') {
          baseHeight = imageHeight;
        } else if (typeof imageHeight === 'string' && imageHeight.endsWith('px')) {
          baseHeight = parseInt(imageHeight);
        } else {
          baseHeight = 200; // Default image height
        }
        break;
      case 'divider':
        baseHeight = 10;
        break;
      case 'page-break':
        baseHeight = this.pageBreakOptions.pageBreakMargin;
        break;
      default:
        baseHeight = 30;
    }
    
    // Apply spacing from options
    const spacing = this.options.spacing;
    if (spacing) {
      if (spacing.paragraphSpacing) baseHeight += spacing.paragraphSpacing;
      if (spacing.listItemSpacing) baseHeight += spacing.listItemSpacing * 2;
    }
    
    return Math.max(10, baseHeight);
  }

  /**
   * Check if we can break before an element
   */
  private canBreakBeforeElement(element: ContentElement): boolean {
    // Don't break before page breaks
    if (element.type === 'page-break') {
      return false;
    }
    
    // Don't break before first element of certain types
    if (element.type === 'heading' && (element as any).level === 1) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if we can break after an element
   */
  private canBreakAfterElement(element: ContentElement): boolean {
    // Can always break after page breaks
    if (element.type === 'page-break') {
      return true;
    }
    
    // Don't break after certain elements
    if (element.type === 'heading') {
      return false; // Keep heading with following content
    }
    
    return true;
  }

  /**
   * Check if we can break inside an element
   */
  private canBreakInsideElement(element: ContentElement): boolean {
    // Check avoidBreakingInside list
    const avoidTypes = this.pageBreakOptions.avoidBreakingInside;
    if (avoidTypes.includes(element.type as any)) {
      return false;
    }
    
    // Specific element type checks
    switch (element.type) {
      case 'table':
      case 'image':
      case 'code':
        return false;
      case 'list':
        // Can break between list items but not inside a list item
        return true;
      case 'paragraph':
        // Can break inside paragraphs (widow/orphan control handles this)
        return true;
      default:
        return true;
    }
  }

  /**
   * Apply breaks to elements based on height estimates
   */
  private applyBreaksToElements(estimates: ElementHeightEstimate[]): PageBreakResult {
    const pages: ContentElement[][] = [];
    const pageHeights: number[] = [];
    const breakPositions: number[] = [];
    
    let currentPage: ContentElement[] = [];
    let currentHeight = 0;
    let currentIndex = 0;
    
    while (currentIndex < estimates.length) {
      const estimate = estimates[currentIndex];
      
      // Check for manual page break
      if (estimate.element.type === 'page-break') {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          pageHeights.push(currentHeight);
          breakPositions.push(currentIndex);
        }
        
        // Start new page
        currentPage = [];
        currentHeight = 0;
        currentIndex++;
        continue;
      }
      
      // Check if element fits on current page
      const fitsOnCurrentPage = currentHeight + estimate.estimatedHeight <= this.pageBreakOptions.maxContentHeight;
      
      if (fitsOnCurrentPage) {
        // Add element to current page
        currentPage.push(estimate.element);
        currentHeight += estimate.estimatedHeight;
        currentIndex++;
      } else {
        // Element doesn't fit - need to break
        
        // Check if we should break before this element
        if (estimate.canBreakBefore && currentPage.length > 0) {
          // Break before current element
          pages.push(currentPage);
          pageHeights.push(currentHeight);
          breakPositions.push(currentIndex);
          
          currentPage = [];
          currentHeight = 0;
          // Don't increment index - element will be added to next page
        } else if (estimate.canBreakInside && this.canBreakElement(estimate)) {
          // Try to break inside the element
          const splitResult = this.splitElement(estimate, currentHeight);
          
          if (splitResult.firstPart) {
            // Add first part to current page
            currentPage.push(splitResult.firstPart);
            currentHeight += splitResult.firstHeight;
            
            pages.push(currentPage);
            pageHeights.push(currentHeight);
            breakPositions.push(currentIndex);
            
            // Start new page with second part
            currentPage = splitResult.secondPart ? [splitResult.secondPart] : [];
            currentHeight = splitResult.secondHeight;
            currentIndex++;
          } else {
            // Can't split - force break before
            if (currentPage.length > 0) {
              pages.push(currentPage);
              pageHeights.push(currentHeight);
              breakPositions.push(currentIndex);
            }
            
            currentPage = [estimate.element];
            currentHeight = estimate.estimatedHeight;
            currentIndex++;
          }
        } else {
          // Can't break before or inside - force new page
          if (currentPage.length > 0) {
            pages.push(currentPage);
            pageHeights.push(currentHeight);
            breakPositions.push(currentIndex);
          }
          
          currentPage = [estimate.element];
          currentHeight = estimate.estimatedHeight;
          currentIndex++;
        }
      }
      
      // Apply widow/orphan control
      if (this.pageBreakOptions.widowControl || this.pageBreakOptions.orphanControl) {
        this.applyWidowOrphanControl(pages, estimates, breakPositions);
      }
    }
    
    // Add last page if not empty
    if (currentPage.length > 0) {
      pages.push(currentPage);
      pageHeights.push(currentHeight);
    }
    
    return {
      pages,
      pageHeights,
      breakPositions,
      warnings: this.warnings,
      errors: this.errors
    };
  }

  /**
   * Check if an element can be broken (for splitting)
   */
  private canBreakElement(estimate: ElementHeightEstimate): boolean {
    if (!estimate.canBreakInside) {
      return false;
    }
    
    // Check minimum height requirements
    if (estimate.estimatedHeight < this.pageBreakOptions.minContentHeight * 2) {
      return false; // Too small to split
    }
    
    return true;
  }

  /**
   * Split an element into two parts
   */
  private splitElement(
    estimate: ElementHeightEstimate,
    currentPageHeight: number
  ): {
    firstPart: ContentElement | null;
    secondPart: ContentElement | null;
    firstHeight: number;
    secondHeight: number;
  } {
    const element = estimate.element;
    
    // Calculate available space on current page
    const availableSpace = this.pageBreakOptions.maxContentHeight - currentPageHeight;
    
    // Calculate split ratio (how much to put on current page)
    const splitRatio = Math.max(0.3, Math.min(0.7, availableSpace / estimate.estimatedHeight));
    
    // Create split elements based on type
    switch (element.type) {
      case 'paragraph':
        return this.splitParagraph(element, splitRatio);
      case 'list':
        return this.splitList(element, splitRatio);
      default:
        // For other elements, can't split
        return {
          firstPart: null,
          secondPart: null,
          firstHeight: 0,
          secondHeight: 0
        };
    }
  }

  /**
   * Split a paragraph element
   */
  private splitParagraph(
    element: ContentElement,
    splitRatio: number
  ): {
    firstPart: ContentElement | null;
    secondPart: ContentElement | null;
    firstHeight: number;
    secondHeight: number;
  } {
    const content = element.content;
    
    if (typeof content !== 'string') {
      // Can't split non-string paragraphs
      return {
        firstPart: null,
        secondPart: null,
        firstHeight: 0,
        secondHeight: 0
      };
    }
    
    // Simple split by words
    const words = content.split(' ');
    const splitIndex = Math.floor(words.length * splitRatio);
    
    if (splitIndex <= 0 || splitIndex >= words.length) {
      // Can't split meaningfully
      return {
        firstPart: null,
        secondPart: null,
        firstHeight: 0,
        secondHeight: 0
      };
    }
    
    const firstContent = words.slice(0, splitIndex).join(' ');
    const secondContent = words.slice(splitIndex).join(' ');
    
    const firstPart: ContentElement = {
      ...element,
      id: `${element.id}_part1`,
      content: firstContent
    };
    
    const secondPart: ContentElement = {
      ...element,
      id: `${element.id}_part2`,
      content: secondContent
    };
    
    // Estimate heights
    const firstHeight = this.estimateElementHeight(firstPart);
    const secondHeight = this.estimateElementHeight(secondPart);
    
    return {
      firstPart,
      secondPart,
      firstHeight,
      secondHeight
    };
  }

  /**
   * Split a list element
   */
  private splitList(
    element: ContentElement,
    splitRatio: number
  ): {
    firstPart: ContentElement | null;
    secondPart: ContentElement | null;
    firstHeight: number;
    secondHeight: number;
  } {
    const items = (element as any).content || [];
    
    if (items.length <= 1) {
      // Can't split lists with 0 or 1 items
      return {
        firstPart: null,
        secondPart: null,
        firstHeight: 0,
        secondHeight: 0
      };
    }
    
    const splitIndex = Math.floor(items.length * splitRatio);
    
    if (splitIndex <= 0 || splitIndex >= items.length) {
      // Can't split meaningfully
      return {
        firstPart: null,
        secondPart: null,
        firstHeight: 0,
        secondHeight: 0
      };
    }
    
    const firstItems = items.slice(0, splitIndex);
    const secondItems = items.slice(splitIndex);
    
    const firstPart: ContentElement = {
      ...element,
      id: `${element.id}_part1`,
      content: firstItems
    };
    
    const secondPart: ContentElement = {
      ...element,
      id: `${element.id}_part2`,
      content: secondItems
    };
    
    // Estimate heights
    const firstHeight = this.estimateElementHeight(firstPart);
    const secondHeight = this.estimateElementHeight(secondPart);
    
    return {
      firstPart,
      secondPart,
      firstHeight,
      secondHeight
    };
  }

  /**
   * Apply widow and orphan control
   */
  private applyWidowOrphanControl(
    pages: ContentElement[][],
    estimates: ElementHeightEstimate[],
    breakPositions: number[]
  ): void {
    if (pages.length <= 1) {
      return; // No need for widow/orphan control with single page
    }
    
    // Check each page break
    for (let i = 0; i < breakPositions.length; i++) {
      const breakIndex = breakPositions[i];
      const currentPage = pages[i];
      const nextPage = pages[i + 1];
      
      if (!nextPage || nextPage.length === 0) {
        continue;
      }
      
      // Check for orphans (few lines at bottom of page)
      if (this.pageBreakOptions.orphanControl) {
        const lastElement = currentPage[currentPage.length - 1];
        if (lastElement && lastElement.type === 'paragraph') {
          // Check if paragraph is too short to be at bottom of page
          const paragraphHeight = this.estimateElementHeight(lastElement);
          const orphanThreshold = this.pageBreakOptions.orphanLineCount * 20; // Approximate line height
          
          if (paragraphHeight < orphanThreshold) {
            // Move this paragraph to next page
            currentPage.pop();
            nextPage.unshift(lastElement);
            this.warnings.push(`Orphan control: moved short paragraph from page ${i + 1} to page ${i + 2}`);
          }
        }
      }
      
      // Check for widows (few lines at top of page)
      if (this.pageBreakOptions.widowControl) {
        const firstElement = nextPage[0];
        if (firstElement && firstElement.type === 'paragraph') {
          // Check if paragraph is too short to be at top of page
          const paragraphHeight = this.estimateElementHeight(firstElement);
          const widowThreshold = this.pageBreakOptions.widowLineCount * 20; // Approximate line height
          
          if (paragraphHeight < widowThreshold) {
            // Move this paragraph to previous page
            nextPage.shift();
            currentPage.push(firstElement);
            this.warnings.push(`Widow control: moved short paragraph from page ${i + 2} to page ${i + 1}`);
          }
        }
      }
    }
  }
}