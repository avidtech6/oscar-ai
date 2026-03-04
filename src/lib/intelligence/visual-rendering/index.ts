/**
 * Visual Rendering Subsystem (Phase 15)
 * 
 * HTML Rendering & Visual Reproduction Engine
 */

export { VisualRenderingEngine } from './VisualRenderingEngine';
export { CSSLayoutEngine } from './CSSLayoutEngine';
export { HeaderFooterSystem } from './HeaderFooterSystem';
export { CoverPageGenerator } from './CoverPageGenerator';
export { ImageEmbeddingPipeline } from './ImageEmbeddingPipeline';
export { PageBreakLogic } from './PageBreakLogic';
export { MultiPagePDFExport } from './MultiPagePDFExport';
export { VisualPreviewWindow } from './VisualPreviewWindow';
export { SnapshotCaptureSystem } from './SnapshotCaptureSystem';

// Integration modules
export { Phase8Integration } from './integration/Phase8Integration';
export { Phase10Integration } from './integration/Phase10Integration';
export { Phase13Integration } from './integration/Phase13Integration';
export { Phase14Integration } from './integration/Phase14Integration';

// Types
export * from './types/RenderingOptions';
export * from './types/PageLayout';
export * from './types/VisualSnapshot';