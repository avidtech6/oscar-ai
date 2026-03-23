/**
 * Render Options Interface
 * 
 * Defines the configuration options for HTML rendering operations
 * PHASE 15 — HTML Rendering & Visual Reproduction Engine
 */

export interface RenderOptions {
  /** Document ID for tracking */
  documentId: string;
  
  /** Rendering mode */
  mode: 'html' | 'pdf' | 'print' | 'preview';
  
  /** Target viewport width */
  viewportWidth?: number;
  
  /** Target viewport height */
  viewportHeight?: number;
  
  /** Enable responsive design */
  responsive?: boolean;
  
  /** Include navigation elements */
  includeNavigation?: boolean;
  
  /** Enable accessibility features */
  accessibility?: boolean;
  
  /** Color theme */
  theme?: 'light' | 'dark' | 'auto';
  
  /** Font settings */
  fontSettings?: {
    family?: string;
    size?: number;
    lineHeight?: number;
  };
  
  /** Page layout settings */
  pageLayout?: {
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    orientation?: 'portrait' | 'landscape';
    size?: 'A4' | 'letter' | 'legal';
  };
  
  /** Image handling */
  images?: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    optimize?: boolean;
  };
  
  /** CSS styling options */
  styling?: {
    customCSS?: string;
    includeDefaultStyles?: boolean;
    preserveStyles?: boolean;
  };
  
  /** Metadata for rendering */
  metadata?: {
    title?: string;
    author?: string;
    description?: string;
    keywords?: string[];
  };
  
  /** Progress callback */
  onProgress?: (progress: number, message: string) => void;
  
  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Default render options
 */
export const DEFAULT_RENDER_OPTIONS: Partial<RenderOptions> = {
  mode: 'html',
  responsive: true,
  accessibility: true,
  theme: 'auto',
  fontSettings: {
    family: 'Arial, sans-serif',
    size: 12,
    lineHeight: 1.5
  },
  pageLayout: {
    margins: {
      top: 2.5,
      right: 2.5,
      bottom: 2.5,
      left: 2.5
    },
    orientation: 'portrait',
    size: 'A4'
  },
  images: {
    quality: 0.8,
    maxWidth: 800,
    maxHeight: 600,
    optimize: true
  },
  styling: {
    includeDefaultStyles: true,
    preserveStyles: true
  }
};

/**
 * Render result interface
 */
export interface RenderResult {
  /** Document ID */
  documentId: string;
  
  /** Rendered content */
  content: string;
  
  /** Content type */
  contentType: 'html' | 'pdf' | 'text';
  
  /** File size in bytes */
  fileSize: number;
  
  /** Render duration in milliseconds */
  renderTime: number;
  
  /** Success status */
  success: boolean;
  
  /** Error message if failed */
  error?: string;
  
  /** Additional metadata */
  metadata?: {
    wordCount?: number;
    pageCount?: number;
    imageCount?: number;
    linkCount?: number;
  };
  
  /** Timestamp */
  timestamp: Date;
}

/**
 * Progress tracking interface
 */
export interface RenderProgress {
  /** Current progress percentage */
  progress: number;
  
  /** Current stage */
  stage: 'initializing' | 'processing' | 'rendering' | 'finalizing' | 'completed';
  
  /** Progress message */
  message: string;
  
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  
  /** Current operation details */
  details?: string;
}