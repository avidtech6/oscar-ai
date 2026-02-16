import { db, type Project, type Tree, type Note } from '$lib/db';

// Extended Project interface for template data
export interface TemplateProject extends Project {
	siteAddress: string;
	reference: string;
}

export interface TemplateData {
	project: TemplateProject;
	trees: Tree[];
	notes: Note[];
	survey: {
		date: string;
		surveyor: string;
		qualification: string;
	};
	company: {
		name: string;
		address: string;
		phone: string;
		email: string;
	};
	recommendations: {
		retainedTrees: Array<{ treeRef: string; species: string; category: string }>;
		removedTrees: Array<{ treeRef: string; reason: string }>;
		management: string[];
	};
}

export interface Template {
	id: string;
	name: string;
	description: string;
	type: 'bs5837' | 'impact' | 'method' | 'condition';
	htmlPath: string;
	thumbnail?: string;
}

// Available templates
export const availableTemplates: Template[] = [
	{
		id: 'bs5837',
		name: 'BS5837:2012 Tree Survey',
		description: 'Complete tree constraints survey with category assessment',
		type: 'bs5837',
		htmlPath: '/templates/bs5837.html',
		thumbnail: '🌳'
	},
	{
		id: 'impact',
		name: 'Arboricultural Impact Assessment',
		description: 'Assessment of development impacts on trees',
		type: 'impact',
		htmlPath: '/src/lib/templates/impact.html',
		thumbnail: '📊'
	},
	{
		id: 'method',
		name: 'Arboricultural Method Statement',
		description: 'Detailed tree protection methodology',
		type: 'method',
		htmlPath: '/src/lib/templates/method.html',
		thumbnail: '📝'
	},
	{
		id: 'condition',
		name: 'Tree Condition Report',
		description: 'Visual Tree Assessment (VTA) report',
		type: 'condition',
		htmlPath: '/src/lib/templates/condition.html',
		thumbnail: '🔍'
	}
];

// Load template HTML
export async function loadTemplateHtml(templateId: string): Promise<string> {
	try {
		const template = availableTemplates.find(t => t.id === templateId);
		if (!template) {
			throw new Error(`Template not found: ${templateId}`);
		}

		// For now, we'll use the built-in templates
		// In a production app, you would fetch from the server
		switch (templateId) {
			case 'bs5837':
				// Try to load BS5837 template from the specified path
				try {
					const response = await fetch(template.htmlPath);
					if (response.ok) {
						return await response.text();
					}
				} catch (e) {
					console.warn(`Failed to fetch BS5837 template from ${template.htmlPath}, trying fallback`);
				}
				// Fallback to the template in src/lib/templates/
				try {
					const response = await fetch('/src/lib/templates/bs5837.html');
					if (response.ok) {
						return await response.text();
					}
				} catch (e) {
					console.warn('Failed to fetch BS5837 template from /src/lib/templates/bs5837.html');
				}
				// Ultimate fallback: return minimal template
				return getMinimalBs5837Template();
			case 'impact':
			case 'method':
			case 'condition':
				const response = await fetch(template.htmlPath);
				if (!response.ok) {
					throw new Error(`Failed to load template: ${templateId}`);
				}
				return await response.text();
			default:
				// For other templates, return a simple placeholder
				return `
					<!DOCTYPE html>
					<html>
					<head>
						<title>${template.name}</title>
						<style>
							body { font-family: Arial, sans-serif; padding: 20px; }
							.header { border-bottom: 2px solid #2e7d32; padding-bottom: 10px; margin-bottom: 20px; }
							.section { margin: 20px 0; }
							.missing-data { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
						</style>
					</head>
					<body>
						<div class="header">
							<h1>${template.name}</h1>
							<p><strong>Project:</strong> {{project.name}}</p>
							<p><strong>Client:</strong> {{project.client}}</p>
							<p><strong>Date:</strong> {{survey.date}}</p>
						</div>
						<div class="section">
							<h2>Report Content</h2>
							<div class="missing-data">
								<strong>Template Under Development:</strong> The ${template.name} template is currently being developed. Please use the BS5837 template for now.
							</div>
						</div>
					</body>
					</html>
				`;
		}
	} catch (error) {
		console.error('Error loading template:', error);
		// Fallback to minimal template for BS5837
		if (templateId === 'bs5837') {
			return getMinimalBs5837Template();
		}
		throw error;
	}
}

// Minimal BS5837 template fallback
function getMinimalBs5837Template(): string {
	return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BS5837:2012 Tree Survey Report</title>
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
        <h1>BS5837:2012 Tree Survey Report</h1>
        <p><strong>Project:</strong> {{project.name}}</p>
        <p><strong>Client:</strong> {{project.client}}</p>
        <p><strong>Site Address:</strong> {{project.siteAddress}}</p>
        <p><strong>Date:</strong> {{survey.date}}</p>
    </div>
    
    <div class="section">
        <div class="section-title">Tree Schedule</div>
        {{#if trees.length}}
        <table>
            <thead>
                <tr>
                    <th>Ref</th>
                    <th>Species</th>
                    <th>Height (m)</th>
                    <th>Stem Dia (mm)</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                {{#each trees}}
                <tr>
                    <td>{{number}}</td>
                    <td>{{species}}</td>
                    <td>{{height}}</td>
                    <td>{{DBH}}</td>
                    <td>{{category}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        {{else}}
        <p>No trees recorded for this project.</p>
        {{/if}}
    </div>
    
    <div class="section">
        <div class="section-title">Recommendations</div>
        <p>Report generated by Oscar AI Arboricultural Services.</p>
    </div>
</body>
</html>`;
}

// Prepare template data from project
export async function prepareTemplateData(projectId: string): Promise<TemplateData> {
	const project = await db.projects.get(projectId);
	if (!project) {
		throw new Error(`Project not found: ${projectId}`);
	}

	const trees = await db.trees.where('projectId').equals(projectId).toArray();
	const notes = await db.notes.where('projectId').equals(projectId).toArray();

	// Calculate RPA for trees
	const treesWithRPA = trees.map(tree => ({
		...tree,
		RPA: tree.DBH * 12, // Simple RPA calculation
		RPA_radius: (tree.DBH * 12) / 1000, // Convert to meters
		RPA_area: Math.PI * Math.pow((tree.DBH * 12) / 1000, 2) // Area in m²
	}));

	// Generate recommendations based on tree data
	const retainedTrees = treesWithRPA
		.filter(tree => tree.category === 'A' || tree.category === 'B')
		.map(tree => ({
			treeRef: tree.number,
			species: tree.species,
			category: tree.category
		}));

	const removedTrees = treesWithRPA
		.filter(tree => tree.category === 'U' || tree.condition?.toLowerCase().includes('poor') || tree.condition?.toLowerCase().includes('dead'))
		.map(tree => ({
			treeRef: tree.number,
			reason: tree.category === 'U' ? 'Unsuitable for retention' : 
				   tree.condition?.toLowerCase().includes('dead') ? 'Dead tree' :
				   'Poor condition'
		}));

	// Extract management recommendations from notes
	const managementNotes = notes
		.filter(note => note.type === 'field' || note.content.toLowerCase().includes('prune') || note.content.toLowerCase().includes('manage'))
		.map(note => note.content.substring(0, 100) + '...');

	const templateProject: TemplateProject = {
		...project,
		client: project.client || 'Not specified',
		// Map location to siteAddress for template compatibility
		siteAddress: project.location || 'Not specified',
		// Generate a reference for the template
		reference: `PROJ-${projectId.substring(0, 8).toUpperCase()}`
	};
	
	return {
		project: templateProject,
		trees: treesWithRPA,
		notes,
		survey: {
			date: new Date().toLocaleDateString('en-GB'),
			surveyor: 'Surveyor Name', // This should come from user settings
			qualification: 'Arboricultural Consultant'
		},
		company: {
			name: 'Oscar AI Arboricultural Services',
			address: '123 Tree Street, Forest City, FC1 2TR',
			phone: '+44 1234 567890',
			email: 'reports@oscar-ai.app'
		},
		recommendations: {
			retainedTrees,
			removedTrees,
			management: managementNotes.length > 0 ? managementNotes : [
				'Regular monitoring of retained trees during construction',
				'Implement tree protection measures as per BS5837',
				'Consider seasonal timing for any tree works'
			]
		}
	};
}

// Simple template rendering (basic variable substitution)
export function renderTemplate(html: string, data: TemplateData): string {
	let rendered = html;

	// Replace simple variables
	rendered = rendered.replace(/{{project\.name}}/g, data.project.name || '');
	rendered = rendered.replace(/{{project\.client}}/g, data.project.client || '');
	rendered = rendered.replace(/{{project\.siteAddress}}/g, data.project.siteAddress || '');
	rendered = rendered.replace(/{{project\.reference}}/g, data.project.reference || '');
	
	rendered = rendered.replace(/{{survey\.date}}/g, data.survey.date);
	rendered = rendered.replace(/{{survey\.surveyor}}/g, data.survey.surveyor);
	rendered = rendered.replace(/{{survey\.qualification}}/g, data.survey.qualification);
	
	rendered = rendered.replace(/{{company\.name}}/g, data.company.name);
	rendered = rendered.replace(/{{company\.address}}/g, data.company.address);
	rendered = rendered.replace(/{{company\.phone}}/g, data.company.phone);
	rendered = rendered.replace(/{{company\.email}}/g, data.company.email);

	// Handle conditional blocks (very basic implementation)
	if (data.trees.length === 0) {
		// Remove tree schedule table if no trees
		rendered = rendered.replace(/{{#if trees\.length}}[\s\S]*?{{\/if}}/g, '');
	}

	// Remove missing data placeholders if data exists
	if (data.recommendations.retainedTrees.length > 0) {
		rendered = rendered.replace(/{{#if recommendations\.retainedTrees}}[\s\S]*?{{\/if}}/g, 
			data.recommendations.retainedTrees.map(tree => 
				`<li>${tree.treeRef} - ${tree.species} - Category ${tree.category}</li>`
			).join(''));
	}

	if (data.recommendations.removedTrees.length > 0) {
		rendered = rendered.replace(/{{#if recommendations\.removedTrees}}[\s\S]*?{{\/if}}/g,
			`<table>
				<thead>
					<tr><th>Tree Ref</th><th>Reason for Removal</th></tr>
				</thead>
				<tbody>
					${data.recommendations.removedTrees.map(tree =>
						`<tr><td>${tree.treeRef}</td><td>${tree.reason}</td></tr>`
					).join('')}
				</tbody>
			</table>`);
	}

	if (data.recommendations.management.length > 0) {
		rendered = rendered.replace(/{{#if recommendations\.management}}[\s\S]*?{{\/if}}/g,
			data.recommendations.management.map(item => `<li>${item}</li>`).join(''));
	}

	return rendered;
}

// Get templates for a specific report type
export function getTemplatesForType(reportType: string): Template[] {
	return availableTemplates.filter(template => 
		template.type === reportType.toLowerCase() || 
		(reportType === 'BS5837' && template.type === 'bs5837') ||
		(reportType === 'AIA' && template.type === 'impact') ||
		(reportType === 'AMS' && template.type === 'method') ||
		(reportType === 'TREE_CONDITION' && template.type === 'condition')
	);
}

// Check for missing data in template
export function checkMissingData(data: TemplateData, templateId: string): string[] {
	const missing: string[] = [];

	if (!data.project.client || data.project.client === 'Not specified') {
		missing.push('Client name');
	}

	if (!data.project.siteAddress || data.project.siteAddress === 'Not specified') {
		missing.push('Site address');
	}

	if (data.trees.length === 0) {
		missing.push('Tree data');
	}

	if (templateId === 'bs5837') {
		if (data.trees.length > 0) {
			const treesWithoutCategory = data.trees.filter(tree => !tree.category);
			if (treesWithoutCategory.length > 0) {
				missing.push(`Tree categories for ${treesWithoutCategory.length} trees`);
			}
		}
	}

	return missing;
}

// Parse HTML into editable sections
export interface ReportSection {
	id: string;
	title: string;
	content: string;
	html: string;
	order: number;
}

export function parseHtmlIntoSections(html: string): ReportSection[] {
	const sections: ReportSection[] = [];
	
	// Create a temporary DOM parser
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	
	// Find all section elements
	const sectionElements = doc.querySelectorAll('.section');
	
	sectionElements.forEach((sectionEl, index) => {
		const titleEl = sectionEl.querySelector('.section-title');
		const title = titleEl?.textContent?.trim() || `Section ${index + 1}`;
		
		// Get the HTML content of the section
		const content = sectionEl.innerHTML;
		
		// Create a clean version without the title for editing
		const contentWithoutTitle = sectionEl.cloneNode(true) as HTMLElement;
		const titleElClone = contentWithoutTitle.querySelector('.section-title');
		if (titleElClone) {
			titleElClone.remove();
		}
		
		sections.push({
			id: `section-${index + 1}`,
			title,
			content: contentWithoutTitle.innerHTML,
			html: sectionEl.outerHTML,
			order: index + 1
		});
	});
	
	// If no sections found with .section class, create a single section
	if (sections.length === 0) {
		sections.push({
			id: 'section-1',
			title: 'Report Content',
			content: html,
			html: html,
			order: 1
		});
	}
	
	return sections;
}

// Update a specific section in HTML
export function updateSectionInHtml(originalHtml: string, sectionId: string, newContent: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(originalHtml, 'text/html');
	
	const sections = doc.querySelectorAll('.section');
	let sectionIndex = -1;
	
	// Find the section index
	sections.forEach((section, index) => {
		const titleEl = section.querySelector('.section-title');
		const title = titleEl?.textContent?.trim() || `Section ${index + 1}`;
		const id = `section-${index + 1}`;
		if (id === sectionId) {
			sectionIndex = index;
		}
	});
	
	if (sectionIndex === -1) {
		// If section not found, return original
		return originalHtml;
	}
	
	// Update the section content
	const section = sections[sectionIndex];
	const titleEl = section.querySelector('.section-title');
	const titleHtml = titleEl?.outerHTML || '';
	
	// Create new section HTML
	const newSectionHtml = `<div class="section">${titleHtml}${newContent}</div>`;
	
	// Replace the section
	section.outerHTML = newSectionHtml;
	
	return doc.documentElement.outerHTML;
}

// Get section titles from HTML
export function getSectionTitles(html: string): Array<{id: string; title: string}> {
	const sections = parseHtmlIntoSections(html);
	return sections.map(section => ({
		id: section.id,
		title: section.title
	}));
}