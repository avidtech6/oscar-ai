import type { Note, VoiceNote, Project } from '$lib/db';

export interface NoteCompilationInput {
	project: Project;
	notes: Note[];
	voiceNotes: VoiceNote[];
	photoCaptions?: string[];
	contextTags?: string[];
	outputFormat?: 'narrative' | 'bullet' | 'section' | 'summary';
}

/**
 * Compile multiple notes, voice transcripts, and photo analyses into a clean, structured, professional document draft.
 * 
 * Tone rules:
 * - No teaching, no explaining arboriculture
 * - No patronising language
 * - Assume user expertise
 * - Observational, factual tone
 * - Coherent narrative or section draft suitable for reports, summaries, or client communication
 * 
 * Thematic extraction:
 * - Observations
 * - Site details
 * - Hazards
 * - Recommendations
 * - Constraints
 * - General narrative
 */
export async function compileNotes(input: NoteCompilationInput): Promise<string> {
	const { project, notes, voiceNotes, photoCaptions = [], contextTags = [], outputFormat = 'narrative' } = input;

	// 1. Gather all content
	const allContent = gatherAllContent(notes, voiceNotes, photoCaptions);

	// 2. Extract themes
	const themes = extractThemes(allContent, contextTags);

	// 3. Merge content by theme
	const mergedContent = mergeContentByTheme(allContent, themes);

	// 4. Structure output based on format
	const structuredOutput = structureOutput(mergedContent, themes, project, outputFormat);

	// 5. Apply tone rules and polish
	const finalOutput = applyToneRules(structuredOutput, project);

	return finalOutput;
}

/**
 * Gather all text content from notes, voice transcripts, and photo captions
 */
function gatherAllContent(notes: Note[], voiceNotes: VoiceNote[], photoCaptions: string[]): Array<{
	text: string;
	source: 'note' | 'voice' | 'photo';
	timestamp?: Date;
	tags?: string[];
}> {
	const content: Array<{
		text: string;
		source: 'note' | 'voice' | 'photo';
		timestamp?: Date;
		tags?: string[];
	}> = [];

	// Add notes
	for (const note of notes) {
		if (note.content && note.content.trim()) {
			content.push({
				text: note.content,
				source: 'note',
				timestamp: note.updatedAt,
				tags: note.tags
			});
		}
	}

	// Add voice notes
	for (const voiceNote of voiceNotes) {
		if (voiceNote.transcript && voiceNote.transcript.trim()) {
			content.push({
				text: voiceNote.transcript,
				source: 'voice',
				timestamp: voiceNote.timestamp,
				tags: [voiceNote.intent]
			});
		}
	}

	// Add photo captions
	for (const caption of photoCaptions) {
		if (caption && caption.trim()) {
			content.push({
				text: caption,
				source: 'photo',
				timestamp: new Date() // Approximate
			});
		}
	}

	// Sort by timestamp (most recent first)
	return content.sort((a, b) => {
		const timeA = a.timestamp?.getTime() || 0;
		const timeB = b.timestamp?.getTime() || 0;
		return timeB - timeA;
	});
}

/**
 * Extract common themes from content
 */
function extractThemes(
	content: Array<{ text: string; source: string; tags?: string[] }>,
	contextTags: string[]
): string[] {
	const themes = new Set<string>();

	// Add context tags as themes
	for (const tag of contextTags) {
		themes.add(tag.toLowerCase());
	}

	// Common arboriculture themes (observational, not explanatory)
	const commonThemes = [
		'observations',
		'site details',
		'hazards',
		'recommendations',
		'constraints',
		'tree condition',
		'access',
		'planning',
		'client requirements',
		'timeline',
		'budget',
		'photos',
		'measurements',
		'species',
		'location'
	];

	// Check for theme keywords in content
	for (const item of content) {
		const text = item.text.toLowerCase();

		// Check for common theme keywords
		for (const theme of commonThemes) {
			if (text.includes(theme.toLowerCase())) {
				themes.add(theme);
			}
		}

		// Check tags
		if (item.tags) {
			for (const tag of item.tags) {
				themes.add(tag.toLowerCase());
			}
		}
	}

	// Ensure we have at least some themes
	if (themes.size === 0) {
		themes.add('observations');
		themes.add('site details');
	}

	return Array.from(themes);
}

/**
 * Merge content by theme
 */
function mergeContentByTheme(
	content: Array<{ text: string; source: string; timestamp?: Date; tags?: string[] }>,
	themes: string[]
): Record<string, string[]> {
	const themeContent: Record<string, string[]> = {};

	// Initialize with empty arrays
	for (const theme of themes) {
		themeContent[theme] = [];
	}

	// Assign content to themes
	for (const item of content) {
		const text = item.text;
		const lowerText = text.toLowerCase();

		// Find which themes this content relates to
		const matchingThemes = themes.filter(theme => 
			lowerText.includes(theme.toLowerCase()) ||
			(item.tags && item.tags.some(tag => tag.toLowerCase().includes(theme.toLowerCase())))
		);

		// If no specific theme matches, add to 'observations'
		if (matchingThemes.length === 0) {
			themeContent['observations'].push(text);
		} else {
			// Add to all matching themes
			for (const theme of matchingThemes) {
				themeContent[theme].push(text);
			}
		}
	}

	// Remove empty themes
	for (const theme of themes) {
		if (themeContent[theme].length === 0) {
			delete themeContent[theme];
		}
	}

	return themeContent;
}

/**
 * Structure output based on format
 */
function structureOutput(
	themeContent: Record<string, string[]>,
	themes: string[],
	project: Project,
	outputFormat: 'narrative' | 'bullet' | 'section' | 'summary'
): string {
	const projectName = project.name;
	const location = project.location || 'the site';

	switch (outputFormat) {
		case 'narrative':
			return createNarrativeOutput(themeContent, themes, projectName, location);
		case 'bullet':
			return createBulletOutput(themeContent, themes, projectName);
		case 'section':
			return createSectionOutput(themeContent, themes, projectName);
		case 'summary':
			return createSummaryOutput(themeContent, themes, projectName, location);
		default:
			return createNarrativeOutput(themeContent, themes, projectName, location);
	}
}

/**
 * Create narrative output (coherent paragraphs)
 */
function createNarrativeOutput(
	themeContent: Record<string, string[]>,
	themes: string[],
	projectName: string,
	location: string
): string {
	let output = `# ${projectName}\n\n`;

	// Site details section
	if (themeContent['site details'] && themeContent['site details'].length > 0) {
		output += `## Site Details\n\n`;
		output += `The site at ${location} presents the following characteristics:\n\n`;
		for (const detail of themeContent['site details']) {
			output += `- ${detail}\n`;
		}
		output += '\n';
	}

	// Observations section
	if (themeContent['observations'] && themeContent['observations'].length > 0) {
		output += `## Observations\n\n`;
		for (const observation of themeContent['observations']) {
			output += `${observation}\n\n`;
		}
	}

	// Tree condition section
	if (themeContent['tree condition'] && themeContent['tree condition'].length > 0) {
		output += `## Tree Condition\n\n`;
		for (const condition of themeContent['tree condition']) {
			output += `${condition}\n\n`;
		}
	}

	// Hazards section
	if (themeContent['hazards'] && themeContent['hazards'].length > 0) {
		output += `## Hazards\n\n`;
		for (const hazard of themeContent['hazards']) {
			output += `${hazard}\n\n`;
		}
	}

	// Recommendations section
	if (themeContent['recommendations'] && themeContent['recommendations'].length > 0) {
		output += `## Recommendations\n\n`;
		for (const recommendation of themeContent['recommendations']) {
			output += `${recommendation}\n\n`;
		}
	}

	// Constraints section
	if (themeContent['constraints'] && themeContent['constraints'].length > 0) {
		output += `## Constraints\n\n`;
		for (const constraint of themeContent['constraints']) {
			output += `${constraint}\n\n`;
		}
	}

	// Other themes
	for (const theme of themes) {
		if (!['site details', 'observations', 'tree condition', 'hazards', 'recommendations', 'constraints'].includes(theme)) {
			if (themeContent[theme] && themeContent[theme].length > 0) {
				output += `## ${theme.charAt(0).toUpperCase() + theme.slice(1)}\n\n`;
				for (const item of themeContent[theme]) {
					output += `${item}\n\n`;
				}
			}
		}
	}

	return output.trim();
}

/**
 * Create bullet point output
 */
function createBulletOutput(
	themeContent: Record<string, string[]>,
	themes: string[],
	projectName: string
): string {
	let output = `# ${projectName}\n\n`;

	for (const theme of themes) {
		if (themeContent[theme] && themeContent[theme].length > 0) {
			output += `## ${theme.charAt(0).toUpperCase() + theme.slice(1)}\n\n`;
			for (const item of themeContent[theme]) {
				output += `• ${item}\n`;
			}
			output += '\n';
		}
	}

	return output.trim();
}

/**
 * Create section output (for reports)
 */
function createSectionOutput(
	themeContent: Record<string, string[]>,
	themes: string[],
	projectName: string
): string {
	let output = `## ${projectName}\n\n`;

	// Group by priority themes
	const priorityThemes = ['observations', 'site details', 'hazards', 'recommendations', 'constraints'];
	
	for (const theme of priorityThemes) {
		if (themeContent[theme] && themeContent[theme].length > 0) {
			output += `### ${theme.charAt(0).toUpperCase() + theme.slice(1)}\n\n`;
			for (const item of themeContent[theme]) {
				output += `${item}\n\n`;
			}
		}
	}

	// Other themes
	for (const theme of themes) {
		if (!priorityThemes.includes(theme)) {
			if (themeContent[theme] && themeContent[theme].length > 0) {
				output += `### ${theme.charAt(0).toUpperCase() + theme.slice(1)}\n\n`;
				for (const item of themeContent[theme]) {
					output += `${item}\n\n`;
				}
			}
		}
	}

	return output.trim();
}

/**
 * Create summary output
 */
function createSummaryOutput(
	themeContent: Record<string, string[]>,
	themes: string[],
	projectName: string,
	location: string
): string {
	let output = `# Summary: ${projectName}\n\n`;

	// Key points from each theme
	const keyPoints: string[] = [];

	for (const theme of themes) {
		if (themeContent[theme] && themeContent[theme].length > 0) {
			// Take first item from each theme as key point
			const firstItem = themeContent[theme][0];
			if (firstItem && firstItem.trim().length > 0) {
				keyPoints.push(`• ${theme}: ${firstItem.substring(0, 100)}${firstItem.length > 100 ? '...' : ''}`);
			}
		}
	}

	if (keyPoints.length > 0) {
		output += `Key points from ${location}:\n\n`;
		output += keyPoints.join('\n');
		output += '\n\n';
	}

	// Total content count
	const totalItems = Object.values(themeContent).reduce((sum, items) => sum + items.length, 0);
	output += `Based on ${totalItems} notes, voice recordings, and photos.`;

	return output.trim();
}

/**
 * Apply tone rules to polish output
 */
function applyToneRules(output: string, project: Project): string {
	// Remove any teaching/explanatory phrases
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

	let cleaned = output;
	for (const phrase of teachingPhrases) {
		cleaned = cleaned.replace(phrase, '');
	}

	// Remove patronising language
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

	for (const phrase of patronisingPhrases) {
		cleaned = cleaned.replace(phrase, '');
	}

	// Ensure observational tone
	// Replace "I think" with observational statements
	cleaned = cleaned.replace(/I think/gi, '');
	cleaned = cleaned.replace(/I believe/gi, '');
	cleaned = cleaned.replace(/in my opinion/gi, '');

	// Remove redundant whitespace
	cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

	return cleaned.trim();
}

/**
 * Helper to get compilation suggestions based on project state
 */
export function getCompilationSuggestions(project: Project, noteCount: number, voiceNoteCount: number): string[] {
	const suggestions: string[] = [];

	if (noteCount >= 3) {
		suggestions.push(`Compile ${noteCount} notes into a project summary`);
		suggestions.push(`Create a narrative from notes about ${project.name}`);
	}

	if (voiceNoteCount >= 2) {
		suggestions.push(`Combine ${voiceNoteCount} voice recordings with notes`);
		suggestions.push(`Create section draft from voice transcripts`);
	}

	if (noteCount >= 5 || voiceNoteCount >= 3) {
		suggestions.push(`Draft report section from all project content`);
		suggestions.push(`Generate structured observations for ${project.name}`);
	}

	return suggestions;
}