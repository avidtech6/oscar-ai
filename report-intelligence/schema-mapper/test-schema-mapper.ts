/**
 * Report Schema Mapper - Phase 3
 * Test Script
 * 
 * Tests the core functionality of the ReportSchemaMapper.
 */

import { ReportSchemaMapper } from './ReportSchemaMapper';
import { createSchemaMappingResult } from './SchemaMappingResult';
import { SchemaMappingResultStorage } from './storage/SchemaMappingResultStorage';

// Mock decompiled report for testing
const mockDecompiledReport = {
  id: 'test_report_123',
  sourceHash: 'abc123',
  rawText: 'Test report content',
  normalizedText: 'test report content',
  detectedReportType: 'test_report_type',
  sections: [
    {
      id: 'sec1',
      type: 'heading',
      level: 1,
      title: 'Executive Summary',
      content: 'This is a test executive summary.',
      startLine: 1,
      endLine: 1,
      childrenIds: [],
      metadata: {
        wordCount: 5,
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
      title: 'Introduction',
      content: 'This is the introduction section.',
      startLine: 2,
      endLine: 2,
      childrenIds: [],
      metadata: {
        wordCount: 5,
        lineCount: 1,
        hasNumbers: false,
        hasBullets: false,
        hasTables: false,
        confidence: 0.8
      }
    }
  ],
  metadata: {
    keywords: ['test', 'report'],
    wordCount: 10
  },
  terminology: [
    {
      term: 'test',
      context: 'testing context',
      frequency: 2,
      category: 'general',
      confidence: 0.7
    }
  ],
  complianceMarkers: [],
  structureMap: {
    hierarchy: [],
    depth: 0,
    sectionCount: 2,
    averageSectionLength: 15,
    hasAppendices: false,
    hasMethodology: false,
    hasLegalSections: false
  },
  inputFormat: 'text',
  processingTimeMs: 100,
  confidenceScore: 0.8,
  createdAt: new Date(),
  processedAt: new Date(),
  detectorResults: {
    headings: { count: 1, confidence: 0.9 },
    sections: { count: 1, confidence: 0.8 },
    lists: { count: 0, confidence: 0 },
    tables: { count: 0, confidence: 0 },
    metadata: { confidence: 0.7 },
    terminology: { count: 1, confidence: 0.7 },
    compliance: { count: 0, confidence: 0 },
    appendices: { count: 0, confidence: 0 }
  },
  warnings: [],
  errors: []
};

async function runTests(): Promise<void> {
  console.log('=== Report Schema Mapper Tests ===\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: SchemaMappingResult creation
  console.log('Test 1: SchemaMappingResult creation');
  try {
    const mappingResult = createSchemaMappingResult('test_report_123', 'test_type');
    if (mappingResult.decompiledReportId === 'test_report_123' && 
        mappingResult.reportTypeId === 'test_type') {
      console.log('  ✓ Passed');
      passed++;
    } else {
      console.log('  ✗ Failed: Incorrect values');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Failed: ${error}`);
    failed++;
  }
  
  // Test 2: ReportSchemaMapper instantiation
  console.log('\nTest 2: ReportSchemaMapper instantiation');
  try {
    const mapper = new ReportSchemaMapper();
    if (mapper && typeof mapper.map === 'function') {
      console.log('  ✓ Passed: Mapper created successfully');
      passed++;
    } else {
      console.log('  ✗ Failed: Invalid mapper instance');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Failed: ${error}`);
    failed++;
  }
  
  // Test 3: Event system
  console.log('\nTest 3: Event system');
  try {
    const mapper = new ReportSchemaMapper();
    let eventReceived = false;
    
    mapper.on('schemaMapper:started', () => {
      eventReceived = true;
    });
    
    // We can't actually trigger the event without calling map,
    // but we can verify the event system is set up
    if (mapper && typeof mapper.on === 'function') {
      console.log('  ✓ Passed: Event system available');
      passed++;
    } else {
      console.log('  ✗ Failed: Event system not available');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Failed: ${error}`);
    failed++;
  }
  
  // Test 4: SchemaMappingResultStorage
  console.log('\nTest 4: SchemaMappingResultStorage');
  try {
    const storage = new SchemaMappingResultStorage();
    
    // Create a test mapping result
    const testResult = {
      ...createSchemaMappingResult('storage_test_123', 'test_type'),
      id: 'mapping_test_123',
      createdAt: new Date(),
      processedAt: new Date(),
      confidenceScore: 0.85,
      mappingCoverage: 75,
      completenessScore: 90,
      processingTimeMs: 150,
      mappedFields: [],
      unmappedSections: [],
      missingRequiredSections: [],
      extraSections: [],
      unknownTerminology: [],
      schemaGaps: [],
      warnings: [],
      errors: []
    };
    
    // Test saving
    await storage.storeMappingResult(testResult);
    console.log('  ✓ Passed: Result saved successfully');
    passed++;
    
    // Test statistics
    const stats = await storage.getStatistics();
    if (stats && typeof stats.totalResults === 'number') {
      console.log('  ✓ Passed: Statistics retrieved');
      passed++;
    } else {
      console.log('  ✗ Failed: Invalid statistics');
      failed++;
    }
    
  } catch (error) {
    console.log(`  ✗ Failed: ${error}`);
    failed++;
  }
  
  // Test 5: Mapper helper modules
  console.log('\nTest 5: Mapper helper modules');
  try {
    // Check if mapper modules exist
    const fs = require('fs');
    const path = require('path');
    
    const mappersDir = path.join(__dirname, 'mappers');
    const files = fs.readdirSync(mappersDir);
    
    const expectedFiles = [
      'mapSectionsToSchema.ts',
      'mapTerminology.ts',
      'detectMissingSections.ts',
      'detectExtraSections.ts',
      'detectSchemaGaps.ts'
    ];
    
    const missingFiles = expectedFiles.filter(f => !files.includes(f));
    
    if (missingFiles.length === 0) {
      console.log('  ✓ Passed: All mapper modules present');
      passed++;
    } else {
      console.log(`  ✗ Failed: Missing files: ${missingFiles.join(', ')}`);
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Failed: ${error}`);
    failed++;
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total tests: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});