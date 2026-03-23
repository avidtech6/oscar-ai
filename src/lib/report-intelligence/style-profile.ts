/**
 * Style Profile Interface for Report Style Learner
 * 
 * This interface defines the structure for learned writing style profiles
 * that capture formatting patterns, terminology preferences, and phrasing
 * characteristics from existing reports.
 * 
 * PHASE 5 — Report Style Learner
 * Required Systems: Report Intelligence System
 */

export interface StyleProfile {
  /** Unique identifier for the style profile */
  id: string;
  
  /** Name of the style profile */
  name: string;
  
  /** Type of report this style profile applies to */
  reportType: string;
  
  /** Description of the style characteristics */
  description: string;
  
  /** When the style profile was created */
  createdAt: Date;
  
  /** When the style profile was last updated */
  updatedAt: Date;
  
  /** Author or source of the style profile */
  author?: string;
  
  /** Version number of the style profile */
  version: string;
  
  /** Overall style characteristics */
  characteristics: StyleCharacteristics;
  
  /** Terminology preferences and patterns */
  terminology: TerminologyProfile;
  
  /** Formatting and layout preferences */
  formatting: FormattingProfile;
  
  /** Writing and phrasing patterns */
  writing: WritingProfile;
  
  /** Statistical information about the style profile */
  statistics: StyleProfileStatistics;
  
  /** Tags or categories for organizing style profiles */
  tags: string[];
  
  /** Whether this is a built-in or custom style profile */
  isBuiltIn: boolean;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface StyleCharacteristics {
  /** Formality level (0-10, where 0 is very casual, 10 is very formal) */
  formality: number;
  
  /** Technical complexity level (0-10) */
  technicality: number;
  
  /** Conciseness level (0-10, where 0 is verbose, 10 is concise) */
  conciseness: number;
  
  /** Objectivity level (0-10, where 0 is subjective, 10 is objective) */
  objectivity: number;
  
  /** Tone description */
  tone: 'formal' | 'informal' | 'technical' | 'persuasive' | 'neutral' | 'authoritative';
  
  /** Voice description */
  voice: 'first-person' | 'second-person' | 'third-person' | 'passive' | 'active';
  
  /** Overall style quality rating (0-10) */
  quality: number;
  
  /** Confidence level in the style analysis (0-10) */
  confidence: number;
}

export interface TerminologyProfile {
  /** Preferred terminology for key concepts */
  preferredTerms: Record<string, string[]>;
  
  /** Industry-specific jargon and terms */
  jargon: string[];
  
  /** Technical terms and their definitions */
  technicalTerms: Record<string, string>;
  
  /** Synonyms and their frequency of use */
  synonyms: Record<string, Record<string, number>>;
  
  /** Abbreviations and their expansions */
  abbreviations: Record<string, string>;
  
  /** Terminology consistency score (0-10) */
  consistency: number;
  
  /** Domain-specific terminology patterns */
  domainTerms: string[];
}

export interface FormattingProfile {
  /** Preferred heading styles and hierarchy */
  headings: HeadingStyleProfile;
  
  /** List formatting preferences */
  lists: ListStyleProfile;
  
  /** Table formatting preferences */
  tables: TableStyleProfile;
  
  /** Text formatting preferences */
  text: TextStyleProfile;
  
  /** Paragraph formatting preferences */
  paragraphs: ParagraphStyleProfile;
  
  /** Margins and spacing preferences */
  spacing: SpacingProfile;
  
  /** Font and typography preferences */
  typography: TypographyProfile;
}

export interface HeadingStyleProfile {
  /** Heading hierarchy levels and their formatting */
  levels: Record<string, HeadingStyle>;
  
  /** Preferred heading capitalization */
  capitalization: 'sentence' | 'title' | 'all-caps' | 'all-lowercase';
  
  /** Whether headings should include numbering */
  includeNumbering: boolean;
  
  /** Preferred heading alignment */
  alignment: 'left' | 'center' | 'right' | 'justify';
  
  /** Spacing before and after headings */
  spacing: {
    before: number;
    after: number;
  };
}

export interface HeadingStyle {
  /** Font family for this heading level */
  fontFamily: string;
  
  /** Font size for this heading level */
  fontSize: number;
  
  /** Font weight for this heading level */
  fontWeight: 'normal' | 'bold' | 'light' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  
  /** Font style for this heading level */
  fontStyle: 'normal' | 'italic';
  
  /** Color for this heading level */
  color: string;
  
  /** Text decoration for this heading level */
  textDecoration: 'none' | 'underline' | 'line-through';
  
  /** Letter spacing for this heading level */
  letterSpacing: number;
  
  /** Line height for this heading level */
  lineHeight: number;
}

export interface ListStyleProfile {
  /** Ordered list preferences */
  ordered: ListStyle;
  
  /** Unordered list preferences */
  unordered: ListStyle;
  
  /** List item indentation preferences */
  indentation: number;
  
  /** List spacing preferences */
  spacing: {
    betweenItems: number;
    afterList: number;
  };
}

export interface ListStyle {
  /** Bullet character for unordered lists */
  bullet?: string;
  
  /** Numbering style for ordered lists */
  numberingStyle?: 'decimal' | 'decimal-leading-zero' | 'lower-roman' | 'upper-roman' | 'lower-alpha' | 'upper-alpha';
  
  /** List alignment */
  alignment: 'left' | 'center' | 'right' | 'justify';
  
  /** List marker position */
  markerPosition: 'inside' | 'outside';
}

export interface TableStyleProfile {
  /** Table header style */
  header: TableCellStyle;
  
  /** Table body cell style */
  body: TableCellStyle;
  
  /** Table footer style */
  footer: TableCellStyle;
  
  /** Table border style */
  borders: TableBorderStyle;
  
  /** Table alignment */
  alignment: 'left' | 'center' | 'right';
  
  /** Table spacing */
  spacing: {
    before: number;
    after: number;
    betweenCells: number;
  };
}

export interface TableCellStyle {
  /** Background color */
  backgroundColor: string;
  
  /** Text color */
  color: string;
  
  /** Font family */
  fontFamily: string;
  
  /** Font size */
  fontSize: number;
  
  /** Font weight */
  fontWeight: string;
  
  /** Font style */
  fontStyle: string;
  
  /** Text alignment */
  alignment: 'left' | 'center' | 'right';
  
  /** Vertical alignment */
  verticalAlignment: 'top' | 'middle' | 'bottom';
  
  /** Padding */
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TableBorderStyle {
  /** Border width */
  width: number;
  
  /** Border color */
  color: string;
  
  /** Border style */
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  
  /** Whether borders are shown */
  show: boolean;
}

export interface TextStyleProfile {
  /** Font family */
  fontFamily: string;
  
  /** Font size */
  fontSize: number;
  
  /** Font weight */
  fontWeight: string;
  
  /** Font style */
  fontStyle: string;
  
  /** Text color */
  color: string;
  
  /** Text alignment */
  alignment: 'left' | 'center' | 'right' | 'justify';
  
  /** Line height */
  lineHeight: number;
  
  /** Letter spacing */
  letterSpacing: number;
  
  /** Text decoration */
  textDecoration: string;
  
  /** Text transform */
  textTransform: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

export interface ParagraphStyleProfile {
  /** Text alignment */
  alignment: 'left' | 'center' | 'right' | 'justify';
  
  /** Line height */
  lineHeight: number;
  
  /** Spacing before paragraph */
  spacingBefore: number;
  
  /** Spacing after paragraph */
  spacingAfter: number;
  
  /** Indentation for first line */
  firstLineIndent: number;
  
  /** Whether to justify text */
  justify: boolean;
  
  /** Whether to keep lines together */
  keepLinesTogether: boolean;
  
  /** Whether to keep with next paragraph */
  keepWithNext: boolean;
}

export interface SpacingProfile {
  /** Page margins */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  /** Section spacing */
  sections: {
    before: number;
    after: number;
  };
  
  /** Line spacing */
  lineSpacing: number;
  
  /** Paragraph spacing */
  paragraphSpacing: {
    before: number;
    after: number;
  };
}

export interface TypographyProfile {
  /** Primary font family */
  primaryFont: string;
  
  /** Secondary font family */
  secondaryFont?: string;
  
  /** Font size ranges */
  sizes: {
    heading1: number;
    heading2: number;
    heading3: number;
    heading4: number;
    heading5: number;
    heading6: number;
    body: number;
    caption: number;
    footnote: number;
  };
  
  /** Color palette */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    heading: string;
    link: string;
  };
}

export interface WritingProfile {
  /** Sentence length preferences */
  sentenceLength: {
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
  };
  
  /** Paragraph length preferences */
  paragraphLength: {
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
  };
  
  /** Vocabulary complexity metrics */
  vocabulary: {
    averageWordLength: number;
    uniqueWordRatio: number;
    readabilityScore: number;
  };
  
  /** Transition word usage patterns */
  transitions: Record<string, number>;
  
  /** Punctuation usage patterns */
  punctuation: Record<string, number>;
  
  /** Active vs passive voice ratio */
  voiceRatio: {
    active: number;
    passive: number;
  };
  
  /** Question usage patterns */
  questions: {
    frequency: number;
    types: Record<string, number>;
  };
  
  /** Exclamation usage patterns */
  exclamations: {
    frequency: number;
    contexts: string[];
  };
  
  /** Quotation usage patterns */
  quotations: {
    frequency: number;
    style: 'single' | 'double' | 'mixed';
    introPhrases: string[];
  };
  
  /** List item patterns */
  listItemPatterns: {
    introductoryPhrases: string[];
    consistency: number;
  };
}

export interface StyleProfileStatistics {
  /** Number of documents analyzed to create this profile */
  documentsAnalyzed: number;
  
  /** Total word count analyzed */
  totalWords: number;
  
  /** Total characters analyzed */
  totalCharacters: number;
  
  /** Analysis confidence level (0-10) */
  confidence: number;
  
  /** Analysis completion percentage (0-100) */
  completion: number;
  
  /** Date of last analysis */
  lastAnalyzed: Date;
  
  /** Processing time for analysis */
  processingTime: number;
  
  /** Quality metrics */
  quality: {
    consistency: number;
    completeness: number;
    accuracy: number;
  };
  
  /** Error count during analysis */
  errors: number;
  
  /** Warning count during analysis */
  warnings: number;
}

/** Helper function to create a new style profile */
export function createStyleProfile(
  id: string,
  name: string,
  reportType: string,
  description: string
): StyleProfile {
  return {
    id,
    name,
    reportType,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0',
    characteristics: {
      formality: 5,
      technicality: 5,
      conciseness: 5,
      objectivity: 5,
      tone: 'neutral',
      voice: 'third-person',
      quality: 5,
      confidence: 5,
    },
    terminology: {
      preferredTerms: {},
      jargon: [],
      technicalTerms: {},
      synonyms: {},
      abbreviations: {},
      consistency: 5,
      domainTerms: [],
    },
    formatting: {
      headings: {
        levels: {},
        capitalization: 'title',
        includeNumbering: false,
        alignment: 'left',
        spacing: {
          before: 12,
          after: 12,
        },
      },
      lists: {
        ordered: {
          numberingStyle: 'decimal',
          alignment: 'left',
          markerPosition: 'outside',
        },
        unordered: {
          bullet: '•',
          alignment: 'left',
          markerPosition: 'outside',
        },
        indentation: 24,
        spacing: {
          betweenItems: 6,
          afterList: 12,
        },
      },
      tables: {
        header: {
          backgroundColor: '#f5f5f5',
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          fontWeight: 'bold',
          fontStyle: 'normal',
          alignment: 'left',
          verticalAlignment: 'middle',
          padding: {
            top: 6,
            right: 6,
            bottom: 6,
            left: 6,
          },
        },
        body: {
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
          fontSize: 11,
          fontWeight: 'normal',
          fontStyle: 'normal',
          alignment: 'left',
          verticalAlignment: 'top',
          padding: {
            top: 4,
            right: 4,
            bottom: 4,
            left: 4,
          },
        },
        footer: {
          backgroundColor: '#f9f9f9',
          color: '#666666',
          fontFamily: 'Arial, sans-serif',
          fontSize: 10,
          fontWeight: 'normal',
          fontStyle: 'italic',
          alignment: 'left',
          verticalAlignment: 'top',
          padding: {
            top: 4,
            right: 4,
            bottom: 4,
            left: 4,
          },
        },
        borders: {
          width: 1,
          color: '#cccccc',
          style: 'solid',
          show: true,
        },
        alignment: 'left',
        spacing: {
          before: 12,
          after: 12,
          betweenCells: 0,
        },
      },
      text: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        alignment: 'left',
        lineHeight: 1.15,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none',
      },
      paragraphs: {
        alignment: 'left',
        lineHeight: 1.15,
        spacingBefore: 0,
        spacingAfter: 6,
        firstLineIndent: 0,
        justify: false,
        keepLinesTogether: false,
        keepWithNext: false,
      },
      spacing: {
        margins: {
          top: 25,
          right: 25,
          bottom: 25,
          left: 25,
        },
        sections: {
          before: 18,
          after: 18,
        },
        lineSpacing: 1.15,
        paragraphSpacing: {
          before: 0,
          after: 6,
        },
      },
      typography: {
        primaryFont: 'Arial, sans-serif',
        sizes: {
          heading1: 16,
          heading2: 14,
          heading3: 12,
          heading4: 11,
          heading5: 10,
          heading6: 9,
          body: 11,
          caption: 9,
          footnote: 9,
        },
        colors: {
          primary: '#000000',
          secondary: '#666666',
          accent: '#007bff',
          background: '#ffffff',
          text: '#000000',
          muted: '#666666',
          heading: '#000000',
          link: '#007bff',
        },
      },
    },
    writing: {
      sentenceLength: {
        average: 15,
        min: 5,
        max: 35,
        standardDeviation: 8,
      },
      paragraphLength: {
        average: 60,
        min: 20,
        max: 200,
        standardDeviation: 40,
      },
      vocabulary: {
        averageWordLength: 4.5,
        uniqueWordRatio: 0.7,
        readabilityScore: 60,
      },
      transitions: {},
      punctuation: {},
      voiceRatio: {
        active: 0.7,
        passive: 0.3,
      },
      questions: {
        frequency: 0.1,
        types: {},
      },
      exclamations: {
        frequency: 0.05,
        contexts: [],
      },
      quotations: {
        frequency: 0.2,
        style: 'double',
        introPhrases: [],
      },
      listItemPatterns: {
        introductoryPhrases: [],
        consistency: 5,
      },
    },
    statistics: {
      documentsAnalyzed: 0,
      totalWords: 0,
      totalCharacters: 0,
      confidence: 0,
      completion: 0,
      lastAnalyzed: new Date(),
      processingTime: 0,
      quality: {
        consistency: 0,
        completeness: 0,
        accuracy: 0,
      },
      errors: 0,
      warnings: 0,
    },
    tags: [],
    isBuiltIn: false,
  };
}

/** Helper function to update a style profile */
export function updateStyleProfile(profile: StyleProfile, updates: Partial<StyleProfile>): StyleProfile {
  return {
    ...profile,
    ...updates,
    updatedAt: new Date(),
  };
}

/** Helper function to clone a style profile */
export function cloneStyleProfile(profile: StyleProfile, newId?: string, newName?: string): StyleProfile {
  const cloned = JSON.parse(JSON.stringify(profile));
  cloned.id = newId || `${profile.id}_clone`;
  cloned.name = newName || `${profile.name} (Copy)`;
  cloned.createdAt = new Date();
  cloned.updatedAt = new Date();
  cloned.version = '1.0.0';
  cloned.isBuiltIn = false;
  return cloned;
}