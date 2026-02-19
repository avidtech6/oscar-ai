/**
 * Report Schema Mapper - Phase 3
 * Integration Example
 * 
 * Demonstrates integration between Phase 1 (Report Type Registry),
 * Phase 2 (Report Decompiler), and Phase 3 (Schema Mapper).
 */

import { ReportTypeRegistry } from '../../registry/ReportTypeRegistry';
import { ReportTypeDefinition } from '../../registry/ReportTypeDefinition';
import { createDecompiledReport, DecompiledReport } from '../../decompiler/DecompiledReport';
import { ReportSchemaMapper } from '../ReportSchemaMapper';
import { SchemaMappingResultStorage } from '../storage/SchemaMappingResultStorage';

/**
 * Example: Complete workflow from decompiled report to schema mapping
 */
async function demonstrateIntegration(): Promise<void> {
  console.log('=== Phase 3 Integration Example ===');
  
  // Step 1: Create a Report Type Registry (Phase 1)
  console.log('\n1. Creating Report Type Registry (Phase 1)...');
  const registry = new ReportTypeRegistry();
  
  // Register a sample report type
  const sampleReportType: ReportTypeDefinition = {
    id: 'bs5837_tree_survey',
    name: 'BS5837 Tree Survey Report',
    description: 'Standard tree survey report following BS5837:2012',
    category: 'arboriculture',
    version: '1.0.0',
    requiredSections: [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        description: 'Brief overview of findings and recommendations',
        template: 'Provide a concise summary of the survey findings.',
        aiGuidance: 'Focus on key findings and immediate recommendations.'
      },
      {
        id: 'site_description',
        name: 'Site Description',
        description: 'Description of the survey site',
        template: 'Describe the site location, boundaries, and context.',
        aiGuidance: 'Include location, site history, and current conditions.'
      },
      {
        id: 'methodology',
        name: 'Methodology',
        description: 'Survey methods and approach',
        template: 'Detail the survey methods, equipment, and standards followed.',
        aiGuidance: 'Reference BS5837:2012 standards and survey protocols.'
      }
    ],
    optionalSections: [
      {
        id: 'appendices',
        name: 'Appendices',
        description: 'Supplementary materials',
        template: 'Include any supporting documents, photos, or data.',
        aiGuidance: 'Organize by appendix letter with clear titles.'
      }
    ],
    conditionalSections: [],
    complianceRules: [
      {
        id: 'bs5837_2012',
        name: 'BS5837:2012 Compliance',
        standard: 'BS5837:2012',
        description: 'Compliance with British Standard for trees in relation to construction',
        severity: 'critical',
        validationLogic: 'Check for required sections and terminology'
      }
    ],
    tags: ['arboriculture', 'tree-survey', 'bs5837', 'planning'],
    supportedFormats: ['pdf', 'docx', 'markdown'],
    aiGuidance: {
      general: 'Follow BS5837:2012 standards throughout the report.',
      tone: 'Professional, factual, and clear.',
      structure: 'Use clear headings and logical flow.',
      terminology: 'Use standard arboricultural terminology.'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deprecated: false
  };
  
  registry.registerType(sampleReportType);
  console.log(`Registered report type: ${sampleReportType.name}`);
  
  // Step 2: Create a decompiled report (Phase 2)
  console.log('\n2. Creating decompiled report (Phase 2)...');
  const sampleText = `
    BS5837 Tree Survey Report
    Site: 123 Oak Street, London
    
    Executive Summary
    The survey identified 15 trees on site, with 3 requiring removal due to poor condition.
    
    Site Description
    The site is located at 123 Oak Street in central London. It is a residential development site.
    
    Methodology
    The survey was conducted following BS5837:2012 standards using visual tree assessment.
    
    Additional Notes
    Some trees show signs of decay and require monitoring.
  `;
  
  const decompiledReport: DecompiledReport = {
    ...createDecompiledReport(sampleText, 'text'),
    id: 'decompiled_123',
    createdAt: new Date(),
    processedAt: new Date(),
    detectedReportType: 'bs5837_tree_survey',
    sections: [
      {
        id: 'sec1',
        type: 'heading',
        level: 1,
        title: 'BS5837 Tree Survey Report',
        content: 'BS5837 Tree Survey Report',
        startLine: 1,
        endLine: 1,
        childrenIds: [],
        metadata: {
          wordCount: 4,
          lineCount: 1,
          hasNumbers: false,
          hasBullets: false,
          hasTables: false,
          confidence: 0.9
        }
      },
      {
        id: 'sec2',
        type: 'section',
        level: 0,
        title: 'Site',
        content: 'Site: 123 Oak Street, London',
        startLine: 2,
        endLine: 2,
        childrenIds: [],
        metadata: {
          wordCount: 5,
          lineCount: 1,
          hasNumbers: true,
          hasBullets: false,
          hasTables: false,
          confidence: 0.8
        }
      },
      {
        id: 'sec3',
        type: 'heading',
        level: 2,
        title: 'Executive Summary',
        content: 'The survey identified 15 trees on site, with 3 requiring removal due to poor condition.',
        startLine: 4,
        endLine: 5,
        childrenIds: [],
        metadata: {
          wordCount: 15,
          lineCount: 2,
          hasNumbers: true,
          hasBullets: false,
          hasTables: false,
          confidence: 0.95
        }
      },
      {
        id: 'sec4',
        type: 'heading',
        level: 2,
        title: 'Site Description',
        content: 'The site is located at 123 Oak Street in central London. It is a residential development site.',
        startLine: 7,
        endLine: 8,
        childrenIds: [],
        metadata: {
          wordCount: 16,
          lineCount: 2,
          hasNumbers: true,
          hasBullets: false,
          hasTables: false,
          confidence: 0.9
        }
      },
      {
        id: 'sec5',
        type: 'heading',
        level: 2,
        title: 'Methodology',
        content: 'The survey was conducted following BS5837:2012 standards using visual tree assessment.',
        startLine: 10,
        endLine: 10,
        childrenIds: [],
        metadata: {
          wordCount: 12,
          lineCount: 1,
          hasNumbers: true,
          hasBullets: false,
          hasTables: false,
          confidence: 0.85
        }
      },
      {
        id: 'sec6',
        type: 'heading',
        level: 2,
        title: 'Additional Notes',
        content: 'Some trees show signs of decay and require monitoring.',
        startLine: 12,
        endLine: 12,
        childrenIds: [],
        metadata: {
          wordCount: 8,
          lineCount: 1,
          hasNumbers: false,
          hasBullets: false,
          hasTables: false,
          confidence: 0.8
        }
      }
    ],
    terminology: [
      {
        term: 'BS5837',
        context: 'survey standards',
        frequency: 2,
        category: 'compliance',
        confidence: 0.9
      },
      {
        term: 'arboricultural',
        context: 'tree assessment',
        frequency: 1,
        category: 'technical',
        confidence: 0.8
      }
    ],
    complianceMarkers: [
      {
        type: 'standard',
        text: 'BS5837:2012',
        standard: 'BS5837:2012',
        confidence: 0.95
      }
    ],
    confidenceScore: 0.85,
    processingTimeMs: 150
  };
  
  console.log(`Created decompiled report with ${decompiledReport.sections.length} sections`);
  
  // Step 3: Create Schema Mapper (Phase 3) with registry integration
  console.log('\n3. Creating Schema Mapper (Phase 3)...');
  const schemaMapper = new ReportSchemaMapper(registry);
  
  // Add event listeners to monitor mapping process
  schemaMapper.on('schemaMapper:started', (event, data) => {
    console.log(`  Event: ${event} - Mapping ID: ${data.mappingResultId}`);
  });
  
  schemaMapper.on('schemaMapper:reportTypeIdentified', (event, data) => {
    console.log(`  Event: ${event} - Report type: ${data.reportTypeName}`);
  });
  
  schemaMapper.on('schemaMapper:completed', (event, data) => {
    console.log(`  Event: ${event} - Confidence: ${data.confidenceScore.toFixed(2)}`);
  });
  
  // Step 4: Perform schema mapping
  console.log('\n4. Performing schema mapping...');
  try {
    const mappingResult = await schemaMapper.map(decompiledReport);
    
    console.log('\nMapping Results:');
    console.log(`  - Mapped fields: ${mappingResult.mappedFields.length}`);
    console.log(`  - Missing required sections: ${mappingResult.missingRequiredSections.length}`);
    console.log(`  - Extra sections: ${mappingResult.extraSections.length}`);
    console.log(`  - Unknown terminology: ${mappingResult.unknownTerminology.length}`);
    console.log(`  - Schema gaps: ${mappingResult.schemaGaps.length}`);
    console.log(`  - Confidence score: ${mappingResult.confidenceScore.toFixed(2)}`);
    console.log(`  - Mapping coverage: ${mappingResult.mappingCoverage}%`);
    console.log(`  - Completeness score: ${mappingResult.completenessScore}%`);
    
    // Step 5: Store mapping results
    console.log('\n5. Storing mapping results...');
    const storage = new SchemaMappingResultStorage();
    await storage.saveResult(mappingResult);
    
    const stats = storage.getStatistics();
    console.log(`  - Total results stored: ${stats.totalResults}`);
    console.log(`  - Average confidence: ${stats.averageConfidence.toFixed(2)}`);
    
    // Step 6: Query stored results
    console.log('\n6. Querying stored results...');
    const recentResults = storage.getRecentResults(3);
    console.log(`  - Recent results: ${recentResults.length}`);
    
    const highConfidenceResults = storage.getResultsByConfidence(0.7);
    console.log(`  - High confidence results (≥0.7): ${highConfidenceResults.length}`);
    
    console.log('\n=== Integration Example Complete ===');
    console.log('\nSummary:');
    console.log('  ✓ Phase 1: Report Type Registry created and populated');
    console.log('  ✓ Phase 2: Decompiled report created with sections and terminology');
    console.log('  ✓ Phase 3: Schema mapper successfully mapped report to schema');
    console.log('  ✓ Storage: Mapping results stored and queried successfully');
    console.log('  ✓ Events: Event system tracked mapping progress');
    
  } catch (error) {
    console.error('Error during schema mapping:', error);
  }
}

// Run the example
demonstrateIntegration().catch(console.error);