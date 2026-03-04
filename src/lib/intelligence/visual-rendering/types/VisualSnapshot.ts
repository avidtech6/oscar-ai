/**
 * A visual snapshot of a rendered report.
 */
export interface VisualSnapshot {
  /** Unique snapshot ID */
  snapshotId: string;
  /** Report ID this snapshot belongs to */
  reportId: string;
  /** Timestamp when snapshot was taken */
  timestamp: string;
  /** Snapshot format */
  format: 'png' | 'jpeg' | 'webp';
  /** Base64‑encoded image data */
  imageData: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** DPI (dots per inch) */
  dpi: number;
  /** Snapshot metadata */
  metadata: {
    /** Rendering options used */
    renderingOptions: Record<string, any>;
    /** Page count */
    pageCount: number;
    /** Whether cover page was included */
    coverPageIncluded: boolean;
    /** Whether header/footer were included */
    headerFooterIncluded: boolean;
    /** CSS theme used */
    cssTheme: string;
    /** Page size */
    pageSize: string;
    /** Orientation */
    orientation: string;
  };
  /** Similarity score compared to a reference snapshot (0‑1) */
  similarityScore?: number;
  /** Reference snapshot ID (if this is a diff) */
  referenceSnapshotId?: string;
}

/**
 * Creates a new visual snapshot.
 */
export function createVisualSnapshot(
  reportId: string,
  imageData: string,
  width: number,
  height: number,
  metadata: Partial<VisualSnapshot['metadata']> = {}
): VisualSnapshot {
  const timestamp = new Date().toISOString();
  const snapshotId = `snapshot-${reportId}-${timestamp.replace(/[:.]/g, '-')}`;
  return {
    snapshotId,
    reportId,
    timestamp,
    format: 'png',
    imageData,
    width,
    height,
    dpi: 96,
    metadata: {
      renderingOptions: {},
      pageCount: 1,
      coverPageIncluded: false,
      headerFooterIncluded: false,
      cssTheme: 'default',
      pageSize: 'A4',
      orientation: 'portrait',
      ...metadata
    }
  };
}