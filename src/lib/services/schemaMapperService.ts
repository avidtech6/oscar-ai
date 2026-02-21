/**
 * Schema Mapper Service
 * Wrapper for the Phase 3 Report Schema Mapper Engine
 */

let schemaMapperInstance: any = null;
let registryInstance: any = null;

/**
 * Get or create the ReportSchemaMapper instance
 */
async function getSchemaMapper(): Promise<any> {
  if (!schemaMapperInstance) {
    try {
      // Dynamic import to avoid TypeScript compilation issues
      const { ReportSchemaMapper } = await import('../../../report-intelligence/schema-mapper/ReportSchemaMapper');
      const { ReportTypeRegistry } = await import('../../../report-intelligence/registry/ReportTypeRegistry');
      
      // Lazy initialize the registry if needed
      if (!registryInstance) {
        registryInstance = new ReportTypeRegistry();
      }
      schemaMapperInstance = new ReportSchemaMapper(registryInstance);
    } catch (error) {
      console.error('Failed to load ReportSchemaMapper:', error);
      throw new Error('ReportSchemaMapper engine not available');
    }
  }
  return schemaMapperInstance;
}

/**
 * Map sections to schema
 */
export async function mapSectionsToSchema(
  sections: Array<{ id?: string; title: string; content: string; type?: string }>,
  reportTypeId?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // First, we need to create a decompiled report structure
    // For simplicity, we'll create a mock decompiled report
    const mockDecompiledReport = {
      id: crypto.randomUUID(),
      sections: sections.map((section, index) => ({
        id: section.id || `section-${index}`,
        title: section.title,
        type: section.type || 'section',
        level: 0,
        content: section.content,
        startLine: 0,
        endLine: 0,
        childrenIds: [],
        metadata: {
          wordCount: section.content.split(/\s+/).length,
          lineCount: 1,
          hasNumbers: /\d/.test(section.content),
          hasBullets: /^[\-\*•]/.test(section.content.trim()),
          hasTables: false,
          confidence: 0.7,
        },
      })),
      detectedReportType: reportTypeId,
      normalizedText: sections.map(s => s.content).join('\n\n'),
      metadata: {
        keywords: [],
        wordCount: sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0),
      },
      terminology: [],
      complianceMarkers: [],
      structureMap: {
        hierarchy: [],
        depth: 0,
        sectionCount: sections.length,
        averageSectionLength: 0,
        hasAppendices: false,
        hasMethodology: false,
        hasLegalSections: false,
      },
      confidenceScore: 0.5,
    };

    const mapper = await getSchemaMapper();
    const result = await mapper.map(mockDecompiledReport);

    return {
      success: true,
      data: {
        mappedFields: result.mappedFields,
        missingRequiredSections: result.missingRequiredSections,
        extraSections: result.extraSections,
        unknownTerminology: result.unknownTerminology,
        schemaGaps: result.schemaGaps,
        confidenceScore: result.confidenceScore,
        mappingCoverage: result.mappingCoverage,
        completenessScore: result.completenessScore,
        reportTypeId: result.reportTypeId,
        reportTypeName: result.reportTypeName,
      }
    };
  } catch (error) {
    console.error('Schema mapping failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during schema mapping'
    };
  }
}

/**
 * Quick analysis of section completeness
 */
export async function analyzeSectionCompleteness(
  sections: Array<{ title: string; content: string }>,
  reportTypeId?: string
): Promise<any> {
  try {
    const result = await mapSectionsToSchema(sections, reportTypeId);
    
    if (result.success) {
      return {
        mappedCount: result.data.mappedFields.length,
        missingCount: result.data.missingRequiredSections.length,
        extraCount: result.data.extraSections.length,
        confidence: result.data.confidenceScore,
        coverage: result.data.mappingCoverage,
        completeness: result.data.completenessScore,
        reportType: result.data.reportTypeName || 'Unknown',
        gaps: result.data.schemaGaps
      };
    } else {
      return {
        mappedCount: 0,
        missingCount: 0,
        extraCount: 0,
        confidence: 0,
        coverage: 0,
        completeness: 0,
        reportType: 'Unknown',
        gaps: []
      };
    }
  } catch (error) {
    console.error('Section completeness analysis failed:', error);
    return null;
  }
}

/**
 * Get suggestions for missing sections
 */
export async function getMissingSectionSuggestions(
  missingSections: Array<{ sectionId: string; sectionName: string; description: string }>
): Promise<Array<{ id: string; title: string; template: string; aiGuidance: string }>> {
  // This would normally call the SchemaMapper for suggestions
  // For now, return mock suggestions
  return missingSections.map(section => ({
    id: section.sectionId,
    title: section.sectionName,
    template: `<!-- ${section.sectionName} -->\n<h2>${section.sectionName}</h2>\n<p>${section.description || 'This section should contain relevant content.'}</p>`,
    aiGuidance: `Write a professional ${section.sectionName.toLowerCase()} section for an arboricultural report.`
  }));
}

/**
 * Validate section against schema
 */
export async function validateSection(
  section: { title: string; content: string },
  reportTypeId?: string
): Promise<{
  isValid: boolean;
  suggestions: string[];
  confidence: number;
}> {
  try {
    const mapper = await getSchemaMapper();
    
    // Create a mock section for validation
    const mockSection = {
      id: 'validation-section',
      title: section.title,
      type: 'section',
      level: 0,
      content: section.content,
      startLine: 0,
      endLine: 0,
      childrenIds: [],
      metadata: {
        wordCount: section.content.split(/\s+/).length,
        lineCount: 1,
        hasNumbers: /\d/.test(section.content),
        hasBullets: /^[\-\*•]/.test(section.content.trim()),
        hasTables: false,
        confidence: 0.7,
      },
    };

    // For now, return basic validation
    const suggestions: string[] = [];
    
    // Check for empty content
    if (section.content.trim().length < 10) {
      suggestions.push('Section content is very short. Consider adding more detail.');
    }
    
    // Check for title relevance
    if (section.title.toLowerCase().includes('methodology') && !section.content.toLowerCase().includes('method')) {
      suggestions.push('Consider adding methodological details to this section.');
    }
    
    // Check for compliance markers
    const complianceMarkers = ['BS5837', 'RPA', 'TPO', 'ISO'];
    const hasCompliance = complianceMarkers.some(marker => 
      section.content.toUpperCase().includes(marker)
    );
    
    if (!hasCompliance && reportTypeId === 'bs5837') {
      suggestions.push('Consider adding compliance references (e.g., BS5837, RPA).');
    }
    
    return {
      isValid: suggestions.length === 0,
      suggestions,
      confidence: 0.7
    };
  } catch (error) {
    console.error('Section validation failed:', error);
    return {
      isValid: false,
      suggestions: ['Validation failed due to technical error'],
      confidence: 0
    };
  }
}