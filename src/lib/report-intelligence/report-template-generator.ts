import type { TemplateDefinition } from './template-definition';
import type { TemplateInstance } from './template-instance';
import type { DecompiledReport } from './decompiled-report';
import type { StyleProfile } from './style-profile';

/**
 * ReportTemplateGenerator class
 * 
 * Generates report templates based on decompiled reports and style profiles
 */
export class ReportTemplateGenerator {
  /** Template factory for creating templates */
  templateFactory: {
    /** Create a new template */
    create: (definition: TemplateDefinition) => TemplateDefinition;
    
    /** Clone an existing template */
    clone: (templateId: string, modifications?: Partial<TemplateDefinition>) => TemplateDefinition;
    
    /** Merge multiple templates */
    merge: (templates: TemplateDefinition[]) => TemplateDefinition;
  };
  
  /** Content inserter for inserting dynamic content */
  contentInserter: {
    /** Insert content into a template */
    insert: (template: TemplateInstance, content: any, sectionId: string) => TemplateInstance;
    
    /** Replace content in a template */
    replace: (template: TemplateInstance, content: any, sectionId: string) => TemplateInstance;
    
    /** Insert multiple content items */
    insertMultiple: (template: TemplateInstance, contentArray: Array<{content: any, sectionId: string}>) => TemplateInstance;
  };
  
  /** Template validator for validating templates */
  templateValidator: {
    /** Validate a template definition */
    validateDefinition: (definition: TemplateDefinition) => {isValid: boolean, errors: string[], warnings: string[]};
    
    /** Validate a template instance */
    validateInstance: (instance: TemplateInstance) => {isValid: boolean, errors: string[], warnings: string[]};
    
    /** Validate content against template */
    validateContent: (content: any, template: TemplateDefinition) => {isValid: boolean, errors: string[], warnings: string[]};
  };
  
  /** Constructor */
  constructor() {
    this.templateFactory = {
      create: (definition: TemplateDefinition) => {
        return { ...definition };
      },
      
      clone: (templateId: string, modifications?: Partial<TemplateDefinition>) => {
        // This would normally load the template from a registry
        const baseTemplate: TemplateDefinition = {
          templateId: templateId,
          framework: {
            name: 'Default Framework',
            version: '1.0.0',
            supportedTypes: ['generic'],
            defaultConfig: {}
          },
          dynamicSections: [],
          validationRules: []
        };
        
        return { ...baseTemplate, ...modifications };
      },
      
      merge: (templates: TemplateDefinition[]) => {
        if (templates.length === 0) {
          throw new Error('Cannot merge empty template array');
        }
        
        const merged: TemplateDefinition = {
          templateId: 'merged-template',
          framework: {
            name: 'Merged Framework',
            version: '1.0.0',
            supportedTypes: Array.from(new Set(templates.flatMap(t => t.framework.supportedTypes))),
            defaultConfig: {}
          },
          dynamicSections: [],
          validationRules: []
        };
        
        // Merge dynamic sections
        templates.forEach(template => {
          merged.dynamicSections.push(...template.dynamicSections);
        });
        
        // Merge validation rules
        templates.forEach(template => {
          merged.validationRules.push(...template.validationRules);
        });
        
        return merged;
      }
    };
    
    this.contentInserter = {
      insert: (template: TemplateInstance, content: any, sectionId: string) => {
        const newTemplate = { ...template };
        
        if (sectionId in newTemplate.content) {
          newTemplate.content[sectionId as keyof typeof newTemplate.content] = content;
        } else {
          (newTemplate.content as any)[sectionId] = content;
        }
        
        return newTemplate;
      },
      
      replace: (template: TemplateInstance, content: any, sectionId: string) => {
        return this.contentInserter.insert(template, content, sectionId);
      },
      
      insertMultiple: (template: TemplateInstance, contentArray: Array<{content: any, sectionId: string}>) => {
        let newTemplate = { ...template };
        
        contentArray.forEach(item => {
          newTemplate = this.contentInserter.insert(newTemplate, item.content, item.sectionId);
        });
        
        return newTemplate;
      }
    };
    
    this.templateValidator = {
      validateDefinition: (definition: TemplateDefinition) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Validate required fields
        if (!definition.templateId) {
          errors.push('Template ID is required');
        }
        
        if (!definition.framework.name) {
          errors.push('Framework name is required');
        }
        
        if (!definition.framework.version) {
          errors.push('Framework version is required');
        }
        
        if (definition.dynamicSections.length === 0) {
          warnings.push('Template has no dynamic sections');
        }
        
        // Validate section IDs
        const sectionIds = new Set();
        definition.dynamicSections.forEach(section => {
          if (sectionIds.has(section.sectionId)) {
            errors.push(`Duplicate section ID: ${section.sectionId}`);
          }
          sectionIds.add(section.sectionId);
        });
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      },
      
      validateInstance: (instance: TemplateInstance) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Validate required fields
        if (!instance.instanceId) {
          errors.push('Instance ID is required');
        }
        
        if (!instance.template.templateId) {
          errors.push('Template ID is required');
        }
        
        if (!instance.metadata.title) {
          errors.push('Report title is required');
        }
        
        if (!instance.metadata.author) {
          errors.push('Report author is required');
        }
        
        if (!instance.metadata.date) {
          errors.push('Report date is required');
        }
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      },
      
      validateContent: (content: any, template: TemplateDefinition) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Validate content against template structure
        template.dynamicSections.forEach(section => {
          if (section.required && !(section.sectionId in content)) {
            errors.push(`Required section missing: ${section.sectionId}`);
          }
        });
        
        // Apply validation rules
        template.validationRules.forEach(rule => {
          const validationResult = rule.validate(content);
          if (typeof validationResult === 'string') {
            errors.push(validationResult);
          } else if (!validationResult) {
            errors.push(rule.errorMessage);
          }
        });
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      }
    };
  }
  
  /**
   * Generate a template from a decompiled report
   */
  generateTemplate(decompiledReport: DecompiledReport, styleProfile?: StyleProfile): TemplateDefinition {
    const templateId = `template-${decompiledReport.id}`;
    
    const template: TemplateDefinition = {
      templateId,
      framework: {
        name: 'Auto-Generated Framework',
        version: '1.0.0',
        description: 'Automatically generated from report structure',
        supportedTypes: [decompiledReport.reportType.id],
        defaultConfig: {
          style: styleProfile ? styleProfile.id : 'default',
          language: 'en'
        },
        metadata: {
          generatedFrom: decompiledReport.id,
          generatedAt: new Date().toISOString()
        }
      },
      dynamicSections: [],
      validationRules: []
    };
    
    // Extract sections from the decompiled report
    if (decompiledReport.content.executiveSummary) {
      template.dynamicSections.push({
        sectionId: 'executiveSummary',
        title: 'Executive Summary',
        description: 'Brief overview of the report findings',
        required: true,
        repeatable: false,
        defaultContent: decompiledReport.content.executiveSummary,
        validationRules: [
          {
            type: 'required',
            params: {},
            message: 'Executive summary is required'
          }
        ]
      });
    }
    
    if (decompiledReport.content.introduction) {
      template.dynamicSections.push({
        sectionId: 'introduction',
        title: 'Introduction',
        description: 'Background and context for the report',
        required: true,
        repeatable: false,
        defaultContent: decompiledReport.content.introduction,
        validationRules: [
          {
            type: 'required',
            params: {},
            message: 'Introduction is required'
          }
        ]
      });
    }
    
    if (decompiledReport.content.methodology) {
      template.dynamicSections.push({
        sectionId: 'methodology',
        title: 'Methodology',
        description: 'Approach and methods used',
        required: true,
        repeatable: false,
        defaultContent: decompiledReport.content.methodology,
        validationRules: [
          {
            type: 'required',
            params: {},
            message: 'Methodology is required'
          }
        ]
      });
    }
    
    if (decompiledReport.content.findings && decompiledReport.content.findings.length > 0) {
      template.dynamicSections.push({
        sectionId: 'findings',
        title: 'Findings',
        description: 'Key findings and observations',
        required: true,
        repeatable: true,
        validationRules: [
          {
            type: 'required',
            params: {},
            message: 'Findings section is required'
          }
        ]
      });
    }
    
    if (decompiledReport.content.conclusions) {
      template.dynamicSections.push({
        sectionId: 'conclusions',
        title: 'Conclusions',
        description: 'Summary of conclusions',
        required: true,
        repeatable: false,
        defaultContent: decompiledReport.content.conclusions,
        validationRules: [
          {
            type: 'required',
            params: {},
            message: 'Conclusions are required'
          }
        ]
      });
    }
    
    if (decompiledReport.content.recommendations && decompiledReport.content.recommendations.length > 0) {
      template.dynamicSections.push({
        sectionId: 'recommendations',
        title: 'Recommendations',
        description: 'Actionable recommendations',
        required: true,
        repeatable: true,
        validationRules: [
          {
            type: 'required',
            params: {},
            message: 'Recommendations are required'
          }
        ]
      });
    }
    
    // Add validation rules based on report type
    this.addTypeSpecificValidationRules(template, decompiledReport.reportType.id);
    
    return template;
  }
  
  /**
   * Create a framework for a template
   */
  createFramework(reportType: string, styleProfile?: StyleProfile): TemplateDefinition['framework'] {
    return {
      name: `${reportType} Framework`,
      version: '1.0.0',
      description: `Framework for ${reportType} reports`,
      supportedTypes: [reportType],
      defaultConfig: {
        style: styleProfile?.id || 'default',
        language: 'en',
        format: 'standard'
      },
      metadata: {
        styleProfile: styleProfile?.id,
        supportedFeatures: ['dynamic-content', 'validation', 'style-adaptation']
      }
    };
  }
  
  /**
   * Insert dynamic content into a template
   */
  insertDynamicContent(template: TemplateInstance, content: any, sectionId: string): TemplateInstance {
    return this.contentInserter.insert(template, content, sectionId);
  }
  
  /**
   * Validate a template
   */
  validateTemplate(template: TemplateDefinition | TemplateInstance): {isValid: boolean, errors: string[], warnings: string[]} {
    if ('templateId' in template && 'framework' in template) {
      // It's a TemplateDefinition
      return this.templateValidator.validateDefinition(template);
    } else {
      // It's a TemplateInstance
      return this.templateValidator.validateInstance(template);
    }
  }
  
  /**
   * Add type-specific validation rules to a template
   */
  private addTypeSpecificValidationRules(template: TemplateDefinition, reportType: string): void {
    const typeRules = this.getTypeSpecificRules(reportType);
    
    typeRules.forEach(rule => {
      template.validationRules.push({
        ruleId: `${reportType}-${rule.type}`,
        type: rule.type,
        description: rule.description,
        severity: rule.severity,
        validate: rule.validate,
        errorMessage: rule.errorMessage,
        warningMessage: rule.warningMessage,
        metadata: rule.metadata
      });
    });
  }
  
  /**
   * Get type-specific validation rules
   */
  private getTypeSpecificRules(reportType: string): Array<{
    type: 'structure' | 'content' | 'format' | 'business';
    description: string;
    severity: 'error' | 'warning' | 'info';
    validate: (content: any) => boolean | string;
    errorMessage: string;
    warningMessage?: string;
    metadata?: Record<string, any>;
  }> {
    const rules = [];
    
    // Common rules for all report types
    rules.push({
      type: 'structure',
      description: 'Validate report structure',
      severity: 'error',
      validate: (content: any) => {
        return content.title && content.author && content.date;
      },
      errorMessage: 'Report must have title, author, and date',
      metadata: { appliesTo: 'all' }
    });
    
    // Type-specific rules
    switch (reportType) {
      case 'BS5837:2012 Tree Survey':
        rules.push({
          type: 'business',
          description: 'Validate tree survey specific requirements',
          severity: 'error',
          validate: (content: any) => {
            return content.findings && content.findings.some((f: any) => f.title.includes('Tree Condition'));
          },
          errorMessage: 'Tree survey must include tree condition findings',
          metadata: { appliesTo: 'BS5837:2012' }
        });
        break;
        
      case 'Tree Risk Assessment':
        rules.push({
          type: 'business',
          description: 'Validate risk assessment requirements',
          severity: 'error',
          validate: (content: any) => {
            return content.recommendations && content.recommendations.some((r: any) => r.priority === 'critical');
          },
          errorMessage: 'Risk assessment must include critical recommendations',
          metadata: { appliesTo: 'Tree Risk Assessment' }
        });
        break;
        
      default:
        // Generic rules for unknown types
        rules.push({
          type: 'content',
          description: 'Validate basic content requirements',
          severity: 'warning',
          validate: (content: any) => {
            return content.findings && content.findings.length > 0;
          },
          errorMessage: 'Report should include findings',
          warningMessage: 'Consider adding findings section',
          metadata: { appliesTo: 'generic' }
        });
    }
    
    return rules as Array<{
      type: 'structure' | 'content' | 'format' | 'business';
      description: string;
      severity: 'error' | 'warning' | 'info';
      validate: (content: any) => boolean | string;
      errorMessage: string;
      warningMessage?: string;
      metadata?: Record<string, any>;
    }>;
  }
}