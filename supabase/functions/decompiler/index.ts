// Enable Supabase Edge Runtime types
import "@supabase/functions-js/edge-runtime.d.ts"

// Create a simplified decompiler for Deno Edge Runtime
// (Original ReportDecompiler uses Node.js fs/promises which won't work in Deno)

interface DecompiledSection {
  id: string;
  type: string;
  level: number;
  title: string;
  content: string;
  metadata: {
    wordCount: number;
    lineCount: number;
    hasNumbers: boolean;
    hasBullets: boolean;
    hasTables: boolean;
    confidence: number;
  };
}

interface DecompiledReport {
  id: string;
  sections: DecompiledSection[];
  metadata: {
    wordCount: number;
    keywords: string[];
    title?: string;
    author?: string;
    date?: string;
    client?: string;
    siteAddress?: string;
    reportType?: string;
  };
  terminology: Array<{
    term: string;
    context: string;
    frequency: number;
    category: string;
    confidence: number;
  }>;
  complianceMarkers: Array<{
    type: string;
    text: string;
    standard: string;
    confidence: number;
  }>;
  structureMap: {
    sectionCount: number;
    depth: number;
    averageSectionLength: number;
    hasAppendices: boolean;
    hasMethodology: boolean;
    hasLegalSections: boolean;
  };
  confidenceScore: number;
  processingTimeMs: number;
}

class SimpleReportDecompiler {
  /**
   * Decompile report text into structured components
   */
  async ingest(text: string, inputFormat: 'text' | 'markdown' | 'pdf_text' | 'pasted' = 'text'): Promise<DecompiledReport> {
    const startTime = Date.now();
    const reportId = crypto.randomUUID();
    
    // Normalize text
    const normalizedText = this.normalizeText(text);
    
    // Detect sections
    const sections = this.detectSections(normalizedText);
    
    // Extract metadata
    const metadata = this.extractMetadata(normalizedText);
    
    // Extract terminology
    const terminology = this.extractTerminology(normalizedText);
    
    // Detect compliance markers
    const complianceMarkers = this.detectComplianceMarkers(normalizedText);
    
    // Build structure map
    const structureMap = this.buildStructureMap(sections);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(sections, terminology, complianceMarkers);
    
    return {
      id: reportId,
      sections,
      metadata,
      terminology,
      complianceMarkers,
      structureMap,
      confidenceScore,
      processingTimeMs: Date.now() - startTime,
    };
  }
  
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/[ \t]+$/gm, '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n{3,}/g, '\n\n');
  }
  
  private detectSections(text: string): DecompiledSection[] {
    const lines = text.split('\n');
    const sections: DecompiledSection[] = [];
    let sectionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect headings
      if (this.isHeading(line)) {
        const level = this.getHeadingLevel(line);
        const title = this.extractHeadingTitle(line);
        
        sections.push({
          id: `section-${sectionCount++}`,
          type: level === 1 ? 'heading' : 'subheading',
          level,
          title,
          content: line,
          metadata: {
            wordCount: title.split(/\s+/).length,
            lineCount: 1,
            hasNumbers: /\d/.test(line),
            hasBullets: false,
            hasTables: false,
            confidence: 0.9,
          },
        });
      }
      // Detect lists
      else if (this.isListLine(line)) {
        sections.push({
          id: `section-${sectionCount++}`,
          type: 'list',
          level: 0,
          title: `List item`,
          content: line,
          metadata: {
            wordCount: line.split(/\s+/).length,
            lineCount: 1,
            hasNumbers: /^\d+[\.\)]/.test(line),
            hasBullets: /^[\-\*•]/.test(line),
            hasTables: false,
            confidence: 0.8,
          },
        });
      }
      // Detect content paragraphs (simplified)
      else if (line.length > 20) {
        sections.push({
          id: `section-${sectionCount++}`,
          type: 'paragraph',
          level: 0,
          title: `Paragraph`,
          content: line,
          metadata: {
            wordCount: line.split(/\s+/).length,
            lineCount: 1,
            hasNumbers: /\d/.test(line),
            hasBullets: false,
            hasTables: false,
            confidence: 0.6,
          },
        });
      }
    }
    
    return sections;
  }
  
  private extractMetadata(text: string): DecompiledReport['metadata'] {
    const lines = text.split('\n');
    const metadata: DecompiledReport['metadata'] = {
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      keywords: [],
    };
    
    // Extract common metadata from first 20 lines
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i].trim();
      
      if (i === 0 && line.length > 10 && line.length < 200) {
        metadata.title = line;
      }
      
      if (line.toLowerCase().includes('author:')) {
        metadata.author = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      if (line.toLowerCase().includes('date:')) {
        metadata.date = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      if (line.toLowerCase().includes('client:')) {
        metadata.client = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      if (line.toLowerCase().includes('site:') || line.toLowerCase().includes('location:')) {
        metadata.siteAddress = line.replace(/.*[:]\s*/i, '').trim();
      }
      
      if (line.toLowerCase().includes('report type:')) {
        metadata.reportType = line.replace(/.*[:]\s*/i, '').trim();
      }
    }
    
    // Extract keywords (simplified)
    const commonWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'are', 'was', 'were']);
    const words = text.toLowerCase().split(/\s+/);
    const wordFrequency: Record<string, number> = {};
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    }
    
    metadata.keywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    return metadata;
  }
  
  private extractTerminology(text: string): DecompiledReport['terminology'] {
    const technicalTerms = [
      'arboricultural', 'bs5837', 'rpa', 'dbh', 'canopy', 'root', 'protection',
      'mitigation', 'assessment', 'methodology', 'compliance', 'category',
      'species', 'condition', 'hazard', 'risk', 'inspection', 'survey'
    ];
    
    const terminology: DecompiledReport['terminology'] = [];
    
    for (const term of technicalTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches && matches.length > 0) {
        const firstIndex = text.toLowerCase().indexOf(term);
        const contextStart = Math.max(0, firstIndex - 50);
        const contextEnd = Math.min(text.length, firstIndex + term.length + 50);
        const context = text.substring(contextStart, contextEnd);
        
        terminology.push({
          term,
          context,
          frequency: matches.length,
          category: this.categorizeTerm(term),
          confidence: 0.8,
        });
      }
    }
    
    return terminology;
  }
  
  private detectComplianceMarkers(text: string): DecompiledReport['complianceMarkers'] {
    const complianceMarkers: DecompiledReport['complianceMarkers'] = [];
    
    const compliancePatterns = [
      { pattern: /BS\s*5837[:]?\s*2012/i, standard: 'BS5837:2012', type: 'standard' },
      { pattern: /Arboricultural\s+Association/i, standard: 'Arboricultural Association', type: 'guideline' },
      { pattern: /RPA\s*\(Registered\s+Practitioner\)/i, standard: 'RPA', type: 'requirement' },
      { pattern: /ISO\s*14001/i, standard: 'ISO14001', type: 'standard' },
      { pattern: /Tree\s+Preservation\s+Order/i, standard: 'TPO', type: 'regulation' },
    ];
    
    for (const { pattern, standard, type } of compliancePatterns) {
      const matches = text.match(pattern);
      
      if (matches && matches.length > 0) {
        complianceMarkers.push({
          type,
          text: matches[0],
          standard,
          confidence: 0.8,
        });
      }
    }
    
    return complianceMarkers;
  }
  
  private buildStructureMap(sections: DecompiledSection[]): DecompiledReport['structureMap'] {
    const sectionCount = sections.length;
    let depth = 0;
    let hasAppendices = false;
    let hasMethodology = false;
    let hasLegalSections = false;
    
    for (const section of sections) {
      if (section.level > depth) {
        depth = section.level;
      }
      
      if (section.type === 'appendix' || section.title.toLowerCase().includes('appendix')) {
        hasAppendices = true;
      }
      
      if (section.title.toLowerCase().includes('methodology')) {
        hasMethodology = true;
      }
      
      if (section.title.toLowerCase().includes('legal') ||
          section.title.toLowerCase().includes('compliance') ||
          section.title.toLowerCase().includes('regulation')) {
        hasLegalSections = true;
      }
    }
    
    const totalLength = sections.reduce((sum, section) => sum + section.metadata.wordCount, 0);
    const averageSectionLength = sectionCount > 0 ? totalLength / sectionCount : 0;
    
    return {
      sectionCount,
      depth,
      averageSectionLength,
      hasAppendices,
      hasMethodology,
      hasLegalSections,
    };
  }
  
  private calculateConfidence(
    sections: DecompiledSection[],
    terminology: DecompiledReport['terminology'],
    complianceMarkers: DecompiledReport['complianceMarkers']
  ): number {
    // Simple confidence calculation
    let confidence = 0.5;
    
    if (sections.length > 0) confidence += 0.2;
    if (terminology.length > 0) confidence += 0.15;
    if (complianceMarkers.length > 0) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }
  
  private isHeading(line: string): boolean {
    return /^#{1,6}\s/.test(line) ||
           /^[A-Z][A-Z\s]{10,}$/.test(line) ||
           /^[IVX]+\.\s/.test(line) ||
           /^\d+\.\d+\s/.test(line);
  }
  
  private getHeadingLevel(line: string): number {
    const markdownMatch = line.match(/^(#{1,6})\s/);
    if (markdownMatch) return markdownMatch[1].length;
    if (/^[IVX]+\.\s/.test(line)) return 2;
    if (/^\d+\.\d+\s/.test(line)) return 3;
    return 1;
  }
  
  private extractHeadingTitle(line: string): string {
    let title = line.replace(/^#{1,6}\s/, '');
    title = title.replace(/^[IVX]+\.\s/, '');
    title = title.replace(/^\d+\.\d+\s/, '');
    return title.trim();
  }
  
  private isListLine(line: string): boolean {
    return /^[\-\*•]\s/.test(line.trim()) ||
           /^\d+[\.\)]\s/.test(line.trim());
  }
  
  private categorizeTerm(term: string): string {
    if (term.includes('arboricultural') || term.includes('methodology')) return 'technical';
    if (term.includes('legal') || term.includes('regulation')) return 'legal';
    if (term.includes('compliance') || term.includes('standard')) return 'compliance';
    if (term.includes('species') || term.includes('tree')) return 'species';
    if (term.includes('dbh') || term.includes('measurement')) return 'measurement';
    return 'general';
  }
}

// Create decompiler instance
const decompiler = new SimpleReportDecompiler();

// @ts-ignore - Deno is available in Supabase Edge Runtime
Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } }
      );
    }

    const body = await req.json()

    if (!body?.text) {
      return new Response(
        JSON.stringify({ error: "Missing 'text' in request body" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Run the decompiler
    const result = await decompiler.ingest(body.text, body.inputFormat || 'text')

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: 'Report decompiled successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )

  } catch (err) {
    console.error("Decompiler error:", err)

    return new Response(
      JSON.stringify({
        error: "Internal error",
        details: err instanceof Error ? err.message : String(err)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
})
