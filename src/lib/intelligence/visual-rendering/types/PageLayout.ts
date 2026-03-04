/**
 * Represents a single page layout.
 */
export interface PageLayout {
  /** Page number (1‑based) */
  pageNumber: number;
  /** Page width in CSS units */
  width: string;
  /** Page height in CSS units */
  height: string;
  /** Page orientation */
  orientation: 'portrait' | 'landscape';
  /** Margins */
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  /** Header height */
  headerHeight: string;
  /** Footer height */
  footerHeight: string;
  /** Content area dimensions */
  contentArea: {
    top: string;
    right: string;
    bottom: string;
    left: string;
    width: string;
    height: string;
  };
  /** Whether this page is a cover page */
  isCoverPage: boolean;
  /** Whether this page is a blank page (e.g., forced page break) */
  isBlankPage: boolean;
  /** CSS class(es) for this page */
  cssClass: string;
}

/**
 * Default A4 portrait page layout.
 */
export const defaultA4PortraitLayout: PageLayout = {
  pageNumber: 1,
  width: '210mm',
  height: '297mm',
  orientation: 'portrait',
  margins: {
    top: '25mm',
    right: '20mm',
    bottom: '25mm',
    left: '20mm'
  },
  headerHeight: '15mm',
  footerHeight: '15mm',
  contentArea: {
    top: '40mm',
    right: '20mm',
    bottom: '40mm',
    left: '20mm',
    width: '170mm',
    height: '217mm'
  },
  isCoverPage: false,
  isBlankPage: false,
  cssClass: 'page-a4-portrait'
};

/**
 * Default Letter portrait page layout.
 */
export const defaultLetterPortraitLayout: PageLayout = {
  pageNumber: 1,
  width: '8.5in',
  height: '11in',
  orientation: 'portrait',
  margins: {
    top: '1in',
    right: '1in',
    bottom: '1in',
    left: '1in'
  },
  headerHeight: '0.5in',
  footerHeight: '0.5in',
  contentArea: {
    top: '1.5in',
    right: '1in',
    bottom: '1.5in',
    left: '1in',
    width: '6.5in',
    height: '9in'
  },
  isCoverPage: false,
  isBlankPage: false,
  cssClass: 'page-letter-portrait'
};