/**
 * Report Decompiler Service
 * Wrapper for the Phase 2 Report Decompiler Engine
 *
 * Now using Supabase Edge Functions for server-side processing
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$lib/config/keys';

const DECOMPILER_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/decompiler`;

/**
 * Call Supabase Edge Function for report decompilation
 */
async function callDecompilerFunction(
  reportText: string,
  inputFormat: 'text' | 'markdown' | 'pdf_text' | 'pasted' = 'text'
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}> {
  try {
    const response = await fetch(DECOMPILER_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        text: reportText,
        inputFormat
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Decompiler function error:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const result = await response.json();
    
    // The Edge Function returns { success: true, data: ..., message: ... }
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } else {
      return {
        success: false,
        error: result.error || 'Unknown error from decompiler function'
      };
    }
  } catch (error) {
    console.error('Failed to call decompiler function:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to decompiler service'
    };
  }
}

/**
 * Decompile a report text using Supabase Edge Function
 */
export async function decompileReport(
  reportText: string,
  inputFormat: 'text' | 'markdown' | 'pdf_text' | 'pasted' = 'text'
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const result = await callDecompilerFunction(reportText, inputFormat);
  
  if (result.success && result.data) {
    // Transform to match expected format
    return {
      success: true,
      data: {
        id: result.data.id,
        sections: result.data.sections.map((section: any) => ({
          id: section.id,
          title: section.title,
          type: section.type,
          level: section.level,
          content: section.content,
          metadata: section.metadata
        })),
        metadata: result.data.metadata,
        terminology: result.data.terminology,
        complianceMarkers: result.data.complianceMarkers,
        structureMap: result.data.structureMap,
        confidenceScore: result.data.confidenceScore,
        processingTimeMs: result.data.processingTimeMs
      }
    };
  }
  
  return {
    success: false,
    error: result.error
  };
}

/**
 * Quick analysis of report structure using Supabase Edge Function
 */
export async function analyzeReportStructure(reportText: string): Promise<any> {
  const result = await callDecompilerFunction(reportText, 'text');
  
  if (result.success && result.data) {
    const sections = result.data.sections;
    
    return {
      sectionCount: sections.length,
      headingCount: sections.filter((s: any) => s.type === 'heading' || s.type === 'subheading').length,
      listCount: sections.filter((s: any) => s.type === 'list').length,
      tableCount: sections.filter((s: any) => s.type === 'table').length,
      appendixCount: sections.filter((s: any) => s.type === 'appendix').length,
      wordCount: result.data.metadata.wordCount || 0,
      detectedReportType: result.data.detectedReportType,
      confidenceScore: result.data.confidenceScore,
      hasMethodology: result.data.structureMap.hasMethodology,
      hasAppendices: result.data.structureMap.hasAppendices,
      hasLegalSections: result.data.structureMap.hasLegalSections
    };
  }
  
  return null;
}

/**
 * Get section titles from decompiled report using Supabase Edge Function
 */
export async function getSectionTitles(reportText: string): Promise<string[]> {
  const result = await callDecompilerFunction(reportText, 'text');
  
  if (result.success && result.data) {
    return result.data.sections
      .filter((section: any) => section.title && section.title.trim().length > 0)
      .map((section: any) => section.title);
  }
  
  return [];
}

/**
 * Event listener for decompiler events (for real-time UI updates)
 * Note: Edge Functions don't support real-time events, so this is a no-op
 */
export async function onDecompilerEvent(
  event: 'decompiler:ingested' | 'decompiler:sectionsDetected' | 'decompiler:completed' | 'decompiler:error',
  callback: (data: any) => void
): Promise<() => void> {
  console.warn('onDecompilerEvent not supported with Edge Functions');
  
  // Return a no-op cleanup function
  return () => {
    // No cleanup needed
  };
}

/**
 * Fallback to local decompiler if Edge Function fails (for development)
 * Note: Local fallback disabled due to Node.js dependencies not available in browser
 */
export async function decompileReportWithFallback(
  reportText: string,
  inputFormat: 'text' | 'markdown' | 'pdf_text' | 'pasted' = 'text'
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  source: 'edge-function' | 'local-fallback';
}> {
  const edgeResult = await decompileReport(reportText, inputFormat);
  
  if (edgeResult.success) {
    return {
      ...edgeResult,
      source: 'edge-function'
    };
  }
  
  console.warn('Edge function failed, local fallback not available in browser:', edgeResult.error);
  
  // Local fallback disabled - Node.js dependencies not available in browser
  return {
    success: false,
    error: `Edge function failed: ${edgeResult.error}. Local fallback not available in browser environment.`,
    source: 'edge-function'
  };
}