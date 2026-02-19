# Phase 15: HTML Rendering & Visual Reproduction Engine - File/Folder Structure

## Root Directory: `/report-intelligence/visual-rendering/`

### Core Engine Classes
```
visual-rendering/
├── VisualRenderingEngine.ts              # Main orchestrator class
├── CSSLayoutEngine.ts                    # CSS generation and layout management
├── HeaderFooterSystem.ts                 # Header/footer management across pages
├── CoverPageGenerator.ts                 # Cover page generation with branding
├── ImageEmbeddingPipeline.ts             # Image embedding and optimization
├── PageBreakLogic.ts                     # Page break detection and insertion
├── MultiPagePDFExport.ts                 # HTML to PDF conversion with fidelity
├── VisualPreviewWindow.ts                # Sandboxed preview rendering
├── SnapshotCaptureSystem.ts              # Visual snapshot capture and comparison
└── index.ts                              # Main exports
```

### Type Definitions
```
visual-rendering/types/
├── RenderingOptions.ts                   # Rendering configuration options
├── PageLayout.ts                         # Page layout definitions (margins, size, orientation)
├── VisualSnapshot.ts                     # Snapshot data structure and metadata
├── HeaderFooterTemplate.ts               # Header/footer template definitions
├── CoverPageTemplate.ts                  # Cover page template definitions
├── ImageReference.ts                     # Image reference and embedding options
└── PDFExportOptions.ts                   # PDF export configuration
```

### Template Definitions
```
visual-rendering/templates/
├── cover-page-templates.ts               # Predefined cover page templates
├── header-footer-templates.ts            # Header/footer template library
├── css-templates.ts                      # CSS template library for different report types
├── branding-templates.ts                 # Company branding templates
└── template-registry.ts                  # Template registration and management
```

### Rendering Engines
```
visual-rendering/engines/
├── HTMLRenderer.ts                       # Core HTML rendering engine
├── PDFRenderer.ts                        # PDF rendering engine (jsPDF/Puppeteer wrapper)
├── ImageProcessor.ts                     # Image processing and optimization
├── LayoutCalculator.ts                   # Layout calculation and positioning
└── TypographyEngine.ts                   # Typography and font management
```

### Integration Modules
```
visual-rendering/integration/
├── Phase8Integration.ts                  # Integration with Template Generator (Phase 8)
├── Phase10Integration.ts                 # Integration with Reproduction Tester (Phase 10)
├── Phase13Integration.ts                 # Integration with Workflow Learning (Phase 13)
├── Phase14Integration.ts                 # Integration with Report Intelligence System (Phase 14)
└── UnifiedIntegrationService.ts          # Unified integration service
```

### Test Suite
```
visual-rendering/tests/
├── rendering-tests.ts                    # Core rendering engine tests
├── visual-comparison-tests.ts            # Visual comparison and snapshot tests
├── pdf-export-tests.ts                   # PDF export functionality tests
├── integration-tests.ts                  # Integration tests with other phases
├── performance-tests.ts                  # Performance and load testing
└── test-utils.ts                         # Test utilities and helpers
```

### Storage Structure
```
workspace/visual-rendering/
├── snapshots/                            # Visual snapshot storage
│   ├── {report-id}/
│   │   ├── snapshot-{timestamp}.png
│   │   ├── snapshot-{timestamp}.json     # Metadata
│   │   └── diff-{comparison-id}.png      # Visual diffs
│   └── gallery-index.json                # Snapshot gallery index
├── templates/                            # User-defined templates
│   ├── cover-pages.json
│   ├── header-footers.json
│   ├── css-templates.json
│   └── branding-profiles.json
├── exports/                              # Generated exports
│   ├── pdf/
│   ├── html/
│   └── images/
└── cache/                                # Rendering cache
    ├── css-cache.json
    ├── layout-cache.json
    └── image-cache.json
```

### Event System
```
visual-rendering/events/
├── RenderingEventEmitter.ts              # Event emitter for rendering lifecycle
├── events.ts                             # Event type definitions
├── listeners/                            # Event listeners
│   ├── SnapshotCaptureListener.ts
│   ├── PDFExportListener.ts
│   └── PreviewUpdateListener.ts
└── hooks/                                # Event hooks for integration
    ├── Phase10VisualComparisonHook.ts
    └── Phase13WorkflowLearningHook.ts
```

### Utility Modules
```
visual-rendering/utils/
├── css-utils.ts                          # CSS manipulation utilities
├── html-utils.ts                         # HTML manipulation utilities
├── image-utils.ts                        # Image processing utilities
├── pdf-utils.ts                          # PDF generation utilities
├── dom-utils.ts                          # DOM manipulation utilities
└── validation-utils.ts                   # Rendering validation utilities
```

### Configuration
```
visual-rendering/config/
├── default-config.ts                     # Default rendering configuration
├── browser-config.ts                     # Browser-specific rendering config
├── pdf-config.ts                         # PDF export configuration
└── theme-config.ts                       # Theme and styling configuration
```

## Integration Points with Existing System

### 1. Existing Template Service (`src/lib/services/templateService.ts`)
- **Integration**: Phase 15 will extend, not replace, the existing template service
- **Approach**: Add visual rendering methods to the existing service
- **File**: `visual-rendering/integration/LegacyTemplateIntegration.ts`

### 2. Existing Report Preview Component (`src/lib/components/reports/ReportPreview.svelte`)
- **Integration**: Enhance with new VisualPreviewWindow
- **Approach**: Replace iframe with enhanced preview component
- **File**: `visual-rendering/components/EnhancedReportPreview.svelte`

### 3. Existing PDF Export (jsPDF)
- **Integration**: Enhance with MultiPagePDFExport
- **Approach**: Wrap existing jsPDF usage with new engine
- **File**: `visual-rendering/engines/PDFRenderer.ts`

### 4. Report Intelligence System (`report-intelligence/orchestrator/`)
- **Integration**: Add VisualRenderingEngine to the orchestrator
- **Approach**: Extend ReportIntelligenceSystem with rendering capabilities
- **File**: `visual-rendering/integration/Phase14Integration.ts`

## File Dependencies and Relationships

```
VisualRenderingEngine.ts
    ├── depends on: CSSLayoutEngine.ts, HeaderFooterSystem.ts, CoverPageGenerator.ts
    ├── uses: ImageEmbeddingPipeline.ts, PageBreakLogic.ts
    ├── exports to: MultiPagePDFExport.ts, VisualPreviewWindow.ts
    └── integrated with: Phase14Integration.ts

CSSLayoutEngine.ts
    ├── depends on: visual-rendering/templates/css-templates.ts
    ├── uses: visual-rendering/utils/css-utils.ts
    └── exports to: HTMLRenderer.ts, PDFRenderer.ts

HeaderFooterSystem.ts
    ├── depends on: visual-rendering/templates/header-footer-templates.ts
    ├── uses: visual-rendering/types/HeaderFooterTemplate.ts
    └── exports to: VisualRenderingEngine.ts, MultiPagePDFExport.ts

Phase10Integration.ts
    ├── depends on: SnapshotCaptureSystem.ts
    ├── uses: visual-rendering/events/hooks/Phase10VisualComparisonHook.ts
    └── exports to: report-intelligence/reproduction-tester/
```

## Implementation Order

1. **Phase 1**: Core types and interfaces (`visual-rendering/types/`)
2. **Phase 2**: Utility modules (`visual-rendering/utils/`)
3. **Phase 3**: CSSLayoutEngine and HTMLRenderer
4. **Phase 4**: HeaderFooterSystem and CoverPageGenerator
5. **Phase 5**: ImageEmbeddingPipeline and PageBreakLogic
6. **Phase 6**: VisualRenderingEngine (orchestrator)
7. **Phase 7**: MultiPagePDFExport and VisualPreviewWindow
8. **Phase 8**: SnapshotCaptureSystem
9. **Phase 9**: Integration modules
10. **Phase 10**: Test suite
11. **Phase 11**: Storage implementation
12. **Phase 12**: Event system
13. **Phase 13**: Configuration and theming
14. **Phase 14**: Final integration with existing system

## Notes on Existing Codebase Compatibility

1. **TypeScript Compatibility**: All new code must use TypeScript with strict typing
2. **Svelte Compatibility**: Components must work with Svelte's reactivity system
3. **Existing Dependencies**: Must work with existing jsPDF, marked, dompurify dependencies
4. **Performance Considerations**: Rendering must be efficient for large reports
5. **Browser Compatibility**: Must support modern browsers (Chrome, Firefox, Safari)
6. **Mobile Responsiveness**: Preview should work on mobile devices
7. **Accessibility**: Generated HTML must be accessible (WCAG guidelines)