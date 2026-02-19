/**
 * Phase 15: HTML Rendering & Visual Reproduction Engine
 * Content Type Definitions
 */

import type { RenderingOptions } from './RenderingOptions';

/**
 * Content element types
 */
export type ContentElementType =
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'list-item'
  | 'table'
  | 'table-row'
  | 'table-cell'
  | 'image'
  | 'code'
  | 'quote'
  | 'divider'
  | 'page-break'
  | 'section'
  | 'custom';

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

/**
 * List style types
 */
export type ListStyleType = 'bullet' | 'number' | 'check' | 'none';

/**
 * Table cell alignment
 */
export type CellAlignment = 'left' | 'center' | 'right';

/**
 * Image source types
 */
export type ImageSource = {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  dataUrl?: string; // base64 encoded
};

/**
 * Base content element interface
 */
export interface ContentElement {
  id: string;
  type: ContentElementType;
  content: any; // Flexible content type - specialized in derived interfaces
  metadata?: Record<string, any>;
  style?: Record<string, string>;
  classes?: string[];
  attributes?: Record<string, string>;
}

/**
 * Text element
 */
export interface TextElement extends ContentElement {
  type: 'text';
  content: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

/**
 * Heading element
 */
export interface HeadingElement extends ContentElement {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  alignment?: TextAlignment;
}

/**
 * Paragraph element
 */
export interface ParagraphElement extends ContentElement {
  type: 'paragraph';
  content: string | ContentElement[];
  alignment?: TextAlignment;
  indent?: number;
  spacing?: {
    before?: number;
    after?: number;
  };
}

/**
 * List element
 */
export interface ListElement extends Omit<ContentElement, 'style'> {
  type: 'list';
  content: ListItemElement[];
  listStyle: ListStyleType;
  ordered?: boolean;
  start?: number;
  indent?: number;
}

/**
 * List item element
 */
export interface ListItemElement extends ContentElement {
  type: 'list-item';
  content: string | ContentElement[];
  checked?: boolean;
  sublist?: ListElement;
}

/**
 * Table element
 */
export interface TableElement extends ContentElement {
  type: 'table';
  content: TableRowElement[];
  headers?: string[];
  columns?: number;
  width?: string | number;
  border?: boolean;
  striped?: boolean;
  hover?: boolean;
}

/**
 * Table row element
 */
export interface TableRowElement extends ContentElement {
  type: 'table-row';
  content: TableCellElement[];
}

/**
 * Table cell element
 */
export interface TableCellElement extends ContentElement {
  type: 'table-cell';
  content: string | ContentElement[];
  colspan?: number;
  rowspan?: number;
  alignment?: CellAlignment;
  header?: boolean;
}

/**
 * Image element
 */
export interface ImageElement extends ContentElement {
  type: 'image';
  content: ImageSource;
  width?: string | number;
  height?: string | number;
  alignment?: TextAlignment;
  wrap?: boolean;
  caption?: string;
}

/**
 * Code element
 */
export interface CodeElement extends ContentElement {
  type: 'code';
  content: string;
  language?: string;
  inline?: boolean;
  lineNumbers?: boolean;
}

/**
 * Quote element
 */
export interface QuoteElement extends ContentElement {
  type: 'quote';
  content: string | ContentElement[];
  author?: string;
  source?: string;
  alignment?: TextAlignment;
}

/**
 * Divider element
 */
export interface DividerElement extends Omit<ContentElement, 'style'> {
  type: 'divider';
  content: '';
  dividerStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  thickness?: number;
  color?: string;
}

/**
 * Page break element
 */
export interface PageBreakElement extends ContentElement {
  type: 'page-break';
  content: '';
  breakType?: 'automatic' | 'manual' | 'section';
}

/**
 * Section element
 */
export interface SectionElement extends ContentElement {
  type: 'section';
  content: ContentElement[];
  title?: string;
  level?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
}

/**
 * Custom element
 */
export interface CustomElement extends ContentElement {
  type: 'custom';
  content: any;
  component?: string;
  props?: Record<string, any>;
}

/**
 * Document content structure
 */
export interface DocumentContent {
  title: string;
  author?: string;
  date?: Date;
  version?: string;
  sections: SectionElement[];
  metadata?: Record<string, any>;
}

/**
 * Page content with layout information
 */
export interface PageContent {
  pageNumber: number;
  totalPages: number;
  content: ContentElement[];
  header?: ContentElement[];
  footer?: ContentElement[];
  pageSize: {
    width: number;
    height: number;
    unit: 'mm' | 'px' | 'in';
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Content transformation options
 */
export interface ContentTransformOptions {
  flatten?: boolean;
  normalize?: boolean;
  sanitize?: boolean;
  optimizeImages?: boolean;
  applyStyles?: boolean;
  generateIds?: boolean;
}

/**
 * Content validation result
 */
export interface ContentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Transform content based on options
 */
export function transformContent(
  content: DocumentContent,
  options: ContentTransformOptions = {}
): DocumentContent {
  const transformed = { ...content };
  
  if (options.flatten) {
    // Flatten nested structures
    transformed.sections = flattenSections(transformed.sections);
  }
  
  if (options.normalize) {
    // Normalize element structures
    transformed.sections = normalizeSections(transformed.sections);
  }
  
  if (options.generateIds) {
    // Generate missing IDs
    transformed.sections = generateIds(transformed.sections);
  }
  
  return transformed;
}

/**
 * Flatten nested sections
 */
function flattenSections(sections: SectionElement[]): SectionElement[] {
  const flattened: SectionElement[] = [];
  
  for (const section of sections) {
    const flatSection = { ...section };
    
    // Check if section contains nested sections
    const nestedSections: SectionElement[] = [];
    const otherContent: ContentElement[] = [];
    
    for (const element of section.content) {
      if (element.type === 'section') {
        nestedSections.push(element as SectionElement);
      } else {
        otherContent.push(element);
      }
    }
    
    // Set content to non-section elements
    flatSection.content = otherContent;
    
    // Add flattened section
    flattened.push(flatSection);
    
    // Recursively flatten nested sections
    if (nestedSections.length > 0) {
      flattened.push(...flattenSections(nestedSections));
    }
  }
  
  return flattened;
}

/**
 * Normalize element structures
 */
function normalizeSections(sections: SectionElement[]): SectionElement[] {
  return sections.map(section => ({
    ...section,
    content: normalizeElements(section.content)
  }));
}

/**
 * Normalize individual elements
 */
function normalizeElements(elements: ContentElement[]): ContentElement[] {
  return elements.map(element => {
    const normalized = { ...element };
    
    // Ensure required properties
    if (!normalized.id) {
      normalized.id = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Normalize based on type
    switch (normalized.type) {
      case 'text':
        if (typeof normalized.content !== 'string') {
          normalized.content = String(normalized.content);
        }
        break;
        
      case 'paragraph':
        if (typeof normalized.content === 'string') {
          normalized.content = [{
            id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'text',
            content: normalized.content
          }];
        }
        break;
        
      case 'list':
        if (!Array.isArray(normalized.content)) {
          normalized.content = [];
        }
        break;
        
      case 'table':
        if (!Array.isArray(normalized.content)) {
          normalized.content = [];
        }
        break;
    }
    
    return normalized;
  });
}

/**
 * Generate missing IDs for elements
 */
function generateIds(sections: SectionElement[]): SectionElement[] {
  let idCounter = 0;
  
  const generateId = () => `elem_${Date.now()}_${idCounter++}`;
  
  const processElement = (element: ContentElement): ContentElement => {
    const processed = { ...element };
    
    if (!processed.id) {
      processed.id = generateId();
    }
    
    if (processed.type === 'section' || processed.type === 'list') {
      if (Array.isArray(processed.content)) {
        processed.content = processed.content.map(processElement);
      }
    }
    
    return processed;
  };
  
  return sections.map(section => processElement(section) as SectionElement);
}

/**
 * Type guard for ImageElement
 */
export function isImageElement(element: ContentElement): element is ImageElement {
  return element.type === 'image';
}

/**
 * Type guard for TableElement
 */
export function isTableElement(element: ContentElement): element is TableElement {
  return element.type === 'table';
}

/**
 * Validate document content
 */
export function validateContent(content: DocumentContent): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Check required fields
  if (!content.title?.trim()) {
    errors.push('Document title is required');
  }
  
  if (!content.sections || content.sections.length === 0) {
    warnings.push('Document has no sections');
  }
  
  // Validate sections
  content.sections.forEach((section, index) => {
    if (!section.id) {
      warnings.push(`Section ${index + 1} has no ID`);
    }
    
    if (!section.content || section.content.length === 0) {
      warnings.push(`Section "${section.title || `Section ${index + 1}`}" has no content`);
    }
    
    // Validate individual elements
    section.content.forEach((element, elemIndex) => {
      if (!element.id) {
        warnings.push(`Element ${elemIndex + 1} in section "${section.title || `Section ${index + 1}`}" has no ID`);
      }
      
      if (!element.type) {
        errors.push(`Element ${elemIndex + 1} in section "${section.title || `Section ${index + 1}`}" has no type`);
      }
      
      // Type-specific validation using type guards
      if (isImageElement(element)) {
        if (!element.content?.url && !element.content?.dataUrl) {
          errors.push(`Image element ${elemIndex + 1} has no source URL or data URL`);
        }
      }
      
      if (isTableElement(element)) {
        if (!element.content || element.content.length === 0) {
          warnings.push(`Table element ${elemIndex + 1} has no rows`);
        }
      }
    });
  });
  
  // Suggestions
  if (!content.author) {
    suggestions.push('Consider adding an author name');
  }
  
  if (!content.date) {
    suggestions.push('Consider adding a document date');
  }
  
  if (!content.version) {
    suggestions.push('Consider adding a version number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}