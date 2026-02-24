import type { TemplateData } from '$lib/services/templateService';

export interface ReportSection {
    id: string;
    title: string;
    type: string;
    level: number;
    content: string;
    metadata?: Record<string, any>;
}

export interface ReportData {
    // Report metadata
    id: string;
    title: string;
    subtitle?: string;
    date: string;
    
    // Project data
    project: {
        id: string;
        name: string;
        client: string;
        location?: string;
        reference?: string;
    };
    
    // Sections from decompiler
    sections: Record<string, ReportSection>;
    
    // Additional data
    trees: Array<{
        id?: string;
        label: string;
        species: string;
        condition: string;
        notes: string;
        created_at: string;
    }>;
    
    notes: Array<{
        id?: string;
        title: string;
        content: string;
        created_at: string;
    }>;
    
    survey?: {
        date: string;
        surveyor: string;
        weather?: string;
        soil?: string;
    };
    
    company?: {
        name: string;
        tagline?: string;
        address: string;
        phone: string;
        email: string;
        website?: string;
    };
    
    recommendations?: Array<{
        id: string;
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        timeline?: string;
    }>;
    
    generatedDate: string;
}

/**
 * Load the HTML template from the file system
 */
export async function loadTemplate(): Promise<string> {
    try {
        // In a browser environment, we need to fetch the template
        const response = await fetch('/src/lib/reportTemplate/reportTemplate.html');
        if (!response.ok) {
            throw new Error(`Failed to load template: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading report template:', error);
        // Fallback to a minimal template
        return getFallbackTemplate();
    }
}

/**
 * Render the report with the provided data
 */
export async function renderReport(data: ReportData): Promise<string> {
    const template = await loadTemplate();
    return renderTemplate(template, data);
}

/**
 * Render template with data substitution
 */
function renderTemplate(template: string, data: ReportData): string {
    let html = template;
    
    // Replace simple variables
    html = replaceVariables(html, data);
    
    // Handle conditional sections
    html = handleConditionalSections(html, data);
    
    // Handle loops
    html = handleLoops(html, data);
    
    // Format dates
    html = formatDates(html, data);
    
    return html;
}

/**
 * Replace simple {{variable}} placeholders
 */
function replaceVariables(html: string, data: ReportData): string {
    const replacements: Record<string, string> = {
        '{{project.name}}': data.project.name || '',
        '{{project.client}}': data.project.client || '',
        '{{project.location}}': data.project.location || '',
        '{{project.reference}}': data.project.reference || '',
        '{{report.id}}': data.id || '',
        '{{report.title}}': data.title || '',
        '{{report.subtitle}}': data.subtitle || '',
        '{{report.date}}': data.date || new Date().toLocaleDateString(),
        '{{generatedDate}}': data.generatedDate || new Date().toLocaleDateString(),
    };
    
    // Company data
    if (data.company) {
        replacements['{{company.name}}'] = data.company.name || '';
        replacements['{{company.tagline}}'] = data.company.tagline || '';
        replacements['{{company.address}}'] = data.company.address || '';
        replacements['{{company.phone}}'] = data.company.phone || '';
        replacements['{{company.email}}'] = data.company.email || '';
        replacements['{{company.website}}'] = data.company.website || '';
    } else {
        // Default company info
        replacements['{{company.name}}'] = 'Oscar AI Arboricultural Services';
        replacements['{{company.tagline}}'] = 'Professional Arboricultural Management';
        replacements['{{company.address}}'] = '123 Tree Street, Forest City, FC1 2TR';
        replacements['{{company.phone}}'] = '+44 1234 567890';
        replacements['{{company.email}}'] = 'reports@oscar-ai.app';
        replacements['{{company.website}}'] = 'https://oscar-ai.app';
    }
    
    // Survey data
    if (data.survey) {
        replacements['{{survey.date}}'] = data.survey.date || '';
        replacements['{{survey.surveyor}}'] = data.survey.surveyor || '';
        replacements['{{survey.weather}}'] = data.survey.weather || '';
        replacements['{{survey.soil}}'] = data.survey.soil || '';
    }
    
    // Apply all replacements
    for (const [key, value] of Object.entries(replacements)) {
        html = html.replace(new RegExp(key, 'g'), escapeHtml(value));
    }
    
    return html;
}

/**
 * Handle conditional sections like {{#if condition}}...{{/if}}
 */
function handleConditionalSections(html: string, data: ReportData): string {
    // Handle sections.executive_summary
    if (data.sections?.executive_summary) {
        const section = data.sections.executive_summary;
        html = html.replace(
            /{{#if sections\.executive_summary}}[\s\S]*?{{\/if}}/g,
            (match) => {
                const content = match
                    .replace('{{#if sections.executive_summary}}', '')
                    .replace('{{/if}}', '')
                    .replace('{{{sections.executive_summary.content}}}', section.content || '');
                return content;
            }
        );
    } else {
        html = html.replace(/{{#if sections\.executive_summary}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Handle sections.introduction
    if (data.sections?.introduction) {
        const section = data.sections.introduction;
        html = html.replace(
            /{{#if sections\.introduction}}[\s\S]*?{{\/if}}/g,
            (match) => {
                const content = match
                    .replace('{{#if sections.introduction}}', '')
                    .replace('{{/if}}', '')
                    .replace('{{{sections.introduction.content}}}', section.content || '');
                return content;
            }
        );
    } else {
        html = html.replace(/{{#if sections\.introduction}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Handle sections.site_survey
    if (data.sections?.site_survey) {
        const section = data.sections.site_survey;
        html = html.replace(
            /{{#if sections\.site_survey}}[\s\S]*?{{\/if}}/g,
            (match) => {
                const content = match
                    .replace('{{#if sections.site_survey}}', '')
                    .replace('{{/if}}', '')
                    .replace('{{{sections.site_survey.content}}}', section.content || '');
                return content;
            }
        );
    } else {
        html = html.replace(/{{#if sections\.site_survey}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Handle sections.conclusion
    if (data.sections?.conclusion) {
        const section = data.sections.conclusion;
        html = html.replace(
            /{{#if sections\.conclusion}}[\s\S]*?{{\/if}}/g,
            (match) => {
                const content = match
                    .replace('{{#if sections.conclusion}}', '')
                    .replace('{{/if}}', '')
                    .replace('{{{sections.conclusion.content}}}', section.content || '');
                return content;
            }
        );
    } else {
        html = html.replace(/{{#if sections\.conclusion}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Handle trees
    if (data.trees && data.trees.length > 0) {
        html = html.replace(/{{#if trees\.length}}[\s\S]*?{{\/if}}/g, (match) => {
            return match
                .replace('{{#if trees.length}}', '')
                .replace('{{/if}}', '');
        });
    } else {
        html = html.replace(/{{#if trees\.length}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Handle notes
    if (data.notes && data.notes.length > 0) {
        html = html.replace(/{{#if notes\.length}}[\s\S]*?{{\/if}}/g, (match) => {
            return match
                .replace('{{#if notes.length}}', '')
                .replace('{{/if}}', '');
        });
    } else {
        html = html.replace(/{{#if notes\.length}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Handle recommendations
    if (data.recommendations && data.recommendations.length > 0) {
        html = html.replace(/{{#if recommendations\.length}}[\s\S]*?{{\/if}}/g, (match) => {
            return match
                .replace('{{#if recommendations.length}}', '')
                .replace('{{/if}}', '');
        });
    } else {
        html = html.replace(/{{#if recommendations\.length}}[\s\S]*?{{\/if}}/g, '');
    }
    
    return html;
}

/**
 * Handle loop constructs like {{#each items}}...{{/each}}
 */
function handleLoops(html: string, data: ReportData): string {
    // Trees loop
    if (data.trees && data.trees.length > 0) {
        html = html.replace(/{{#each trees}}[\s\S]*?{{\/each}}/g, (match) => {
            const template = match
                .replace('{{#each trees}}', '')
                .replace('{{/each}}', '');
            
            const rows = data.trees.map(tree => {
                let row = template;
                row = row.replace(/{{this\.label}}/g, escapeHtml(tree.label || ''));
                row = row.replace(/{{this\.species}}/g, escapeHtml(tree.species || ''));
                row = row.replace(/{{this\.condition}}/g, escapeHtml(tree.condition || ''));
                row = row.replace(/{{this\.notes}}/g, escapeHtml(tree.notes || ''));
                return row;
            }).join('');
            
            return rows;
        });
    }
    
    // Notes loop
    if (data.notes && data.notes.length > 0) {
        html = html.replace(/{{#each notes}}[\s\S]*?{{\/each}}/g, (match) => {
            const template = match
                .replace('{{#each notes}}', '')
                .replace('{{/each}}', '');
            
            const cards = data.notes.map(note => {
                let card = template;
                card = card.replace(/{{this\.title}}/g, escapeHtml(note.title || ''));
                card = card.replace(/{{this\.content}}/g, note.content || '');
                card = card.replace(/{{formatDate this\.created_at}}/g, formatDateString(note.created_at));
                return card;
            }).join('');
            
            return cards;
        });
    }
    
    // Recommendations loop
    if (data.recommendations && data.recommendations.length > 0) {
        const recommendations = data.recommendations;
        html = html.replace(/{{#each recommendations}}[\s\S]*?{{\/each}}/g, (match) => {
            const template = match
                .replace('{{#each recommendations}}', '')
                .replace('{{/each}}', '');
            
            const items = recommendations.map(rec => {
                let item = template;
                item = item.replace(/{{this\.priority}}/g, escapeHtml(rec.priority || ''));
                item = item.replace(/{{this\.title}}/g, escapeHtml(rec.title || ''));
                item = item.replace(/{{this\.description}}/g, escapeHtml(rec.description || ''));
                item = item.replace(/{{this\.timeline}}/g, escapeHtml(rec.timeline || ''));
                return item;
            }).join('');
            
            return items;
        });
    }
    
    return html;
}

/**
 * Format dates in the template
 */
function formatDates(html: string, data: ReportData): string {
    // Replace formatDate function calls
    html = html.replace(/{{formatDate [^}]+}}/g, (match) => {
        // Extract the date string from the pattern {{formatDate some.date}}
        if (typeof match !== 'string') {
            console.warn('Invalid input to .match() in formatDates:', match);
            return match;
        }
        const dateMatch = match.match(/{{formatDate ([^}]+)}}/);
        if (!dateMatch) return match;
        
        const datePath = dateMatch[1].trim();
        let dateString = '';
        
        // Try to get the date from the data object
        if (datePath === 'this.created_at' && data.notes?.[0]) {
            // This is handled in the loop
            return match;
        }
        
        // Default to current date
        return formatDateString(dateString || new Date().toISOString());
    });
    
    return html;
}

/**
 * Format a date string to a readable format
 */
function formatDateString(dateString: string): string {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Fallback template if the main template fails to load
 */
function getFallbackTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{report.title}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #2e7d32; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; color: #2e7d32; margin-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{report.title}}</h1>
        <p><strong>Project:</strong> {{project.name}}</p>
        <p><strong>Client:</strong> {{project.client}}</p>
        <p><strong>Date:</strong> {{report.date}}</p>
    </div>
    
    <div class="section">
        <div class="section-title">Report Content</div>
        <p>Report generated by Oscar AI Arboricultural Services on {{generatedDate}}.</p>
    </div>
</body>
</html>`;
}

/**
 * Convert TemplateData to ReportData for compatibility
 */
export function convertTemplateDataToReportData(
    templateData: TemplateData,
    reportId: string,
    sections?: Record<string, ReportSection>
): ReportData {
    return {
        id: reportId,
        title: `${templateData.project.name} - Arboricultural Report`,
        subtitle: 'Professional Assessment and Recommendations',
        date: templateData.survey.date,
        project: {
            id: templateData.project.id || '',
            name: templateData.project.name,
            client: templateData.project.client,
            location: templateData.project.siteAddress,
            reference: templateData.project.reference
        },
        sections: sections || {},
        trees: templateData.trees.map(tree => ({
            id: tree.id,
            label: tree.number || `Tree ${tree.id?.substring(0, 4) || '0000'}`,
            species: tree.species || '',
            condition: tree.condition || '',
            notes: tree.notes || '',
            created_at: tree.createdAt?.toString() || new Date().toISOString()
        })),
        notes: templateData.notes.map(note => ({
            id: note.id,
            title: note.title || 'Untitled Note',
            content: note.content || '',
            created_at: note.createdAt?.toString() || new Date().toISOString()
        })),
        survey: {
            date: templateData.survey.date,
            surveyor: templateData.survey.surveyor
        },
        company: templateData.company,
        recommendations: templateData.recommendations.retainedTrees.map(tree => ({
            id: `retain-${tree.treeRef}`,
            title: `Retain ${tree.species} (${tree.treeRef})`,
            description: `Category ${tree.category} tree recommended for retention`,
            priority: (tree.category === 'A' ? 'high' : tree.category === 'B' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
            timeline: 'During construction'
        })).concat(
            templateData.recommendations.removedTrees.map(tree => ({
                id: `remove-${tree.treeRef}`,
                title: `Remove ${tree.treeRef}`,
                description: tree.reason,
                priority: 'high' as 'high',
                timeline: 'Prior to construction'
            }))
        ),
        generatedDate: new Date().toLocaleDateString('en-GB')
    };
}