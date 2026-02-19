/**
 * Report Classification Engine - Phase 6
 * Integration Example
 * 
 * Demonstrates integration of Report Classification Engine with Phase 1-5 components.
 */

import { ReportClassificationEngine } from '../ReportClassificationEngine';
import { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import type { DecompiledReport, DetectedSection, ExtractedMetadata, TerminologyEntry, ComplianceMarker, StructureMap } from '../../decompiler/DecompiledReport';

/**
 * Create a mock decompiled report for testing
 */
function createMockDecompiledReport(): DecompiledReport {
  const now = new Date();
  
  const sections: DetectedSection[] = [
    {
      id: 'intro',
      type: 'section',
      title: 'Introduction',
      content: 'This is a tree survey report for the proposed development site.',
      level: 1,
      startLine: 1,
      endLine: 5,
      childrenIds: [],
      metadata: {
        wordCount: 12,
        lineCount: 1,
        hasNumbers: false,
        hasBullets: false,
        hasTables: false,
        confidence: 0.9
      }
    },
    {
      id: 'methodology',
      type: 'methodology',
      title: 'Methodology',
      content: 'The survey was conducted in accordance with BS5837:2012 standards.',
      level: 1,
      startLine: 6,
      endLine: 10,
      childrenIds: [],
      metadata: {
        wordCount: 10,
        lineCount: 1,
        hasNumbers: false,
        hasBullets: false,
        hasTables: false,
        confidence: 0.9
      }
    },
    {
      id: 'findings',
      type: 'section',
      title: 'Findings',
      content: 'A total of 15 trees were identified on site, including 3 category A trees.',
      level: 1,
      startLine: 11,
      endLine: 15,
      childrenIds: [],
      metadata: {
        wordCount: 15,
        lineCount: 1,
        hasNumbers: true,
        hasBullets: false,
        hasTables: false,
        confidence: 0.9
      }
    },
    {
      id: 'recommendations',
      type: 'section',
      title: 'Recommendations',
      content: 'Recommend retention of all category A trees with appropriate protection zones.',
      level: 1,
      startLine: 16,
      endLine: 20,
      childrenIds: [],
      metadata: {
        wordCount: 12,
        lineCount: 1,
        hasNumbers: false,
        hasBullets: false,
        hasTables: false,
        confidence: 0.9
      }
    }
  ];
  
  const metadata: ExtractedMetadata = {
    title: 'Tree Survey Report',
    author: 'John Smith',
    date: now.toISOString(),
    client: 'ABC Developments Ltd',
    keywords: ['tree', 'survey', 'BS5837', 'development']
  };
  
  const terminology: TerminologyEntry[] = [
    {
      term: 'BS5837',
      frequency: 3,
      context: 'survey standard',
      category: 'compliance',
      confidence: 0.9
    },
    {
      term: 'category A',
      frequency: 2,
      context: 'tree category',
      category: 'technical',
      confidence: 0.8
    },
    {
      term: 'protection zone',
      frequency: 1,
      context: 'tree protection',
      category: 'technical',
      confidence: 0.7
    }
  ];
  
  const complianceMarkers: ComplianceMarker[] = [
    {
      type: 'standard',
      text: 'BS5837:2012 compliance',
      standard: 'BS5837:2012',
      confidence: 0.9
    },
    {
      type: 'regulation',
      text: 'Planning Policy compliance',
      standard: 'Planning Policy',
      confidence: 0.8
    }
  ];
  
  const structureMap: StructureMap = {
    hierarchy: [
      {
        id: 'intro',
        type: 'section',
        level: 1,
        title: 'Introduction',
        children: []
      },
      {
        id: 'methodology',
        type: 'methodology',
        level: 1,
        title: 'Methodology',
        children: []
      },
      {
        id: 'findings',
        type: 'section',
        level: 1,
        title: 'Findings',
        children: []
      },
      {
        id: 'recommendations',
        type: 'section',
        level: 1,
        title: 'Recommendations',
        children: []
      }
    ],
    depth: 1,
    sectionCount: 4,
    averageSectionLength: 12.25,
    hasAppendices: false,
    hasMethodology: true,
    hasLegalSections: false
  };
  
  return {
    id: `report_${Date.now()}`,
    sourceHash: 'mock_hash_' + Date.now(),
    rawText: 'Mock raw text content',
    normalizedText: 'Mock normalized text content',
    detectedReportType: undefined,
    sections,
    metadata,
    terminology,
    complianceMarkers,
    structureMap,
    inputFormat: 'text',
    processingTimeMs: 100,
    confidenceScore: 0.85,
    createdAt: now,
    processedAt: now,
    detectorResults: {
      headings: { count: 4, confidence: 0.9 },
      sections: { count: 4, confidence: 0.9 },
      lists: { count: 0, confidence: 0 },
      tables: { count: 0, confidence: 0 },
      metadata: { confidence: 0.8 },
      terminology: { count: 3, confidence: 0.8 },
      compliance: { count: 2, confidence: 0.85 },
      appendices: { count: 0, confidence: 0 }
    },
    warnings: [],
    errors: []
  };
}

/**
 * Register sample report types in the registry
 */
function registerSampleReportTypes(registry: ReportTypeRegistry): void {
  const now = new Date();
  
  // Survey Report Type
  registry.registerType({
    id: 'survey',
    name: 'Survey Report',
    description: 'Standard survey report for site assessments',
    category: 'survey',
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
    requiredSections: [
      { id: 'intro', name: 'Introduction', description: 'Report introduction', required: true },
      { id: 'methodology', name: 'Methodology', description: 'Survey methodology', required: true },
      { id: 'findings', name: 'Findings', description: 'Survey findings', required: true }
    ],
    optionalSections: [
      { id: 'recommendations', name: 'Recommendations', description: 'Recommendations', required: false },
      { id: 'appendices', name: 'Appendices', description: 'Supporting documents', required: false }
    ],
    conditionalSections: [],
    dependencies: [],
    relatedReportTypes: ['assessment'],
    complianceRules: [
      {
        id: 'bs5837',
        name: 'BS5837 Compliance',
        description: 'Compliance with British Standard 5837',
        standard: 'BS5837:2012',
        rule: 'Trees should be surveyed in accordance with BS5837:2012',
        severity: 'critical'
      }
    ],
    standards: ['BS5837:2012', 'Arboricultural Association Guidelines'],
    aiGuidance: [
      {
        id: 'survey-guidance',
        purpose: 'generation',
        guidance: 'Focus on factual observations and measurable data'
      }
    ],
    tags: ['survey', 'trees', 'site', 'assessment'],
    estimatedGenerationTime: 120,
    complexity: 'medium',
    typicalAudience: ['planners', 'developers', 'local authority'],
    defaultTemplateId: 'survey-template',
    templateVariants: [],
    supportedFormats: ['pdf', 'html'],
    defaultFormat: 'pdf'
  });
  
  // Assessment Report Type
  registry.registerType({
    id: 'assessment',
    name: 'Assessment Report',
    description: 'Technical assessment and evaluation report',
    category: 'assessment',
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
    requiredSections: [
      { id: 'executive-summary', name: 'Executive Summary', description: 'Report summary', required: true },
      { id: 'assessment-criteria', name: 'Assessment Criteria', description: 'Evaluation criteria', required: true },
      { id: 'analysis', name: 'Analysis', description: 'Technical analysis', required: true }
    ],
    optionalSections: [
      { id: 'conclusions', name: 'Conclusions', description: 'Conclusions', required: false },
      { id: 'actions', name: 'Recommended Actions', description: 'Recommended actions', required: false }
    ],
    conditionalSections: [],
    dependencies: [],
    relatedReportTypes: ['survey'],
    complianceRules: [
      {
        id: 'risk-assessment',
        name: 'Risk Assessment',
        description: 'Risk assessment requirements',
        standard: 'Health and Safety',
        rule: 'All risks must be assessed and mitigated',
        severity: 'critical'
      }
    ],
    standards: ['ISO 31000', 'Health and Safety Executive'],
    aiGuidance: [
      {
        id: 'assessment-guidance',
        purpose: 'generation',
        guidance: 'Focus on analytical reasoning and evidence-based conclusions'
      }
    ],
    tags: ['assessment', 'evaluation', 'analysis', 'technical'],
    estimatedGenerationTime: 180,
    complexity: 'complex',
    typicalAudience: ['technical', 'experts', 'reviewers'],
    defaultTemplateId: 'assessment-template',
    templateVariants: [],
    supportedFormats: ['pdf', 'docx'],
    defaultFormat: 'pdf'
  });
}

/**
 * Main integration example
 */
async function runIntegrationExample(): Promise<void> {
  console.log('=== Report Classification Engine Integration Example ===\n');
  
  // 1. Create and initialize report type registry (Phase 1)
  console.log('1. Initializing Report Type Registry (Phase 1)...');
  const registry = new ReportTypeRegistry();
  registerSampleReportTypes(registry);
  console.log(`   Registered ${registry.getAllTypes().length} report types\n`);
  
  // 2. Create classification engine with registry integration
  console.log('2. Creating Report Classification Engine (Phase 6)...');
  const classificationEngine = new ReportClassificationEngine(registry, {
    confidenceThreshold: 0.7,
    ambiguityThreshold: 0.2,
    scoringWeights: {
      structure: 0.3,
      terminology: 0.25,
      compliance: 0.2,
      metadata: 0.15,
      ordering: 0.1
    },
    autoSaveResults: true
  });
  
  // Set up event listeners
  classificationEngine.on('classification:started', (eventData: any) => {
    console.log(`   Event: ${eventData.event} - Report: ${eventData.data.reportId}`);
  });
  
  classificationEngine.on('classification:candidateScored', (eventData: any) => {
    console.log(`   Event: ${eventData.event} - ${eventData.data.reportTypeId}: ${eventData.data.score.toFixed(2)}`);
  });
  
  classificationEngine.on('classification:completed', (eventData: any) => {
    const result = eventData.data.result;
    console.log(`   Event: ${eventData.event} - Detected: ${result.detectedReportTypeId || 'none'} (confidence: ${result.confidenceScore.toFixed(2)})`);
  });
  
  // 3. Create mock decompiled report (Phase 2)
  console.log('3. Creating mock decompiled report (Phase 2)...');
  const decompiledReport = createMockDecompiledReport();
  console.log(`   Report ID: ${decompiledReport.id}`);
  console.log(`   Sections: ${decompiledReport.sections.length}`);
  console.log(`   Compliance markers: ${decompiledReport.complianceMarkers.length}\n`);
  
  // 4. Classify the report
  console.log('4. Classifying report...');
  try {
    const startTime = Date.now();
    const classificationResult = await classificationEngine.classify(decompiledReport);
    const processingTime = Date.now() - startTime;
    
    console.log(`   Classification completed in ${processingTime}ms`);
    console.log(`   Detected report type: ${classificationResult.detectedReportTypeId || 'none'}`);
    console.log(`   Confidence score: ${classificationResult.confidenceScore.toFixed(2)}`);
    console.log(`   Ambiguity level: ${classificationResult.ambiguityLevel}`);
    console.log(`   Ranked candidates: ${classificationResult.rankedCandidates.length}`);
    
    // Display top candidates
    console.log('\n   Top candidates:');
    classificationResult.rankedCandidates.slice(0, 3).forEach((candidate, index) => {
      console.log(`   ${index + 1}. ${candidate.reportTypeId}: ${candidate.score.toFixed(2)}`);
      console.log(`      Breakdown: S${candidate.breakdown.structure.toFixed(1)} T${candidate.breakdown.terminology.toFixed(1)} C${candidate.breakdown.compliance.toFixed(1)} M${candidate.breakdown.metadata.toFixed(1)} O${candidate.breakdown.ordering.toFixed(1)}`);
    });
    
    // 5. Display classification reasons
    console.log('\n   Classification reasons:');
    classificationResult.reasons.forEach((reason, index) => {
      console.log(`   ${index + 1}. ${reason}`);
    });
    
    // 6. Test storage integration
    console.log('\n5. Testing storage integration...');
    const storedResults = await classificationEngine.getClassificationResultsForReport(decompiledReport.id);
    console.log(`   Stored results for report: ${storedResults.length}`);
    
    // 7. Test engine statistics
    console.log('\n6. Engine statistics:');
    const stats = classificationEngine.getStatistics();
    console.log(`   Total classifications: ${stats.totalClassifications}`);
    console.log(`   Clear classifications: ${stats.totalClearClassifications}`);
    console.log(`   Ambiguous classifications: ${stats.totalAmbiguousClassifications}`);
    console.log(`   Clear classification rate: ${(stats.clearClassificationRate * 100).toFixed(1)}%`);
    console.log(`   Active results in cache: ${stats.activeResults}`);
    
    // 8. Test integration with Phase 3-5 (conceptual)
    console.log('\n7. Integration with Phase 3-5 (conceptual):');
    console.log('   - Phase 3 (Schema Mapper): Classification result can inform schema mapping');
    console.log('   - Phase 4 (Schema Updater): Ambiguous classifications can trigger schema updates');
    console.log('   - Phase 5 (Style Learner): Classification can guide style profile selection');
    
    // 9. Test ambiguity detection
    console.log('\n8. Testing ambiguity scenarios...');
    if (classificationResult.ambiguityLevel === 'high' || classificationResult.ambiguityLevel === 'very-high') {
      console.log('   ⚠️  High ambiguity detected - manual review recommended');
      console.log('   This would trigger Phase 7 (Self-Healing Engine) in production');
    } else if (classificationResult.ambiguityLevel === 'medium') {
      console.log('   ⚠️  Medium ambiguity - consider reviewing alternatives');
    } else {
      console.log('   ✓ Clear classification - ready for downstream processing');
    }
    
  } catch (error) {
    console.error(`   Classification failed: ${error}`);
  }
  
  console.log('\n=== Integration Example Complete ===');
}

/**
 * Run the example
 */
if (require.main === module) {
  runIntegrationExample().catch(console.error);
}

export { runIntegrationExample };