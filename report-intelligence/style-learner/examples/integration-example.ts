/**
 * Report Style Learner - Phase 5
 * Integration Example
 * 
 * Demonstrates the integration of Phase 5 (Report Style Learner) with
 * Phase 1 (Report Type Registry), Phase 2 (Report Decompiler), 
 * Phase 3 (Schema Mapper), and Phase 4 (Schema Updater Engine).
 */

import { ReportStyleLearner, type StyleLearnerEventData } from '../ReportStyleLearner.js';
import type { DecompiledReport } from '../../decompiler/DecompiledReport.js';

/**
 * Create a mock decompiled report for testing
 */
function createMockDecompiledReport(): DecompiledReport {
  const now = new Date();
  
  return {
    id: 'decompiled_report_456',
    sourceHash: 'mock_hash_123',
    rawText: `# Tree Assessment Report
    
## Executive Summary
This report provides a comprehensive assessment of the tree conditions at the specified site.
Our analysis indicates that several trees require immediate attention.

## Methodology
We conducted a visual inspection of all trees on the property. The assessment followed 
standard arboricultural practices and considered factors such as tree health, structure, 
and potential risks.

## Findings
- Tree 1: Large oak showing signs of decay in the main trunk.
- Tree 2: Maple with poor branch structure requiring pruning.
- Tree 3: Birch in good condition with no immediate concerns.

## Recommendations
We recommend the following actions:
1. Remove Tree 1 due to safety concerns.
2. Prune Tree 2 to improve structure.
3. Monitor Tree 3 annually.

## Conclusion
In conclusion, the site requires targeted tree management to address identified risks.
We suggest implementing the recommended actions within the next six months.`,
    normalizedText: '',
    detectedReportType: 'bs5837_report',
    sections: [
      {
        id: 'sec_1',
        type: 'heading',
        level: 1,
        title: 'Tree Assessment Report',
        content: 'Tree Assessment Report',
        startLine: 1,
        endLine: 1,
        childrenIds: ['sec_2', 'sec_3', 'sec_4', 'sec_5', 'sec_6'],
        metadata: {
          wordCount: 3,
          lineCount: 1,
          hasNumbers: false,
          hasBullets: false,
          hasTables: false,
          confidence: 0.9
        }
      },
      {
        id: 'sec_2',
        type: 'heading',
        level: 2,
        title: 'Executive Summary',
        content: 'This report provides a comprehensive assessment of the tree conditions at the specified site. Our analysis indicates that several trees require immediate attention.',
        startLine: 3,
        endLine: 4,
        parentId: 'sec_1',
        childrenIds: [],
        metadata: {
          wordCount: 20,
          lineCount: 2,
          hasNumbers: false,
          hasBullets: false,
          hasTables: false,
          confidence: 0.8
        }
      },
      {
        id: 'sec_3',
        type: 'heading',
        level: 2,
        title: 'Methodology',
        content: 'We conducted a visual inspection of all trees on the property. The assessment followed standard arboricultural practices and considered factors such as tree health, structure, and potential risks.',
        startLine: 6,
        endLine: 7,
        parentId: 'sec_1',
        childrenIds: [],
        metadata: {
          wordCount: 25,
          lineCount: 2,
          hasNumbers: false,
          hasBullets: false,
          hasTables: false,
          confidence: 0.8
        }
      },
      {
        id: 'sec_4',
        type: 'heading',
        level: 2,
        title: 'Findings',
        content: '- Tree 1: Large oak showing signs of decay in the main trunk.\n- Tree 2: Maple with poor branch structure requiring pruning.\n- Tree 3: Birch in good condition with no immediate concerns.',
        startLine: 9,
        endLine: 12,
        parentId: 'sec_1',
        childrenIds: [],
        metadata: {
          wordCount: 30,
          lineCount: 4,
          hasNumbers: true,
          hasBullets: true,
          hasTables: false,
          confidence: 0.85
        }
      },
      {
        id: 'sec_5',
        type: 'heading',
        level: 2,
        title: 'Recommendations',
        content: 'We recommend the following actions:\n1. Remove Tree 1 due to safety concerns.\n2. Prune Tree 2 to improve structure.\n3. Monitor Tree 3 annually.',
        startLine: 14,
        endLine: 18,
        parentId: 'sec_1',
        childrenIds: [],
        metadata: {
          wordCount: 25,
          lineCount: 5,
          hasNumbers: true,
          hasBullets: true,
          hasTables: false,
          confidence: 0.9
        }
      },
      {
        id: 'sec_6',
        type: 'heading',
        level: 2,
        title: 'Conclusion',
        content: 'In conclusion, the site requires targeted tree management to address identified risks. We suggest implementing the recommended actions within the next six months.',
        startLine: 20,
        endLine: 21,
        parentId: 'sec_1',
        childrenIds: [],
        metadata: {
          wordCount: 25,
          lineCount: 2,
          hasNumbers: false,
          hasBullets: false,
          hasTables: false,
          confidence: 0.8
        }
      }
    ],
    metadata: {
      title: 'Tree Assessment Report',
      author: 'user_123',
      date: now.toISOString().split('T')[0],
      keywords: ['tree', 'assessment', 'report', 'arboriculture'],
      wordCount: 150
    },
    terminology: [],
    complianceMarkers: [],
    structureMap: {
      hierarchy: [],
      depth: 2,
      sectionCount: 6,
      averageSectionLength: 25,
      hasAppendices: false,
      hasMethodology: true,
      hasLegalSections: false
    },
    inputFormat: 'text',
    processingTimeMs: 1250,
    confidenceScore: 0.85,
    createdAt: now,
    processedAt: now,
    detectorResults: {
      headings: { count: 6, confidence: 0.9 },
      sections: { count: 6, confidence: 0.85 },
      lists: { count: 2, confidence: 0.9 },
      tables: { count: 0, confidence: 0 },
      metadata: { confidence: 0.8 },
      terminology: { count: 0, confidence: 0 },
      compliance: { count: 0, confidence: 0 },
      appendices: { count: 0, confidence: 0 }
    },
    warnings: [],
    errors: []
  };
}

/**
 * Example integration demonstrating Phase 5 functionality
 */
async function runIntegrationExample(): Promise<void> {
  console.log('=== Phase 5: Report Style Learner Integration Example ===\n');
  
  // Step 1: Create a mock decompiled report (Phase 2)
  console.log('1. Creating mock DecompiledReport (Phase 2)...');
  const decompiledReport = createMockDecompiledReport();
  
  console.log(`   Created decompiled report with:
   - ID: ${decompiledReport.id}
   - Report type: ${decompiledReport.detectedReportType}
   - Author: ${decompiledReport.metadata.author}
   - Sections: ${decompiledReport.sections.length}
   - Confidence: ${decompiledReport.confidenceScore}`);
  
  // Step 2: Create Report Style Learner (Phase 5)
  console.log('\n2. Creating Report Style Learner (Phase 5)...');
  const styleLearner = new ReportStyleLearner(undefined, {
    autoCreateProfiles: true,
    autoUpdateProfiles: true,
    minSamplesForConfidence: 2,
    confidenceThreshold: 0.6,
    evolutionWeight: 0.3,
    maxProfilesPerUser: 5,
    storagePath: 'workspace/style-profiles-test.json'
  });
  
  // Add event listeners
  styleLearner.on('styleLearner:analysisStarted', (eventData: StyleLearnerEventData) => {
    console.log(`   Event: Analysis started for report ${eventData.data.reportId}`);
  });
  
  styleLearner.on('styleLearner:analysisComplete', (eventData: StyleLearnerEventData) => {
    console.log(`   Event: Analysis complete - user: ${eventData.data.userId}, confidence: ${eventData.data.confidence.toFixed(2)}`);
  });
  
  styleLearner.on('styleLearner:profileCreated', (eventData: StyleLearnerEventData) => {
    console.log(`   Event: Profile created - ${eventData.data.profileId} for ${eventData.data.reportTypeId || 'general'}`);
  });
  
  styleLearner.on('styleLearner:profileUpdated', (eventData: StyleLearnerEventData) => {
    console.log(`   Event: Profile updated - ${eventData.data.profileId} from v${eventData.data.previousVersion} to v${eventData.data.newVersion}`);
  });
  
  styleLearner.on('styleLearner:applied', (eventData: StyleLearnerEventData) => {
    console.log(`   Event: Style applied - profile ${eventData.data.profileId}`);
  });
  
  styleLearner.on('styleLearner:completed', (eventData: StyleLearnerEventData) => {
    console.log(`   Event: Style application completed - success: ${eventData.data.result.success}`);
  });
  
  // Step 3: Analyze the decompiled report and extract style
  console.log('\n3. Analyzing decompiled report and extracting style...');
  const styleProfile = await styleLearner.analyse(decompiledReport);
  
  if (styleProfile) {
    console.log(`   Style profile created/updated:
   - ID: ${styleProfile.id}
   - User: ${styleProfile.userId}
   - Report type: ${styleProfile.reportTypeId || 'general'}
   - Confidence: ${styleProfile.confidence.toFixed(2)}
   - Sample count: ${styleProfile.sampleCount}
   - Version: ${styleProfile.version}
   - Tone: ${styleProfile.tone.primaryTone} (confidence: ${styleProfile.tone.confidence.toFixed(2)})
   - Sentence patterns: ${styleProfile.sentencePatterns.length}
   - Paragraph patterns: ${styleProfile.paragraphPatterns.length}
   - Preferred phrasing: ${styleProfile.preferredPhrasing.length}`);
  } else {
    console.log('   No style profile created (autoCreateProfiles may be disabled)');
  }
  
  // Step 4: Apply style profile to new content
  console.log('\n4. Applying style profile to new content...');
  if (styleProfile) {
    const applicationResult = await styleLearner.applyStyleProfile(
      styleProfile.id,
      {
        title: 'New Tree Report',
        content: 'This is a new report that needs styling applied.',
        sections: []
      }
    );
    
    console.log(`   Style application result:
   - Success: ${applicationResult.success}
   - Applied profile: ${applicationResult.appliedProfileId}
   - Changes applied: ${applicationResult.changes.length}
   - Processing time: ${applicationResult.processingTimeMs}ms`);
    
    if (applicationResult.changes.length > 0) {
      console.log('   Changes:');
      applicationResult.changes.forEach((change, index) => {
        console.log(`   ${index + 1}. ${change.type}: ${change.description} (confidence: ${change.confidence.toFixed(2)})`);
      });
    }
    
    if (applicationResult.warnings.length > 0) {
      console.log('   Warnings:');
      applicationResult.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
  }
  
  // Step 5: Get user profiles
  console.log('\n5. Getting user profiles...');
  const userProfiles = await styleLearner.getUserProfiles('user_123');
  console.log(`   Found ${userProfiles.length} profiles for user_123:`);
  userProfiles.forEach((profile, index) => {
    console.log(`   ${index + 1}. ${profile.profileName} (v${profile.version}, confidence: ${profile.confidence.toFixed(2)})`);
  });
  
  // Step 6: Get engine statistics
  console.log('\n6. Engine Statistics:');
  const stats = styleLearner.getStatistics();
  console.log(`   - Total analyses: ${stats.totalAnalyses}`);
  console.log(`   - Total profiles created: ${stats.totalProfilesCreated}`);
  console.log(`   - Total profiles updated: ${stats.totalProfilesUpdated}`);
  console.log(`   - Total applications: ${stats.totalApplications}`);
  console.log(`   - Active profiles: ${stats.activeProfiles}`);
  
  // Step 7: Get configuration
  console.log('\n7. Engine Configuration:');
  const config = styleLearner.getConfig();
  console.log(`   - Auto-create profiles: ${config.autoCreateProfiles}`);
  console.log(`   - Auto-update profiles: ${config.autoUpdateProfiles}`);
  console.log(`   - Min samples for confidence: ${config.minSamplesForConfidence}`);
  console.log(`   - Confidence threshold: ${config.confidenceThreshold}`);
  console.log(`   - Evolution weight: ${config.evolutionWeight}`);
  console.log(`   - Max profiles per user: ${config.maxProfilesPerUser}`);
  console.log(`   - Storage path: ${config.storagePath}`);
  
  console.log('\n=== Integration Example Complete ===');
  console.log('\nKey Takeaways:');
  console.log('1. Report Style Learner successfully analyzes DecompiledReport objects');
  console.log('2. Extracts tone, patterns, phrasing, and formatting preferences');
  console.log('3. Creates and updates style profiles with versioning');
  console.log('4. Applies learned styles to new content');
  console.log('5. Integrates with Phase 2 (DecompiledReport) structure');
  console.log('6. Provides comprehensive event system for monitoring');
  console.log('7. Supports multiple profiles per user with evolution over time');
  console.log('8. Includes storage system for persistence');
}

// Run the example
runIntegrationExample().catch(error => {
  console.error('Error running integration example:', error);
  process.exit(1);
});