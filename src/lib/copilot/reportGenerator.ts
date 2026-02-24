import type { Project, Note, VoiceNote, Tree, Task } from '$lib/db';
import { compileNotes } from './noteCompilationEngine';

export interface ReportGenerationInput {
	project: Project;
	notes: Note[];
	voiceNotes: VoiceNote[];
	trees: Tree[];
	tasks: Task[];
	photoCaptions?: string[];
	compiledNotes?: string; // Optional pre-compiled notes from noteCompilationEngine
	reportType?: 'full' | 'summary' | 'observations' | 'recommendations' | 'hazards' | 'bs5837' | 'impact' | 'method';
	clientName?: string;
	date?: Date;
}

export interface ReportSection {
	title: string;
	content: string;
	level: 1 | 2 | 3;
}

export interface GeneratedReport {
	title: string;
	sections: ReportSection[];
	metadata: {
		projectName: string;
		clientName: string;
		date: string;
		generatedAt: string;
		reportType: string;
		contentSources: {
			notes: number;
			voiceNotes: number;
			trees: number;
			tasks: number;
			photos: number;
		};
	};
	html?: string;
	markdown: string;
}

/**
 * Generate a structured, professional, client-ready arboricultural report.
 * 
 * Tone rules:
 * - No teaching, no explaining arboriculture
 * - No patronising language
 * - Assume user expertise
 * - Observational, factual tone
 * - Professional, formal language suitable for client delivery
 * 
 * Report structure (8 sections):
 * 1. Title Page
 * 2. Executive Summary
 * 3. Site Overview
 * 4. Observations
 * 5. Hazards & Constraints
 * 6. Recommendations
 * 7. Additional Information
 * 8. Appendix
 */
export async function generateReport(input: ReportGenerationInput): Promise<GeneratedReport> {
	const {
		project,
		notes,
		voiceNotes,
		trees,
		tasks,
		photoCaptions = [],
		compiledNotes,
		reportType = 'full',
		clientName = project.client || 'Client',
		date = new Date()
	} = input;

	// 1. Compile notes if not provided
	const compiledContent = compiledNotes || await compileNotes({
		project,
		notes,
		voiceNotes,
		photoCaptions,
		outputFormat: 'section'
	});

	// 2. Extract key information
	const keyInfo = extractKeyInformation(project, notes, voiceNotes, trees, tasks, photoCaptions);

	// 3. Generate sections based on report type
	const sections = generateReportSections(compiledContent, keyInfo, reportType, project, clientName, date);

	// 4. Apply professional tone and formatting
	const polishedSections = applyProfessionalTone(sections);

	// 5. Build final report
	return buildFinalReport(polishedSections, project, clientName, date, reportType, {
		notes: notes.length,
		voiceNotes: voiceNotes.length,
		trees: trees.length,
		tasks: tasks.length,
		photos: photoCaptions.length
	});
}

/**
 * Extract key information from all sources
 */
function extractKeyInformation(
	project: Project,
	notes: Note[],
	voiceNotes: VoiceNote[],
	trees: Tree[],
	tasks: Task[],
	photoCaptions: string[]
) {
	const keyInfo = {
		projectName: project.name,
		location: project.location || 'Site location not specified',
		client: project.client || 'Client',
		description: project.description || '',
		
		// Tree statistics
		treeCount: trees.length,
		species: Array.from(new Set(trees.map(t => t.species).filter(Boolean))),
		conditions: Array.from(new Set(trees.map(t => t.condition).filter(Boolean))),
		treeNotes: trees.filter(t => t.notes && t.notes.trim()).length,
		
		// Task statistics
		taskCount: tasks.length,
		activeTasks: tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length,
		completedTasks: tasks.filter(t => t.status === 'done').length,
		highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
		
		// Content statistics
		noteCount: notes.length,
		voiceNoteCount: voiceNotes.length,
		photoCount: photoCaptions.length,
		
		// Common themes from notes
		commonThemes: extractCommonThemes(notes, voiceNotes)
	};

	return keyInfo;
}

/**
 * Extract common themes from notes and voice transcripts
 */
function extractCommonThemes(notes: Note[], voiceNotes: VoiceNote[]): string[] {
	const themes = new Set<string>();
	const allText = [
		...notes.map(n => n.content.toLowerCase()),
		...voiceNotes.map(v => v.transcript.toLowerCase())
	].join(' ');

	// Arboriculture-specific themes
	const themeKeywords = [
		'health', 'safety', 'risk', 'hazard', 'condition', 'disease',
		'decay', 'crown', 'root', 'trunk', 'branch', 'canopy',
		'access', 'constraint', 'planning', 'permission', 'consultation',
		'recommendation', 'action', 'monitoring', 'inspection', 'survey',
		'protection', 'retention', 'removal', 'pruning', 'management'
	];

	for (const keyword of themeKeywords) {
		if (allText.includes(keyword)) {
			themes.add(keyword);
		}
	}

	// Add from note tags
	for (const note of notes) {
		for (const tag of note.tags) {
			themes.add(tag.toLowerCase());
		}
	}

	return Array.from(themes).slice(0, 10); // Limit to top 10 themes
}

/**
 * Generate report sections based on type
 */
function generateReportSections(
	compiledContent: string,
	keyInfo: any,
	reportType: string,
	project: Project,
	clientName: string,
	date: Date
): ReportSection[] {
	const sections: ReportSection[] = [];

	// 1. Title Page (always included)
	sections.push({
		title: `${project.name} - Arboricultural Report`,
		content: generateTitlePage(project, clientName, date, keyInfo),
		level: 1
	});

	// 2. Executive Summary (always included)
	sections.push({
		title: 'Executive Summary',
		content: generateExecutiveSummary(keyInfo, reportType),
		level: 2
	});

	// 3. Site Overview (always included)
	sections.push({
		title: 'Site Overview',
		content: generateSiteOverview(project, keyInfo),
		level: 2
	});

	// 4. Observations (core section)
	sections.push({
		title: 'Observations',
		content: generateObservationsSection(compiledContent, keyInfo),
		level: 2
	});

	// 5. Hazards & Constraints (if relevant)
	if (reportType === 'full' || reportType === 'hazards' || keyInfo.commonThemes.some((t: string) => t.includes('hazard') || t.includes('risk') || t.includes('constraint'))) {
		sections.push({
			title: 'Hazards & Constraints',
			content: generateHazardsSection(compiledContent, keyInfo),
			level: 2
		});
	}

	// 6. Recommendations (if relevant)
	if (reportType === 'full' || reportType === 'recommendations' || keyInfo.commonThemes.some((t: string) => t.includes('recommend') || t.includes('action'))) {
		sections.push({
			title: 'Recommendations',
			content: generateRecommendationsSection(compiledContent, keyInfo),
			level: 2
		});
	}

	// 7. Additional Information (for full reports)
	if (reportType === 'full') {
		sections.push({
			title: 'Additional Information',
			content: generateAdditionalInfoSection(keyInfo),
			level: 2
		});
	}

	// 8. Appendix (for full reports with data)
	if (reportType === 'full' && (keyInfo.treeCount > 0 || keyInfo.taskCount > 0)) {
		sections.push({
			title: 'Appendix',
			content: generateAppendixSection(keyInfo),
			level: 2
		});
	}

	return sections;
}

/**
 * Generate title page content
 */
function generateTitlePage(project: Project, clientName: string, date: Date, keyInfo: any): string {
	const formattedDate = date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});

	return `
# ${project.name}

## Arboricultural Report

**Client:** ${clientName}
**Project:** ${project.name}
**Location:** ${project.location || 'Not specified'}
**Date:** ${formattedDate}
**Report Reference:** ARB-${date.getFullYear()}-${project.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}

---

### Report Summary

This report presents findings from arboricultural assessment activities at ${project.location || 'the site'}. 
The assessment includes ${keyInfo.treeCount} trees, ${keyInfo.noteCount} field notes, and ${keyInfo.voiceNoteCount} voice recordings.

**Prepared by:** Oscar AI Arboricultural Assistant
**For:** ${clientName}
**Date of Issue:** ${formattedDate}
`;
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(keyInfo: any, reportType: string): string {
	let summary = `This report summarises arboricultural observations and findings for ${keyInfo.projectName}. `;

	if (keyInfo.treeCount > 0) {
		summary += `The assessment covered ${keyInfo.treeCount} individual trees, including ${keyInfo.species.length} distinct species. `;
	}

	if (keyInfo.noteCount > 0 || keyInfo.voiceNoteCount > 0) {
		summary += `Field observations were documented through ${keyInfo.noteCount} written notes and ${keyInfo.voiceNoteCount} voice recordings. `;
	}

	if (keyInfo.commonThemes.length > 0) {
		summary += `Key themes identified include ${keyInfo.commonThemes.slice(0, 3).join(', ')}. `;
	}

	if (keyInfo.highPriorityTasks > 0) {
		summary += `${keyInfo.highPriorityTasks} high-priority actions have been identified. `;
	}

	summary += `\n\nThis ${reportType} report provides ${getReportTypeDescription(reportType)}.`;

	return summary.trim();
}

function getReportTypeDescription(type: string): string {
	switch (type) {
		case 'full': return 'a comprehensive assessment including all observations, hazards, and recommendations';
		case 'summary': return 'a high-level overview of key findings';
		case 'observations': return 'detailed observational data from site assessments';
		case 'recommendations': return 'specific arboricultural recommendations and actions';
		case 'hazards': return 'identified hazards and risk assessment';
		default: return 'assessment findings';
	}
}

/**
 * Generate site overview section
 */
function generateSiteOverview(project: Project, keyInfo: any): string {
	let overview = `**Project:** ${project.name}\n`;
	overview += `**Location:** ${project.location || 'Not specified'}\n`;
	overview += `**Client:** ${project.client || 'Not specified'}\n\n`;

	if (project.description) {
		overview += `**Project Description:** ${project.description}\n\n`;
	}

	overview += `**Assessment Scope:**\n`;
	overview += `- Trees assessed: ${keyInfo.treeCount}\n`;
	overview += `- Field notes: ${keyInfo.noteCount}\n`;
	overview += `- Voice recordings: ${keyInfo.voiceNoteCount}\n`;
	overview += `- Photographs: ${keyInfo.photoCount}\n`;
	overview += `- Active tasks: ${keyInfo.activeTasks}\n\n`;

	if (keyInfo.species.length > 0) {
		overview += `**Species Present:** ${keyInfo.species.join(', ')}\n\n`;
	}

	return overview.trim();
}

/**
 * Generate observations section
 */
function generateObservationsSection(compiledContent: string, keyInfo: any): string {
	// Extract observation-related content from compiled notes
	const observationKeywords = ['observed', 'observation', 'noted', 'found', 'identified', 'condition', 'health'];
	
	let observations = `Based on ${keyInfo.noteCount + keyInfo.voiceNoteCount} field records, the following observations were documented:\n\n`;

	// Add compiled content (which already includes observations)
	observations += compiledContent + '\n\n';

	// Add tree-specific observations if available
	if (keyInfo.treeCount > 0) {
		observations += `**Tree Observations:**\n`;
		observations += `- ${keyInfo.treeCount} trees were assessed\n`;
		if (keyInfo.species.length > 0) {
			observations += `- Species represented: ${keyInfo.species.join(', ')}\n`;
		}
		if (keyInfo.conditions.length > 0) {
			observations += `- Conditions noted: ${keyInfo.conditions.join(', ')}\n`;
		}
		observations += `- ${keyInfo.treeNotes} trees have detailed notes\n\n`;
	}

	return observations.trim();
}

/**
 * Generate hazards section
 */
function generateHazardsSection(compiledContent: string, keyInfo: any): string {
	let hazards = `**Identified Hazards & Constraints**\n\n`;

	// Check compiled content for hazard-related terms
	const hazardTerms = ['hazard', 'risk', 'danger', 'unsafe', 'constraint', 'limitation', 'access issue', 'safety'];
	const hasHazardContent = hazardTerms.some(term => compiledContent.toLowerCase().includes(term));

	if (hasHazardContent) {
		hazards += `The following hazards and constraints were identified during assessment:\n\n`;
		// Extract hazard-related sentences (simplified)
		const lines = compiledContent.split('\n').filter(line => 
			hazardTerms.some(term => line.toLowerCase().includes(term))
		);
		
		if (lines.length > 0) {
			hazards += lines.map(line => `• ${line.trim()}`).join('\n') + '\n\n';
		} else {
			hazards += `Hazard-related observations are incorporated within the general observations section.\n\n`;
		}
	} else {
		hazards += `No specific hazards or constraints were explicitly documented in the field notes.\n\n`;
	}

	// Add general arboricultural hazard considerations
	hazards += `**General Arboricultural Considerations:**\n`;
	hazards += `• Site access and egress points\n`;
	hazards += `• Proximity to structures, utilities, and public areas\n`;
	hazards += `• Tree condition factors affecting stability\n`;
	hazards += `• Seasonal and environmental factors\n`;
	hazards += `• Planning and regulatory constraints\n`;

	return hazards.trim();
}

/**
 * Generate recommendations section
 */
function generateRecommendationsSection(compiledContent: string, keyInfo: any): string {
	let recommendations = `**Recommendations**\n\n`;

	// Check for recommendation content
	const recommendationTerms = ['recommend', 'suggest', 'advise', 'should', 'action', 'next step', 'priority'];
	const hasRecommendationContent = recommendationTerms.some(term => compiledContent.toLowerCase().includes(term));

	if (hasRecommendationContent) {
		recommendations += `Based on field observations, the following recommendations are proposed:\n\n`;
		
		// Extract recommendation-related sentences
		const lines = compiledContent.split('\n').filter(line => 
			recommendationTerms.some(term => line.toLowerCase().includes(term))
		);
		
		if (lines.length > 0) {
			recommendations += lines.map(line => `• ${line.trim()}`).join('\n') + '\n\n';
		} else {
			recommendations += `Recommendations are implied within the observational data and require professional interpretation.\n\n`;
		}
	} else {
		recommendations += `No specific recommendations were explicitly documented. Professional arboricultural assessment is recommended to determine appropriate actions.\n\n`;
	}

	// Add task-based recommendations
	if (keyInfo.activeTasks > 0) {
		recommendations += `**Documented Actions:**\n`;
		recommendations += `• ${keyInfo.activeTasks} active tasks require attention\n`;
		recommendations += `• ${keyInfo.highPriorityTasks} high-priority items identified\n`;
		recommendations += `• ${keyInfo.completedTasks} actions already completed\n\n`;
	}

	// Standard arboricultural recommendation categories
	recommendations += `**Standard Recommendation Categories:**\n`;
	recommendations += `1. **Monitoring & Inspection** - Regular assessment schedule\n`;
	recommendations += `2. **Tree Works** - Pruning, removal, or crown management\n`;
	recommendations += `3. **Protection Measures** - Root protection, crown support\n`;
	recommendations += `4. **Planning & Consultation** - Regulatory compliance\n`;
	recommendations += `5. **Risk Management** - Hazard mitigation strategies\n`;

	return recommendations.trim();
}

/**
 * Generate additional information section
 */
function generateAdditionalInfoSection(keyInfo: any): string {
	let info = `**Additional Information**\n\n`;

	info += `**Data Sources:**\n`;
	info += `• Field notes: ${keyInfo.noteCount}\n`;
	info += `• Voice recordings: ${keyInfo.voiceNoteCount}\n`;
	info += `• Photographs: ${keyInfo.photoCount}\n`;
	info += `• Tree records: ${keyInfo.treeCount}\n\n`;

	info += `**Common Themes Identified:**\n`;
	if (keyInfo.commonThemes.length > 0) {
		info += keyInfo.commonThemes.map((theme: string) => `• ${theme}`).join('\n') + '\n\n';
	} else {
		info += `No specific themes were automatically identified.\n\n`;
	}

	info += `**Task Status:**\n`;
	info += `• Active tasks: ${keyInfo.activeTasks}\n`;
	info += `• Completed tasks: ${keyInfo.completedTasks}\n`;
	info += `• High priority: ${keyInfo.highPriorityTasks}\n\n`;

	info += `**Report Limitations:**\n`;
	info += `• This report is generated from field data and may require professional verification.\n`;
	info += `• Recommendations should be reviewed by a qualified arboricultural consultant.\n`;
	info += `• Site-specific factors may affect the applicability of general observations.\n`;

	return info.trim();
}

/**
 * Generate appendix section
 */
function generateAppendixSection(keyInfo: any): string {
	let appendix = `**Appendix**\n\n`;

	if (keyInfo.treeCount > 0) {
		appendix += `**Tree Inventory Summary:**\n`;
		appendix += `• Total trees: ${keyInfo.treeCount}\n`;
		appendix += `• Species count: ${keyInfo.species.length}\n`;
		appendix += `• Trees with detailed notes: ${keyInfo.treeNotes}\n\n`;
	}

	if (keyInfo.taskCount > 0) {
		appendix += `**Task Summary:**\n`;
		appendix += `• Total tasks: ${keyInfo.taskCount}\n`;
		appendix += `• Active: ${keyInfo.activeTasks}\n`;
		appendix += `• Completed: ${keyInfo.completedTasks}\n`;
		appendix += `• High priority: ${keyInfo.highPriorityTasks}\n\n`;
	}

	appendix += `**Data Collection Details:**\n`;
	appendix += `• Report generated: ${new Date().toLocaleDateString('en-GB')}\n`;
	appendix += `• Data sources: Field notes, voice recordings, photographs\n`;
	appendix += `• Generation method: Oscar AI Arboricultural Assistant\n`;

	return appendix.trim();
}

/**
 * Apply professional tone to all sections
 */
function applyProfessionalTone(sections: ReportSection[]): ReportSection[] {
	const teachingPhrases = [
		/you should know that/gi,
		/let me explain/gi,
		/this means that/gi,
		/in other words/gi,
		/as you may know/gi,
		/for your information/gi,
		/I should mention that/gi,
		/it's important to note that/gi,
		/please note that/gi,
		/keep in mind that/gi
	];

	const patronisingPhrases = [
		/great job/gi,
		/well done/gi,
		/you did well/gi,
		/that's excellent/gi,
		/perfect/gi,
		/amazing/gi,
		/fantastic/gi,
		/brilliant/gi
	];

	return sections.map(section => ({
		...section,
		content: cleanContent(section.content, teachingPhrases, patronisingPhrases)
	}));
}

function cleanContent(content: string, teachingPhrases: RegExp[], patronisingPhrases: RegExp[]): string {
	let cleaned = content;
	
	// Remove teaching phrases
	for (const phrase of teachingPhrases) {
		cleaned = cleaned.replace(phrase, '');
	}
	
	// Remove patronising phrases
	for (const phrase of patronisingPhrases) {
		cleaned = cleaned.replace(phrase, '');
	}
	
	// Remove opinion phrases
	cleaned = cleaned.replace(/I think/gi, '');
	cleaned = cleaned.replace(/I believe/gi, '');
	cleaned = cleaned.replace(/in my opinion/gi, '');
	
	// Ensure professional tone
	cleaned = cleaned.replace(/maybe/gi, '');
	cleaned = cleaned.replace(/perhaps/gi, '');
	cleaned = cleaned.replace(/kind of/gi, '');
	cleaned = cleaned.replace(/sort of/gi, '');
	
	// Clean up whitespace
	cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
	
	return cleaned.trim();
}

/**
 * Build final report object
 */
function buildFinalReport(
	sections: ReportSection[],
	project: Project,
	clientName: string,
	date: Date,
	reportType: string,
	contentSources: { notes: number; voiceNotes: number; trees: number; tasks: number; photos: number }
): GeneratedReport {
	// Generate markdown
	const markdown = sections.map(section => {
		const prefix = '#'.repeat(section.level);
		return `${prefix} ${section.title}\n\n${section.content}\n\n`;
	}).join('\n');

	// Generate simple HTML (basic conversion)
	const html = sections.map(section => {
		const tag = `h${section.level}`;
		return `<${tag}>${section.title}</${tag}>\n<div>${section.content.replace(/\n/g, '<br>')}</div>\n`;
	}).join('\n');

	return {
		title: `${project.name} - Arboricultural Report`,
		sections,
		metadata: {
			projectName: project.name,
			clientName,
			date: date.toLocaleDateString('en-GB'),
			generatedAt: new Date().toISOString(),
			reportType,
			contentSources
		},
		html,
		markdown
	};
}

/**
 * Helper to get report generation suggestions based on project state
 */
export function getReportGenerationSuggestions(project: Project, noteCount: number, treeCount: number, taskCount: number): string[] {
	const suggestions: string[] = [];

	if (noteCount >= 3 || treeCount >= 1) {
		suggestions.push(`Generate arboricultural report for ${project.name}`);
		suggestions.push(`Create client-ready summary of ${project.name}`);
	}

	if (noteCount >= 5) {
		suggestions.push(`Draft comprehensive report with all observations`);
		suggestions.push(`Generate hazard assessment for ${project.name}`);
	}

	if (treeCount >= 3) {
		suggestions.push(`Create tree inventory report for ${project.name}`);
		suggestions.push(`Generate species-specific assessment`);
	}

	if (taskCount >= 2) {
		suggestions.push(`Generate action plan report with task priorities`);
		suggestions.push(`Create recommendations report based on active tasks`);
	}

	if (noteCount >= 10 || treeCount >= 5) {
		suggestions.push(`Generate full professional arboricultural report`);
		suggestions.push(`Create comprehensive client deliverable`);
	}

	return suggestions;
}

/**
 * Quick report generation for simple use cases
 */
export async function generateQuickReport(project: Project, notes: Note[], trees: Tree[]): Promise<string> {
	const input: ReportGenerationInput = {
		project,
		notes,
		voiceNotes: [],
		trees,
		tasks: [],
		reportType: 'summary'
	};

	const report = await generateReport(input);
	return report.markdown;
}

/**
 * Save generated report to database
 */
export async function saveGeneratedReportToDatabase(
	report: GeneratedReport,
	projectId: string,
	reportType: 'bs5837' | 'impact' | 'method' = 'bs5837'
): Promise<string> {
	// Import db dynamically to avoid circular dependencies
	const { db, saveReport } = await import('$lib/db');
	
	// Convert markdown to HTML (simple conversion for now)
	const htmlContent = convertMarkdownToHtml(report.markdown);
	
	// Create a Blob from the HTML content
	const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
	
	// Save to database
	const reportId = await saveReport({
		projectId,
		title: report.title,
		type: reportType,
		pdfBlob: htmlBlob, // Using HTML blob as PDF for now
		isDummy: false
	});
	
	return reportId;
}

/**
 * Simple markdown to HTML conversion
 */
function convertMarkdownToHtml(markdown: string): string {
	// Basic conversion for report structure
	let html = markdown
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^#### (.*$)/gim, '<h4>$1</h4>')
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/`(.*?)`/g, '<code>$1</code>')
		.replace(/\n\n/g, '</p><p>')
		.replace(/\n/g, '<br>');
	
	// Wrap in proper HTML structure
	const titleMatch = typeof html === 'string' ? html.match(/<h1>(.*?)<\/h1>/) : null;
	const title = titleMatch ? titleMatch[1] : 'Arboricultural Report';
	
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title}</title>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
		h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
		h2 { color: #34495e; margin-top: 30px; }
		h3 { color: #7f8c8d; }
		strong { color: #2c3e50; }
		code { background: #f8f9fa; padding: 2px 6px; border-radius: 4px; }
		ul, ol { margin-left: 20px; }
		li { margin-bottom: 8px; }
	</style>
</head>
<body>
	${html}
</body>
</html>`;
}

/**
 * Generate and save report in one step
 */
export async function generateAndSaveReport(
	input: ReportGenerationInput,
	reportType: 'bs5837' | 'impact' | 'method' = 'bs5837'
): Promise<{ report: GeneratedReport; reportId: string }> {
	const report = await generateReport(input);
	const reportId = await saveGeneratedReportToDatabase(report, input.project.id!, reportType);
	
	return { report, reportId };
}