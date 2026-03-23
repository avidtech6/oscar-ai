/**
 * Decompiled Report Interface for Oscar AI Phase Compliance Package
 * 
 * This file defines the DecompiledReport interface and related types for the Report Decompiler Engine.
 * It implements Phase 2: Report Decompiler Engine from the Report Intelligence System.
 * 
 * File: src/lib/report-intelligence/decompiled-report.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

/**
 * Represents a decompiled report structure
 */
export interface DecompiledReport {
  /**
   * Unique identifier for the report
   */
  id: string;

  /**
   * Original file name and path
   */
  originalFile: {
    name: string;
    path: string;
    size: number;
    type: string;
    lastModified: Date;
  };

  /**
   * Report type information
   */
  reportType: {
    id: string;
    name: string;
    version: string;
    confidence: number;
  };

  /**
   * Metadata extracted from the report
   */
  metadata: {
    title: string;
    author: string;
    organization: string;
    date: Date;
    subject: string;
    keywords: string[];
    language: string;
    wordCount: number;
    pageCount: number;
    sectionCount: number;
  };

  /**
   * Structure information
   */
  structure: {
    sections: ReportSection[];
    hierarchy: SectionHierarchy[];
    tables: ReportTable[];
    figures: ReportFigure[];
    references: ReportReference[];
  };

  /**
   * Content sections with extracted data
   */
  content: {
    executiveSummary?: string;
    introduction?: string;
    methodology?: string;
    findings?: string;
    conclusions?: string;
    recommendations?: string;
    appendices?: ReportAppendix[];
  };

  /**
   * Extracted data fields
   */
  extractedData: Record<string, ExtractedField>;

  /**
   * Validation results
   */
  validation: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score: number;
  };

  /**
   * Processing information
   */
  processing: {
    decompiledAt: Date;
    processingTime: number;
    confidence: number;
    warnings: string[];
    errors: string[];
  };

  /**
   * Quality assessment
   */
  quality: {
    readability: number;
    completeness: number;
    consistency: number;
    accuracy: number;
    overallScore: number;
  };

  /**
   * Extracted entities and relationships
   */
  entities: {
    people: ExtractedEntity[];
    organizations: ExtractedEntity[];
    locations: ExtractedEntity[];
    dates: ExtractedDate[];
    measurements: ExtractedMeasurement[];
    documents: ExtractedDocument[];
  };

  /**
   * Extracted tables and data
   */
  tables: ExtractedTable[];

  /**
   * Extracted figures and images
   */
  figures: ExtractedFigure[];

  /**
   * Extracted references and citations
   */
  references: ExtractedReference[];

  /**
   * Extracted formulas and calculations
   */
  formulas: ExtractedFormula[];

  /**
   * Extracted charts and graphs
   */
  charts: ExtractedChart[];
}

/**
 * Represents a section in the decompiled report
 */
export interface ReportSection {
  /**
   * Section identifier
   */
  id: string;

  /**
   * Section name (alias for title)
   */
  name: string;

  /**
   * Section title
   */
  title: string;

  /**
   * Section type
   */
  type: string;

  /**
   * Section level (1 for main sections, 2 for subsections, etc.)
   */
  level: number;

  /**
   * Section order
   */
  order: number;

  /**
   * Section content
   */
  content: string;

  /**
   * Section word count
   */
  wordCount: number;

  /**
   * Page range where section appears
   */
  pageRange: {
    start: number;
    end: number;
  };

  /**
   * Section metadata
   */
  metadata: {
    hasFigures: boolean;
    hasTables: boolean;
    hasReferences: boolean;
    hasFormulas: boolean;
    hasCharts: boolean;
  };

  /**
   * Extracted subsections
   */
  subsections?: ReportSection[];
}

/**
 * Represents the hierarchy structure of sections
 */
export interface SectionHierarchy {
  /**
   * Parent section ID (null for root sections)
   */
  parentId: string | null;

  /**
   * Child section IDs
   */
  childIds: string[];

  /**
   * Section level
   */
  level: number;

  /**
   * Section order
   */
  order: number;
}

/**
 * Represents a table in the report
 */
export interface ReportTable {
  /**
   * Table identifier
   */
  id: string;

  /**
   * Table title/caption
   */
  title: string;

  /**
   * Table number
   */
  number: number;

  /**
   * Table content as structured data
   */
  data: TableData;

  /**
   * Table location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };

  /**
   * Table metadata
   */
  metadata: {
    rowCount: number;
    columnCount: number;
    hasHeader: boolean;
    hasFooter: boolean;
    isFormatted: boolean;
  };
}

/**
 * Represents a figure in the report
 */
export interface ReportFigure {
  /**
   * Figure identifier
   */
  id: string;

  /**
   * Figure title/caption
   */
  title: string;

  /**
   * Figure number
   */
  number: number;

  /**
   * Figure type
   */
  type: 'image' | 'chart' | 'diagram' | 'graph' | 'table' | 'other';

  /**
   * Figure location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };

  /**
   * Figure metadata
   */
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

/**
 * Represents a reference in the report
 */
export interface ReportReference {
  /**
   * Reference identifier
   */
  id: string;

  /**
   * Reference text
   */
  text: string;

  /**
   * Reference type
   */
  type: 'citation' | 'footnote' | 'endnote' | 'bibliography' | 'other';

  /**
   * Reference target
   */
  target: {
    document?: string;
    page?: number;
    section?: string;
    url?: string;
  };

  /**
   * Reference location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
    };
  };
}

/**
 * Represents an appendix in the report
 */
export interface ReportAppendix {
  /**
   * Appendix identifier
   */
  id: string;

  /**
   * Appendix title
   */
  title: string;

  /**
   * Appendix content
   */
  content: string;

  /**
   * Appendix location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

/**
 * Represents an extracted field from the report
 */
export interface ExtractedField {
  /**
   * Field name
   */
  name: string;

  /**
   * Field value
   */
  value: any;

  /**
   * Field type
   */
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';

  /**
   * Field confidence score
   */
  confidence: number;

  /**
   * Field location in the document
   */
  location: {
    page: number;
    section?: string;
    position: {
      x: number;
      y: number;
    };
  };

  /**
   * Field metadata
   */
  metadata: {
    extractedBy: string;
    extractedAt: Date;
    verified: boolean;
    notes?: string;
  };
}

/**
 * Represents a validation error
 */
export interface ValidationError {
  /**
   * Error code
   */
  code: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Error severity
   */
  severity: 'error' | 'warning' | 'info';

  /**
   * Error location
   */
  location: {
    page?: number;
    section?: string;
    position?: {
      x: number;
      y: number;
    };
  };

  /**
   * Error suggestion
   */
  suggestion?: string;
}

/**
 * Represents a validation warning
 */
export interface ValidationWarning extends Omit<ValidationError, 'severity'> {
  severity: 'warning';
}

/**
 * Represents an extracted entity
 */
export interface ExtractedEntity {
  /**
   * Entity identifier
   */
  id: string;

  /**
   * Entity text
   */
  text: string;

  /**
   * Entity type
   */
  type: 'person' | 'organization' | 'location' | 'other';

  /**
   * Entity confidence score
   */
  confidence: number;

  /**
   * Entity location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
    };
  };

  /**
   * Entity metadata
   */
  metadata: {
    mentions: number;
    context: string[];
    relationships: string[];
  };
}

/**
 * Represents an extracted date
 */
export interface ExtractedDate {
  /**
   * Date identifier
   */
  id: string;

  /**
   * Date text
   */
  text: string;

  /**
   * Parsed date
   */
  date: Date;

  /**
   * Date format
   */
  format: string;

  /**
   * Date confidence score
   */
  confidence: number;

  /**
   * Date location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
    };
  };
}

/**
 * Represents an extracted measurement
 */
export interface ExtractedMeasurement {
  /**
   * Measurement identifier
   */
  id: string;

  /**
   * Measurement text
   */
  text: string;

  /**
   * Measurement value
   */
  value: number;

  /**
   * Measurement unit
   */
  unit: string;

  /**
   * Measurement confidence score
   */
  confidence: number;

  /**
   * Measurement location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
    };
  };
}

/**
 * Represents an extracted document reference
 */
export interface ExtractedDocument {
  /**
   * Document identifier
   */
  id: string;

  /**
   * Document title
   */
  title: string;

  /**
   * Document reference text
   */
  reference: string;

  /**
   * Document type
   */
  type: 'report' | 'study' | 'article' | 'book' | 'website' | 'other';

  /**
   * Document confidence score
   */
  confidence: number;

  /**
   * Document location in the document
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
    };
  };
}

/**
 * Represents table data structure
 */
export interface TableData {
  /**
   * Table headers
   */
  headers: string[];

  /**
   * Table rows
   */
  rows: TableRow[];

  /**
   * Table formatting
   */
  formatting: TableFormatting;
}

/**
 * Represents a table row
 */
export interface TableRow {
  /**
   * Row cells
   */
  cells: TableCell[];

  /**
   * Row index
   */
  index: number;

  /**
   * Row type
   */
  type: 'data' | 'header' | 'footer' | 'total' | 'other';
}

/**
 * Represents a table cell
 */
export interface TableCell {
  /**
   * Cell value
   */
  value: any;

  /**
   * Cell type
   */
  type: 'string' | 'number' | 'date' | 'boolean' | 'null';

  /**
   * Cell formatting
   */
  formatting: CellFormatting;

  /**
   * Cell position
   */
  position: {
    row: number;
    column: number;
  };
}

/**
 * Represents table formatting
 */
export interface TableFormatting {
  /**
   * Table style
   */
  style: string;

  /**
   * Table borders
   */
  borders: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };

  /**
   * Cell alignment
   */
  alignment: {
    horizontal: 'left' | 'center' | 'right' | 'justify';
    vertical: 'top' | 'middle' | 'bottom';
  };

  /**
   * Background color
   */
  backgroundColor?: string;

  /**
   * Text color
   */
  textColor?: string;
}

/**
 * Represents cell formatting
 */
export interface CellFormatting {
  /**
   * Font family
   */
  fontFamily?: string;

  /**
   * Font size
   */
  fontSize?: number;

  /**
   * Font weight
   */
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter';

  /**
   * Font style
   */
  fontStyle?: 'normal' | 'italic';

  /**
   * Text decoration
   */
  textDecoration?: 'none' | 'underline' | 'line-through';

  /**
   * Background color
   */
  backgroundColor?: string;

  /**
   * Text color
   */
  textColor?: string;

  /**
   * Horizontal alignment
   */
  horizontalAlignment?: 'left' | 'center' | 'right' | 'justify';

  /**
   * Vertical alignment
   */
  verticalAlignment?: 'top' | 'middle' | 'bottom';

  /**
   * Borders
   */
  borders: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

/**
 * Represents an extracted table
 */
export interface ExtractedTable {
  /**
   * Table identifier
   */
  id: string;

  /**
   * Table title
   */
  title: string;

  /**
   * Table data
   */
  data: TableData;

  /**
   * Table location
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };

  /**
   * Table metadata
   */
  metadata: {
    rowCount: number;
    columnCount: number;
    hasHeader: boolean;
    hasFooter: boolean;
    isFormatted: boolean;
  };
}

/**
 * Represents an extracted figure
 */
export interface ExtractedFigure {
  /**
   * Figure identifier
   */
  id: string;

  /**
   * Figure title
   */
  title: string;

  /**
   * Figure type
   */
  type: 'image' | 'chart' | 'diagram' | 'graph' | 'table' | 'other';

  /**
   * Figure description
   */
  description: string;

  /**
   * Figure location
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };

  /**
   * Figure metadata
   */
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

/**
 * Represents an extracted reference
 */
export interface ExtractedReference {
  /**
   * Reference identifier
   */
  id: string;

  /**
   * Reference text
   */
  text: string;

  /**
   * Reference type
   */
  type: 'citation' | 'footnote' | 'endnote' | 'bibliography' | 'other';

  /**
   * Reference target
   */
  target: {
    document?: string;
    page?: number;
    section?: string;
    url?: string;
  };

  /**
   * Reference location
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
    };
  };
}

/**
 * Represents an extracted formula
 */
export interface ExtractedFormula {
  /**
   * Formula identifier
   */
  id: string;

  /**
   * Formula text
   */
  text: string;

  /**
   * Formula type
   */
  type: 'mathematical' | 'chemical' | 'physical' | 'other';

  /**
   * Formula description
   */
  description: string;

  /**
   * Formula location
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
    };
  };
}

/**
 * Represents an extracted chart
 */
export interface ExtractedChart {
  /**
   * Chart identifier
   */
  id: string;

  /**
   * Chart title
   */
  title: string;

  /**
   * Chart type
   */
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'other';

  /**
   * Chart description
   */
  description: string;

  /**
   * Chart data
   */
  data: ChartData;

  /**
   * Chart location
   */
  location: {
    page: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

/**
 * Represents chart data structure
 */
export interface ChartData {
  /**
   * Chart labels
   */
  labels: string[];

  /**
   * Chart datasets
   */
  datasets: ChartDataset[];

  /**
   * Chart options
   */
  options: ChartOptions;
}

/**
 * Represents a chart dataset
 */
export interface ChartDataset {
  /**
   * Dataset label
   */
  label: string;

  /**
   * Dataset data
   */
  data: number[];

  /**
   * Dataset background color
   */
  backgroundColor: string;

  /**
   * Dataset border color
   */
  borderColor: string;

  /**
   * Dataset border width
   */
  borderWidth: number;
}

/**
 * Represents chart options
 */
export interface ChartOptions {
  /**
   * Responsive flag
   */
  responsive: boolean;

  /**
   * Maintain aspect ratio
   */
  maintainAspectRatio: boolean;

  /**
   * Plugin options
   */
  plugins: {
    title?: {
      display: boolean;
      text: string;
    };
    legend?: {
      display: boolean;
      position: string;
    };
  };

  /**
   * Scale options
   */
  scales?: {
    x?: {
      display: boolean;
      title: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      title: {
        display: boolean;
        text: string;
      };
    };
  };
}