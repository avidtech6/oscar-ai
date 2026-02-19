/**
 * Report Type Registry - Phase 1
 * Report Type Definition Interface
 * 
 * This defines the structure for report type definitions in the registry.
 */

export interface ReportSectionDefinition {
  id: string;
  name: string;
  description: string;
  required: boolean;
  conditionalLogic?: {
    dependsOn: string; // Section ID this depends on
    condition: 'present' | 'absent' | 'value' | 'contains';
    value?: any;
  };
  template?: string; // Template content or reference
  aiGuidance?: string; // AI guidance for generating this section
  validationRules?: Array<{
    rule: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    value?: any;
    message: string;
  }>;
}

export interface ReportComplianceRule {
  id: string;
  name: string;
  description: string;
  standard: string; // e.g., 'BS5837:2012', 'Arboricultural Association'
  rule: string; // The actual compliance rule text
  validationLogic?: string; // JavaScript/TypeScript validation logic
  severity: 'critical' | 'warning' | 'recommendation';
}

export interface ReportDependency {
  type: 'data' | 'template' | 'calculation' | 'external';
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface ReportAIGuidance {
  id: string;
  purpose: 'generation' | 'validation' | 'enhancement' | 'compliance';
  guidance: string;
  examples?: string[];
  constraints?: string[];
}

export interface ReportTypeDefinition {
  // Core identification
  id: string;
  name: string;
  description: string;
  category: 'survey' | 'assessment' | 'method' | 'condition' | 'safety' | 'insurance' | 'custom';
  
  // Versioning
  version: string;
  createdAt: Date;
  updatedAt: Date;
  deprecated?: boolean;
  deprecatedReason?: string;
  
  // Section definitions
  requiredSections: ReportSectionDefinition[];
  optionalSections: ReportSectionDefinition[];
  conditionalSections: ReportSectionDefinition[];
  
  // Dependencies and relationships
  dependencies: ReportDependency[];
  relatedReportTypes: string[]; // IDs of related report types
  
  // Compliance and standards
  complianceRules: ReportComplianceRule[];
  standards: string[]; // e.g., ['BS5837:2012', 'Arboricultural Association Guidelines']
  
  // AI integration
  aiGuidance: ReportAIGuidance[];
  generationPrompt?: string; // Base prompt for AI generation
  validationPrompt?: string; // Base prompt for AI validation
  
  // Metadata
  tags: string[];
  estimatedGenerationTime?: number; // in minutes
  complexity: 'simple' | 'medium' | 'complex';
  typicalAudience: string[]; // e.g., ['planners', 'clients', 'arboriculturists']
  
  // Template references
  defaultTemplateId?: string;
  templateVariants?: Array<{
    id: string;
    name: string;
    description: string;
    templateRef: string;
  }>;
  
  // Output configuration
  supportedFormats: Array<'pdf' | 'html' | 'docx' | 'markdown'>;
  defaultFormat: 'pdf' | 'html' | 'docx' | 'markdown';
  
  // Integration hooks
  preGenerationHooks?: string[]; // Function names or references
  postGenerationHooks?: string[]; // Function names or references
  validationHooks?: string[]; // Function names or references
}