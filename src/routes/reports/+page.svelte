<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db, type Project, type Tree, type Note, type Task, saveReport, getReports } from '$lib/db';
	import { groqApiKey } from '$lib/stores/settings';
	import {
		availableTemplates,
		loadTemplateHtml,
		prepareTemplateData,
		renderTemplate,
		checkMissingData,
		parseHtmlIntoSections,
		updateSectionInHtml,
		getSectionTitles,
		type Template,
		type ReportSection
	} from '$lib/services/templateService';
	import { suggestClientName, suggestSiteAddress, parseUserAnswer, generateFollowUpQuestions, generateAIGapFillQuestions } from '$lib/services/aiActions';
	import { quickWorkflowCheck, getPersonalizedWorkflowSuggestions, recordWorkflowAction } from '$lib/services/userWorkflowLearningService';
	import { quickSystemHealthCheck, runReportIntelligencePipeline, getSystemCapabilities } from '$lib/services/reportIntelligenceService';
	import MicButton from '$lib/components/MicButton.svelte';
	import ReportWizard from '$lib/components/reports/ReportWizard.svelte';
	import ReportPreview from '$lib/components/reports/ReportPreview.svelte';
	import ReportEditor from '$lib/components/reports/ReportEditor.svelte';
	import SectionEditor from '$lib/components/reports/SectionEditor.svelte';
	import ProjectContextBar from '$lib/components/reports/ProjectContextBar.svelte';
	import UnifiedAIPrompt from '$lib/components/ai/UnifiedAIPrompt.svelte';

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	// Project context
	let allProjects: Project[] = [];
	let selectedProjectId = '';
	let selectedProject: Project | undefined;
	let trees: Tree[] = [];
	let notes: Note[] = [];
	let tasks: Task[] = [];
	
	// Report state
	let selectedTemplate: Template | null = null;
	let generatedReport = '';
	let generating = false;
	let error = '';
	let loading = true;
	let missingData: string[] = [];
	let showMissingDataWarning = false;
	let reportMode: 'template' | 'ai' = 'template';
	let additionalNotes = '';
	
	// AI-guided flow state
	let aiFlowStep: 'project-confirm' | 'data-pull' | 'gap-fill' | 'review' = 'project-confirm';
	let pullProjectData = false;
	let gapFillQuestions: Array<{id: string; question: string; answer: string; field: string}> = [];
	let currentGapIndex = 0;
	let followUpQuestions: string[] = [];
	
	// Report generation steps
	let currentStep: 'project-select' | 'template-select' | 'ai-guided' | 'generate' | 'edit' | 'edit-sections' = 'project-select';
	
	// Section editing state
	let sections: ReportSection[] = [];
	let currentSectionIndex = 0;
	let editMode: 'full' | 'sections' = 'full';
	
	// AI Assistant state
	let showAIAssistant = false;
	
	// Workflow learning state
	let workflowInsightsLoading = false;
	let workflowInsights: any = null;
	let showWorkflowInsights = false;
	let personalizedSuggestions: any[] = [];

	// Report Intelligence System state
	let systemHealthLoading = false;
	let systemHealth: any = null;
	let showSystemHealth = false;
	let systemCapabilities: any[] = [];
	let runningPipeline = false;
	let pipelineResults: any = null;
	let pipelineError: string | null = null;

	onMount(async () => {
		// Load all projects for selection
		allProjects = await db.projects.orderBy('updatedAt').reverse().toArray();
		
		// Check if project is in URL
		const urlParams = new URLSearchParams($page.url.search);
		const projectIdFromUrl = urlParams.get('project') || '';
		const reportId = urlParams.get('report');
		const mode = urlParams.get('mode');
		
		if (projectIdFromUrl) {
			selectedProjectId = projectIdFromUrl;
			await loadProjectContext();
		} else {
			loading = false;
		}
		
		// If report ID is provided, load that report for editing
		if (reportId && mode === 'edit') {
			try {
				// Load report from IndexedDB
				const report = await db.reports.get(reportId);
				if (report) {
					// Convert Blob to HTML string for editing
					const htmlContent = await report.pdfBlob.text();
					generatedReport = htmlContent;
					
					// Map report type to template
					selectedTemplate = availableTemplates.find(t => t.id === report.type) || null;
					selectedProjectId = report.projectId;
					await loadProjectContext();
					currentStep = 'edit';
				}
			} catch (error) {
				console.error('Failed to load report from IndexedDB:', error);
				// Fallback to localStorage for backward compatibility during migration
				const storedReports = localStorage.getItem('oscar_reports');
				if (storedReports) {
					const allReports = JSON.parse(storedReports);
					const report = allReports.find((r: any) => r.id === reportId);
					if (report) {
						generatedReport = report.content || '';
						selectedTemplate = availableTemplates.find(t => t.id === report.type) || null;
						selectedProjectId = report.projectId;
						await loadProjectContext();
						currentStep = 'edit';
						
						// Migrate this report to IndexedDB
						try {
							const blob = new Blob([report.content], { type: 'text/html' });
							await saveReport({
								projectId: report.projectId,
								title: report.title || `${selectedTemplate?.name || 'Report'} - ${selectedProject?.name || ''}`,
								type: report.type as any,
								pdfBlob: blob
							});
							console.log('Migrated report from localStorage to IndexedDB:', reportId);
						} catch (migrationError) {
							console.warn('Failed to migrate report to IndexedDB:', migrationError);
						}
					}
				}
			}
		}
	});

	async function loadProjectContext() {
		if (!selectedProjectId) return;
		
		try {
			// Load project
			selectedProject = await db.projects.get(selectedProjectId);
			if (!selectedProject) {
				error = 'Project not found';
				loading = false;
				return;
			}

			// Load trees
			trees = await db.trees.where('projectId').equals(selectedProjectId).toArray();

			// Load notes
			notes = await db.notes.where('projectId').equals(selectedProjectId).toArray();
			
			// Load tasks
			tasks = await db.tasks.where('projectId').equals(selectedProjectId).toArray();

			loading = false;
			
			// If we have a project, move to template selection
			if (currentStep === 'project-select') {
				currentStep = 'template-select';
			}
			
		} catch (e) {
			error = 'Failed to load project';
			console.error(e);
			loading = false;
		}
	}

	function selectProject(projectId: string) {
		selectedProjectId = projectId;
		loadProjectContext();
	}

	async function selectTemplate(template: Template) {
		selectedTemplate = template;
		
		// Check for missing data (only if we have a project)
		if (selectedProjectId) {
			const data = await prepareTemplateData(selectedProjectId);
			missingData = checkMissingData(data, template.id);
			showMissingDataWarning = missingData.length > 0;
			
			// Generate gap fill questions
			generateGapFillQuestions();
		} else {
			// No project selected, so no missing data to check
			missingData = [];
			showMissingDataWarning = false;
			gapFillQuestions = [];
		}
		
		// Start AI-guided flow
		aiFlowStep = 'project-confirm';
		currentStep = 'ai-guided';
	}

	async function generateGapFillQuestions() {
		gapFillQuestions = [];
		
		if (!selectedTemplate || !selectedProjectId) {
			// Fallback to static questions if no template or project
			generateStaticGapFillQuestions();
			return;
		}
		
		try {
			// Prepare project data for AI
			const projectData = await prepareTemplateData(selectedProjectId);
			
			// Generate AI-powered questions
			const aiQuestions = await generateAIGapFillQuestions(selectedTemplate.id, projectData);
			
			// Use AI questions if we got any
			if (aiQuestions.length > 0) {
				gapFillQuestions = aiQuestions;
			} else {
				// Fallback to static questions
				generateStaticGapFillQuestions();
			}
		} catch (error) {
			console.error('Failed to generate AI gap-fill questions:', error);
			// Fallback to static questions
			generateStaticGapFillQuestions();
		}
		
		currentGapIndex = 0;
		followUpQuestions = []; // Reset follow-up questions
	}
	
	function generateStaticGapFillQuestions() {
		gapFillQuestions = [];
		
		// If no project selected, ask for basic information
		if (!selectedProject) {
			gapFillQuestions.push({
				id: crypto.randomUUID(),
				question: 'What is the client or organization name?',
				answer: '',
				field: 'client'
			});
			
			gapFillQuestions.push({
				id: crypto.randomUUID(),
				question: 'What is the site address or location?',
				answer: '',
				field: 'location'
			});
			
			gapFillQuestions.push({
				id: crypto.randomUUID(),
				question: 'Do you have any tree survey data to include?',
				answer: '',
				field: 'trees'
			});
			
			gapFillQuestions.push({
				id: crypto.randomUUID(),
				question: 'Any field notes or observations to include?',
				answer: '',
				field: 'notes'
			});
		} else {
			// Project selected, check for missing data
			if (!selectedProject.client || selectedProject.client === 'Not specified') {
				gapFillQuestions.push({
					id: crypto.randomUUID(),
					question: 'What is the client name?',
					answer: '',
					field: 'client'
				});
			}
			
			if (!selectedProject.location || selectedProject.location === 'Not specified') {
				gapFillQuestions.push({
					id: crypto.randomUUID(),
					question: 'What is the site address?',
					answer: '',
					field: 'location'
				});
			}
			
			if (trees.length === 0) {
				gapFillQuestions.push({
					id: crypto.randomUUID(),
					question: 'Do you have a tree plan or survey data?',
					answer: '',
					field: 'trees'
				});
			}
			
			if (notes.length === 0) {
				gapFillQuestions.push({
					id: crypto.randomUUID(),
					question: 'Do you have any field notes or observations?',
					answer: '',
					field: 'notes'
				});
			}
		}
	}

	async function continueAIFlow() {
		if (aiFlowStep === 'project-confirm') {
			aiFlowStep = 'data-pull';
		} else if (aiFlowStep === 'data-pull') {
			if (pullProjectData) {
				// Pull in project data
				// This is already done in loadProjectContext
			}
			aiFlowStep = 'gap-fill';
		} else if (aiFlowStep === 'gap-fill') {
			if (currentGapIndex < gapFillQuestions.length - 1) {
				currentGapIndex++;
			} else {
				aiFlowStep = 'review';
			}
		} else if (aiFlowStep === 'review') {
			await generateReport();
		}
	}

	async function generateReport() {
		if (!selectedTemplate) return;
		
		generating = true;
		error = '';
		generatedReport = '';

		try {
			let htmlContent = '';
			
			if (reportMode === 'template') {
				// Load template HTML
				const templateHtml = await loadTemplateHtml(selectedTemplate.id);
				
				// Prepare data (only if we have a project)
				let templateData: any = { project: { name: 'Generic Report', client: 'Not specified', siteAddress: 'Not specified' } };
				if (selectedProjectId) {
					templateData = await prepareTemplateData(selectedProjectId);
					// Apply gap fill answers
					const updatedData = applyGapFillAnswers(templateData);
					templateData = updatedData;
				}
				
				// Render template
				htmlContent = renderTemplate(templateHtml, templateData);
			} else {
				// AI-generated report
				if (!apiKey) {
					error = 'Please configure your Groq API key in Settings first.';
					generating = false;
					return;
				}

				// Build context text with gap fill answers
				let contextText = buildContextText();
				
				const systemPrompt = `You are an expert arboricultural consultant. Generate a professional ${selectedTemplate?.name} report in HTML format with proper styling for PDF generation. Include all necessary sections for a professional report.`;
				
				const userPrompt = `Generate a ${selectedTemplate?.name} report based on the following data:\n\n${contextText}\n\nAdditional notes: ${additionalNotes || 'None'}\n\nPlease format the response as HTML with inline CSS for professional styling.`;

				const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${apiKey}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						model: 'llama-3.1-8b-instant',
						messages: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: userPrompt }
						],
						temperature: 0.7,
						max_tokens: 4096
					})
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error?.message || 'Failed to generate report');
				}

				const data = await response.json();
				htmlContent = data.choices[0].message.content;
			}
			
			generatedReport = htmlContent;
			currentStep = 'generate';
			
			// Save to IndexedDB for later editing
			const reportId = crypto.randomUUID();
			const reportTitle = selectedProject
				? `${selectedTemplate?.name} - ${selectedProject?.name}`
				: `${selectedTemplate?.name} - Generic Report`;
			
			// Convert HTML to Blob for storage
			const pdfBlob = new Blob([htmlContent], { type: 'text/html' });
			
			// Map template ID to report type (ensure it matches Report interface)
			let reportType: 'bs5837' | 'impact' | 'method' = 'bs5837';
			if (selectedTemplate?.id === 'impact') reportType = 'impact';
			if (selectedTemplate?.id === 'method') reportType = 'method';
			if (selectedTemplate?.id === 'condition') reportType = 'bs5837'; // Fallback for condition template
			
			// Use empty string for projectId if no project selected
			const projectIdForSave = selectedProjectId || '';
			
			try {
				await saveReport({
					projectId: projectIdForSave,
					title: reportTitle,
					type: reportType,
					pdfBlob
				});
				console.log('Report saved to IndexedDB:', reportId);
				
				// Also save to localStorage for backward compatibility during migration
				const report = {
					id: reportId,
					projectId: projectIdForSave,
					type: selectedTemplate?.id,
					title: reportTitle,
					content: htmlContent,
					generatedAt: new Date().toISOString()
				};
				
				const storedReports = localStorage.getItem('oscar_reports');
				const allReports = storedReports ? JSON.parse(storedReports) : [];
				allReports.push(report);
				localStorage.setItem('oscar_reports', JSON.stringify(allReports));
			} catch (saveError) {
				console.error('Failed to save report to IndexedDB:', saveError);
				// Fallback to localStorage only
				const report = {
					id: reportId,
					projectId: projectIdForSave,
					type: selectedTemplate?.id,
					title: reportTitle,
					content: htmlContent,
					generatedAt: new Date().toISOString()
				};
				
				const storedReports = localStorage.getItem('oscar_reports');
				const allReports = storedReports ? JSON.parse(storedReports) : [];
				allReports.push(report);
				localStorage.setItem('oscar_reports', JSON.stringify(allReports));
			}
			
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to generate report';
			console.error(e);
		} finally {
			generating = false;
		}
	}

	function buildContextText(): string {
		let context = '';
		
		if (selectedProject) {
			context += 'PROJECT: ' + selectedProject.name + '\n';
			
			// Apply gap fill answers
			let clientName = selectedProject.client || 'Not specified';
			let siteAddress = selectedProject.location || 'Not specified';
			
			for (const gap of gapFillQuestions) {
				if (gap.answer && gap.field === 'client') clientName = gap.answer;
				if (gap.answer && gap.field === 'location') siteAddress = gap.answer;
			}
			
			context += 'Client: ' + clientName + '\n';
			context += 'Site: ' + siteAddress + '\n\n';
			
			context += 'TREES:\n';
			if (trees.length > 0) {
				trees.forEach(tree => {
					context += `- ${tree.number}: ${tree.species} (${tree.scientificName || 'N/A'})\n`;
					context += `  DBH: ${tree.DBH}mm, Height: ${tree.height || 'N/A'}m\n`;
					context += `  Category: ${tree.category || 'Not assessed'}, Condition: ${tree.condition || 'N/A'}\n`;
					context += '\n';
				});
			} else {
				context += 'No trees recorded yet.\n\n';
			}
			
			if (notes.length > 0) {
				context += 'FIELD NOTES:\n';
				notes.forEach(note => {
					context += `- ${new Date(note.createdAt).toLocaleString('en-GB')}: ${note.content}\n`;
				});
			}
			
			if (tasks.length > 0) {
				context += 'TASKS:\n';
				tasks.forEach(task => {
					context += `- ${task.title}: ${task.status}\n`;
				});
			}
		} else {
			context += 'GENERIC REPORT: No specific project selected.\n\n';
			context += 'This is a generic report template. Please add project-specific details as needed.\n\n';
			
			// Include any gap fill answers even without a project
			if (gapFillQuestions.length > 0) {
				context += 'USER-PROVIDED INFORMATION:\n';
				for (const gap of gapFillQuestions) {
					if (gap.answer) {
						context += `- ${gap.question}: ${gap.answer}\n`;
					}
				}
				context += '\n';
			}
		}
		
		return context;
	}

	function applyGapFillAnswers(data: any): any {
		const updatedData = { ...data };
		
		// Ensure project object exists
		if (!updatedData.project) {
			updatedData.project = { name: 'Generic Report', client: 'Not specified', siteAddress: 'Not specified' };
		}
		
		for (const gap of gapFillQuestions) {
			if (gap.answer) {
				if (gap.field === 'client') {
					updatedData.project.client = gap.answer;
				} else if (gap.field === 'location') {
					updatedData.project.siteAddress = gap.answer;
				}
			}
		}
		
		return updatedData;
	}

	function copyToClipboard() {
		if (generatedReport) {
			navigator.clipboard.writeText(generatedReport);
			alert('Report copied to clipboard!');
		}
	}

	function downloadAsHtml() {
		if (!generatedReport) return;
		
		const blob = new Blob([generatedReport], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = (selectedTemplate?.id || 'report') + '_' + (selectedProject?.name || 'report') + '_' + new Date().toISOString().split('T')[0] + '.html';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	
	function downloadAsPdf() {
		if (!generatedReport) return;
		
		// Simple PDF generation - use a safer approach
		const w = window.open('', '_blank');
		if (!w) {
			alert('Please allow popups to generate PDF');
			return;
		}
		// Use a safer approach to avoid parsing issues
		const safeReport = generatedReport.replace(/[{}]/g, '');
		w.document.write('<html><head><title>Report</title></head><body>' + safeReport + '</body></html>');
		w.document.close();
		setTimeout(function() {
			w.print();
			setTimeout(function() { w.close(); }, 1000);
		}, 500);
	}
	
	function downloadAsWord() {
		if (!generatedReport) return;
		
		const title = (selectedTemplate?.name || 'Report') + ' - ' + (selectedProject?.name || '');
		
		// Simple Word document generation - use safer approach
		const safeReport = generatedReport.replace(/[{}]/g, '');
		const htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + '</title><style>body{font-family:Arial,sans-serif;margin:20px;}h1,h2,h3{color:#2e7d32;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;}th{background-color:#f5f5f5;}</style></head><body>' + safeReport + '</body></html>';
		
		const blob = new Blob([htmlContent], { type: 'application/msword' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = (selectedTemplate?.id || 'report') + '_' + (selectedProject?.name || 'report') + '_' + new Date().toISOString().split('T')[0] + '.doc';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	
	function downloadAsPlainText() {
		if (!generatedReport) return;
		
		// Convert HTML to plain text
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = generatedReport;
		const plainText = tempDiv.textContent || tempDiv.innerText || '';
		
		const blob = new Blob([plainText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = (selectedTemplate?.id || 'report') + '_' + (selectedProject?.name || 'report') + '_' + new Date().toISOString().split('T')[0] + '.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function goBack() {
		if (currentStep === 'template-select') {
			currentStep = 'project-select';
		} else if (currentStep === 'ai-guided') {
			if (aiFlowStep === 'project-confirm') {
				currentStep = 'template-select';
			} else if (aiFlowStep === 'data-pull') {
				aiFlowStep = 'project-confirm';
			} else if (aiFlowStep === 'gap-fill') {
				if (currentGapIndex > 0) {
					currentGapIndex--;
				} else {
					aiFlowStep = 'data-pull';
				}
			} else if (aiFlowStep === 'review') {
				aiFlowStep = 'gap-fill';
				currentGapIndex = Math.max(0, gapFillQuestions.length - 1);
			}
		} else if (currentStep === 'generate') {
			currentStep = 'ai-guided';
			aiFlowStep = 'review';
		}
	}

	function startOver() {
		currentStep = 'project-select';
		selectedTemplate = null;
		generatedReport = '';
		error = '';
		missingData = [];
		showMissingDataWarning = false;
		aiFlowStep = 'project-confirm';
		pullProjectData = false;
		gapFillQuestions = [];
		currentGapIndex = 0;
		sections = [];
		currentSectionIndex = 0;
		editMode = 'full';
	}
	
	function enterSectionEditMode() {
		if (!generatedReport) return;
		
		sections = parseHtmlIntoSections(generatedReport);
		currentSectionIndex = 0;
		editMode = 'sections';
		currentStep = 'edit-sections';
	}
	
	function updateCurrentSection() {
		if (sections.length === 0 || currentSectionIndex >= sections.length) return;
		
		const section = sections[currentSectionIndex];
		generatedReport = updateSectionInHtml(generatedReport, section.id, section.content);
		
		// Update the sections array with the new HTML
		sections = parseHtmlIntoSections(generatedReport);
	}
	
	function nextSection() {
		if (currentSectionIndex < sections.length - 1) {
			currentSectionIndex++;
		}
	}
	
	function previousSection() {
		if (currentSectionIndex > 0) {
			currentSectionIndex--;
		}
	}
	
	function saveAndExitSectionEdit() {
		updateCurrentSection();
		editMode = 'full';
		currentStep = 'edit';
	}

	// AI suggestion for client name with confidence display and auto-fill for high confidence
	async function suggestClientNameForGap() {
		const currentQuestion = gapFillQuestions[currentGapIndex];
		if (currentQuestion.field !== 'client') return;
		
		try {
			// Prepare project data for AI (if we have a project)
			let projectData: any = { project: { name: 'Generic Report', client: 'Not specified', siteAddress: 'Not specified' } };
			if (selectedProjectId) {
				projectData = await prepareTemplateData(selectedProjectId);
			}
			const result = await suggestClientName(projectData);
			
			// For Step 18: Auto-fill when confidence is high (≥ 80%)
			if (result.confidence >= 80) {
				// Auto-fill the answer
				gapFillQuestions[currentGapIndex].answer = result.suggestion;
				gapFillQuestions = [...gapFillQuestions]; // Trigger reactivity
				
				// Show auto-fill notification
				alert(`✓ Auto-filled client name: ${result.suggestion}\nConfidence: ${result.confidence}% (High confidence - auto-applied)`);
			} else {
				// For medium/low confidence, ask user to confirm
				const shouldApply = confirm(`AI suggestion: ${result.suggestion}\nConfidence: ${result.confidence}%\n\nApply this suggestion?`);
				if (shouldApply) {
					gapFillQuestions[currentGapIndex].answer = result.suggestion;
					gapFillQuestions = [...gapFillQuestions]; // Trigger reactivity
				}
			}
		} catch (error) {
			console.error('Failed to get AI suggestion:', error);
			alert('Could not get AI suggestion. Please check your API key in Settings.');
		}
	}

	// AI suggestion for site address with confidence display and auto-fill for high confidence
	async function suggestSiteAddressForGap() {
		const currentQuestion = gapFillQuestions[currentGapIndex];
		if (currentQuestion.field !== 'location') return;
		
		try {
			// Prepare project data for AI (if we have a project)
			let projectData: any = { project: { name: 'Generic Report', client: 'Not specified', siteAddress: 'Not specified' } };
			if (selectedProjectId) {
				projectData = await prepareTemplateData(selectedProjectId);
			}
			const result = await suggestSiteAddress(projectData);
			
			// For Step 18: Auto-fill when confidence is high (≥ 80%)
			if (result.confidence >= 80) {
				// Auto-fill the answer
				gapFillQuestions[currentGapIndex].answer = result.suggestion;
				gapFillQuestions = [...gapFillQuestions]; // Trigger reactivity
				
				// Show auto-fill notification
				alert(`✓ Auto-filled site address: ${result.suggestion}\nConfidence: ${result.confidence}% (High confidence - auto-applied)`);
			} else {
				// For medium/low confidence, ask user to confirm
				const shouldApply = confirm(`AI suggestion: ${result.suggestion}\nConfidence: ${result.confidence}%\n\nApply this suggestion?`);
				if (shouldApply) {
					gapFillQuestions[currentGapIndex].answer = result.suggestion;
					gapFillQuestions = [...gapFillQuestions]; // Trigger reactivity
				}
			}
		} catch (error) {
			console.error('Failed to get AI suggestion:', error);
			alert('Could not get AI suggestion. Please check your API key in Settings.');
		}
	}

	// Clean free-text answer with AI and confidence display
	// For Step 17: Multi-Field Extraction - works for both client and location fields
	async function cleanAnswerWithAI() {
		const currentQuestion = gapFillQuestions[currentGapIndex];
		if (currentQuestion.field !== 'client' && currentQuestion.field !== 'location') return;
		
		const answer = currentQuestion.answer;
		if (!answer || answer.trim() === '') {
			alert('Please enter an answer first before cleaning.');
			return;
		}
		
		try {
			const result = await parseUserAnswer(answer, currentQuestion.field);
			
			// Update the answer in the gap fill questions
			gapFillQuestions[currentGapIndex].answer = result.cleaned;
			gapFillQuestions = [...gapFillQuestions]; // Trigger reactivity
			
			// Show confidence score to user
			const fieldName = currentQuestion.field === 'client' ? 'client name' : 'site address';
			if (result.confidence >= 90) {
				alert(`Cleaned ${fieldName}: ${result.cleaned}\nConfidence: ${result.confidence}% (Very high confidence)`);
			} else if (result.confidence >= 70) {
				alert(`Cleaned ${fieldName}: ${result.cleaned}\nConfidence: ${result.confidence}% (High confidence)`);
			} else if (result.confidence >= 50) {
				alert(`Cleaned ${fieldName}: ${result.cleaned}\nConfidence: ${result.confidence}% (Medium confidence)`);
			} else {
				alert(`Cleaned ${fieldName}: ${result.cleaned}\nConfidence: ${result.confidence}% (Low confidence - please review)`);
			}
		} catch (error) {
			console.error('Failed to clean answer with AI:', error);
			alert('Could not clean answer. Please check your API key in Settings.');
		}
	}

	// Generate follow-up questions for site address
	async function generateFollowUpForGap() {
		const currentQuestion = gapFillQuestions[currentGapIndex];
		if (currentQuestion.field !== 'location') return;
		
		const answer = currentQuestion.answer;
		if (!answer || answer.trim() === '') {
			alert('Please enter a site address first before generating follow-up questions.');
			return;
		}
		
		try {
			followUpQuestions = await generateFollowUpQuestions('location', answer);
		} catch (error) {
			console.error('Failed to generate follow-up questions:', error);
			alert('Could not generate follow-up questions. Please check your API key in Settings.');
			followUpQuestions = [];
		}
	}

	// Helper function to escape curly braces for Svelte template safety
	function escapeForSvelte(html: string): string {
		if (!html) return '';
		// Replace { with &#123; and } with &#125; to prevent Svelte parsing errors
		return html.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
	}

	// Computed property for safe iframe content
	$: safeGeneratedReport = escapeForSvelte(generatedReport);
	$: safeSectionContent = sections[currentSectionIndex] ? escapeForSvelte(sections[currentSectionIndex].content) : '';
	
	// Workflow learning functions
	async function loadWorkflowInsights() {
		workflowInsightsLoading = true;
		
		try {
			// Record that user is viewing reports page
			await recordWorkflowAction('view_reports_page', {
				currentStep,
				selectedTemplate: selectedTemplate?.id,
				hasProject: !!selectedProject,
			});
			
			// Get quick workflow check
			const check = await quickWorkflowCheck();
			workflowInsights = check;
			
			// Get personalized suggestions
			const suggestions = await getPersonalizedWorkflowSuggestions();
			if (suggestions.success) {
				personalizedSuggestions = suggestions.suggestions || [];
			}
			
			showWorkflowInsights = true;
		} catch (error) {
			console.error('Failed to load workflow insights:', error);
		} finally {
			workflowInsightsLoading = false;
		}
	}
	
	function closeWorkflowInsights() {
		showWorkflowInsights = false;
		workflowInsights = null;
		personalizedSuggestions = [];
	}
	
	// Record workflow actions at key points
	$: if (currentStep) {
		// Record step changes
		setTimeout(async () => {
			try {
				await recordWorkflowAction(`step_${currentStep}`, {
					previousStep: undefined, // Could track previous step if needed
					template: selectedTemplate?.id,
					hasGeneratedReport: !!generatedReport,
				});
			} catch (error) {
				// Silent fail - don't disrupt user experience
			}
		}, 100);
	}
	
	$: if (selectedTemplate) {
		// Record template selection
		setTimeout(async () => {
			try {
				await recordWorkflowAction('select_template', {
					templateId: selectedTemplate.id,
					templateName: selectedTemplate.name,
				});
			} catch (error) {
				// Silent fail
			}
		}, 100);
	}
	
	$: if (generatedReport) {
		// Record report generation
		setTimeout(async () => {
			try {
				await recordWorkflowAction('generate_report', {
					templateId: selectedTemplate?.id,
					reportLength: generatedReport.length,
					hasProject: !!selectedProject,
				});
			} catch (error) {
				// Silent fail
			}
		}, 100);
	}

	// Report Intelligence System functions
	async function loadSystemHealth() {
		systemHealthLoading = true;
		
		try {
			const health = await quickSystemHealthCheck();
			systemHealth = health;
			
			const capabilities = await getSystemCapabilities();
			if (capabilities.success) {
				systemCapabilities = capabilities.capabilities || [];
			}
			
			showSystemHealth = true;
		} catch (error) {
			console.error('Failed to load system health:', error);
		} finally {
			systemHealthLoading = false;
		}
	}
	
	function closeSystemHealth() {
		showSystemHealth = false;
		systemHealth = null;
		systemCapabilities = [];
	}
	
	async function runIntelligencePipeline() {
		if (!generatedReport) {
			alert('Please generate a report first before running intelligence pipeline.');
			return;
		}
		
		runningPipeline = true;
		pipelineResults = null;
		pipelineError = null;
		
		try {
			const result = await runReportIntelligencePipeline(generatedReport, {
				enableReasoning: true,
				enableWorkflowLearning: true,
				enableSelfHealing: true,
				enableComplianceValidation: true,
				enableReproductionTesting: false,
				verbose: true,
			});
			
			if (result.success) {
				pipelineResults = result;
				
				// Show a summary of the pipeline results
				alert(`Report Intelligence Pipeline completed successfully!\n\nStages: ${result.stages?.length || 0}\nOverall Score: ${result.summary?.overallScore || 'N/A'}\nRecommendations: ${result.summary?.recommendations?.length || 0}`);
			} else {
				pipelineError = result.error || 'Unknown error';
				alert(`Pipeline failed: ${pipelineError}`);
			}
		} catch (error) {
			pipelineError = error instanceof Error ? error.message : 'Unknown error';
			console.error('Pipeline execution failed:', error);
			alert(`Pipeline execution failed: ${pipelineError}`);
		} finally {
			runningPipeline = false;
		}
	}
	
	function closePipelineResults() {
		pipelineResults = null;
		pipelineError = null;
	}
</script>

<svelte:head>
	<title>Reports - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<!-- Persistent Project Context Bar -->
	<ProjectContextBar
		selectedProject={selectedProject}
		trees={trees}
		notes={notes}
		tasks={tasks}
		changeProject={() => {
			currentStep = 'project-select';
			selectedProject = undefined;
		}}
	/>

	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-gray-900">HTML Report Builder</h1>
		<div class="flex gap-2">
			<button
				on:click={loadSystemHealth}
				disabled={systemHealthLoading}
				class="btn btn-secondary flex items-center gap-2"
			>
				{#if systemHealthLoading}
					<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
					</svg>
					Checking...
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
					System Health
				{/if}
			</button>
			<button
				on:click={loadWorkflowInsights}
				disabled={workflowInsightsLoading}
				class="btn btn-secondary flex items-center gap-2"
			>
				{#if workflowInsightsLoading}
					<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
					</svg>
					Analyzing...
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					Workflow Insights
				{/if}
			</button>
			<button
				on:click={() => showAIAssistant = true}
				class="btn btn-primary flex items-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
				AI Assistant
			</button>
		</div>
	</div>

	{#if error && !generatedReport}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	<!-- System Health Panel -->
	{#if showSystemHealth && systemHealth}
		<div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div class="flex items-center justify-between mb-3">
				<h3 class="font-medium text-blue-900">Report Intelligence System Health</h3>
				<button
					on:click={closeSystemHealth}
					class="text-blue-700 hover:text-blue-900"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-blue-700">{systemHealth.healthScore}%</div>
					<div class="text-xs text-gray-600">Health Score</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-blue-700">
						{#if systemHealth.status === 'operational'}
							✓
						{:else if systemHealth.status === 'degraded'}
							⚠
						{:else}
							✗
						{/if}
					</div>
					<div class="text-xs text-gray-600">Status</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-blue-700">{systemHealth.activeEngines}</div>
					<div class="text-xs text-gray-600">Active Engines</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-blue-700">{systemHealth.capabilities}</div>
					<div class="text-xs text-gray-600">Capabilities</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-blue-700">
						{#if systemHealth.integrationStatus === 'fully_integrated'}
							✓
						{:else if systemHealth.integrationStatus === 'partial'}
							⚠
						{:else}
							✗
						{/if}
					</div>
					<div class="text-xs text-gray-600">Integration</div>
				</div>
			</div>
			
			{#if systemCapabilities.length > 0}
				<div class="mb-4">
					<h4 class="font-medium text-blue-800 mb-2">System Capabilities</h4>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each systemCapabilities as capability}
							<div class="bg-white p-3 rounded border border-blue-100">
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0">
										{#if capability.status === 'active'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
												Active
											</span>
										{:else if capability.status === 'partial'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
												Partial
											</span>
										{:else}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
												Inactive
											</span>
										{/if}
									</div>
									<div class="flex-1">
										<div class="font-medium text-gray-900">{capability.name}</div>
										<div class="text-sm text-gray-600 mt-1">{capability.description}</div>
										<div class="flex items-center justify-between mt-2">
											<div class="text-xs text-gray-500">
												Phase {capability.phase}
											</div>
											<div class="text-xs text-blue-600">
												{capability.status}
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			{#if generatedReport && !runningPipeline}
				<div class="flex gap-2">
					<button
						on:click={runIntelligencePipeline}
						class="btn btn-primary flex items-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						Run Intelligence Pipeline
					</button>
					<button
						on:click={closeSystemHealth}
						class="btn btn-secondary"
					>
						Close
					</button>
				</div>
			{:else if runningPipeline}
				<div class="p-3 bg-blue-100 rounded border border-blue-200">
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						<div>
							<div class="font-medium text-blue-800">Running Intelligence Pipeline...</div>
							<div class="text-sm text-blue-700">Analyzing report with all 26-phase engines</div>
						</div>
					</div>
				</div>
			{/if}
			
			<div class="text-xs text-blue-600 mt-3">
				Powered by Report Intelligence System (Phase 14 Orchestrator)
			</div>
		</div>
	{/if}
	
	<!-- Pipeline Results Panel -->
	{#if pipelineResults}
		<div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
			<div class="flex items-center justify-between mb-3">
				<h3 class="font-medium text-green-900">Intelligence Pipeline Results</h3>
				<button
					on:click={closePipelineResults}
					class="text-green-700 hover:text-green-900"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-green-700">{pipelineResults.summary?.overallScore || 'N/A'}</div>
					<div class="text-xs text-gray-600">Overall Score</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-green-700">{pipelineResults.stages?.length || 0}</div>
					<div class="text-xs text-gray-600">Stages Completed</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-green-700">{pipelineResults.summary?.recommendations?.length || 0}</div>
					<div class="text-xs text-gray-600">Recommendations</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-green-700">
						{#if pipelineResults.success}
							✓
						{:else}
							✗
						{/if}
					</div>
					<div class="text-xs text-gray-600">Success</div>
				</div>
			</div>
			
			{#if pipelineResults.stages && pipelineResults.stages.length > 0}
				<div class="mb-4">
					<h4 class="font-medium text-green-800 mb-2">Pipeline Stages</h4>
					<div class="space-y-3">
						{#each pipelineResults.stages as stage}
							<div class="bg-white p-3 rounded border border-green-100">
								<div class="flex items-start justify-between">
									<div>
										<div class="font-medium text-gray-900 capitalize">{stage.stage.replace('_', ' ')}</div>
										<div class="text-sm text-gray-600 mt-1">Status: {stage.status}</div>
										<div class="text-xs text-gray-500 mt-1">Duration: {stage.duration}ms</div>
									</div>
									<div>
										{#if stage.status === 'completed'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
												✓
											</span>
										{:else if stage.status === 'error'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
												✗
											</span>
										{:else}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
												⚠
											</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			{#if pipelineResults.summary?.recommendations && pipelineResults.summary.recommendations.length > 0}
				<div class="mb-4">
					<h4 class="font-medium text-green-800 mb-2">Recommendations</h4>
					<div class="space-y-2">
						{#each pipelineResults.summary.recommendations as recommendation, i}
							<div class="flex items-start gap-2">
								<div class="flex-shrink-0 mt-1">
									<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
										{i + 1}
									</span>
								</div>
								<div class="text-sm text-gray-700">{recommendation}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			<div class="text-xs text-green-600">
				Pipeline completed successfully. Apply recommendations to improve your report.
			</div>
		</div>
	{/if}
	
	<!-- Workflow Insights Panel -->
	{#if showWorkflowInsights && workflowInsights}
		<div class="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
			<div class="flex items-center justify-between mb-3">
				<h3 class="font-medium text-purple-900">Workflow Insights</h3>
				<button
					on:click={closeWorkflowInsights}
					class="text-purple-700 hover:text-purple-900"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-purple-700">{workflowInsights.efficiencyScore}%</div>
					<div class="text-xs text-gray-600">Efficiency Score</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-purple-700">
						{#if workflowInsights.hasPatterns}
							✓
						{:else}
							✗
						{/if}
					</div>
					<div class="text-xs text-gray-600">Patterns Found</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-purple-700">{workflowInsights.suggestionCount}</div>
					<div class="text-xs text-gray-600">Suggestions</div>
				</div>
				<div class="bg-white p-3 rounded border">
					<div class="text-xl font-bold text-purple-700">
						{#if workflowInsights.nextActionPrediction}
							✓
						{:else}
							~
						{/if}
					</div>
					<div class="text-xs text-gray-600">Next Action Predicted</div>
				</div>
			</div>
			
			{#if personalizedSuggestions.length > 0}
				<div class="mb-4">
					<h4 class="font-medium text-purple-800 mb-2">Personalized Suggestions</h4>
					<div class="space-y-3">
						{#each personalizedSuggestions as suggestion}
							<div class="bg-white p-3 rounded border border-purple-100">
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0">
										{#if suggestion.type === 'workflow_optimization'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
												Optimization
											</span>
										{:else if suggestion.type === 'template_suggestion'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
												Template
											</span>
										{:else if suggestion.type === 'time_saving'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
												Time Saving
											</span>
										{:else if suggestion.type === 'compliance'}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
												Compliance
											</span>
										{:else}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
												Suggestion
											</span>
										{/if}
									</div>
									<div class="flex-1">
										<div class="font-medium text-gray-900">{suggestion.title}</div>
										<div class="text-sm text-gray-600 mt-1">{suggestion.description}</div>
										<div class="flex items-center justify-between mt-2">
											<div class="text-xs text-gray-500">
												Benefit: {suggestion.benefit}
											</div>
											<div class="text-xs text-purple-600">
												Confidence: {Math.round(suggestion.confidence * 100)}%
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			{#if workflowInsights.nextActionPrediction}
				<div class="mb-4 p-3 bg-purple-100 rounded border border-purple-200">
					<h4 class="font-medium text-purple-800 mb-1">Predicted Next Action</h4>
					<p class="text-sm text-purple-700">
						Based on your workflow patterns, you'll likely want to: <strong>{workflowInsights.nextActionPrediction.replace('_', ' ')}</strong>
					</p>
				</div>
			{/if}
			
			<div class="text-xs text-purple-600">
				Insights powered by User Workflow Learning Engine (Phase 13)
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500">Loading project data...</p>
		</div>
	{:else}
		<!-- Step 1: Project Selection (Optional) -->
		{#if currentStep === 'project-select'}
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Start a Report</h2>
				<p class="text-gray-600 mb-6">You can create a report with or without a project. Reports can be attached to a project later.</p>
				
				<div class="grid gap-4 md:grid-cols-2">
					<!-- Option 1: Start without a project -->
					<button
						on:click={() => {
							selectedProjectId = '';
							selectedProject = undefined;
							trees = [];
							notes = [];
							tasks = [];
							currentStep = 'template-select';
						}}
						class="flex flex-col items-start p-6 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
					>
						<div class="flex items-center gap-3 mb-3">
							<span class="text-2xl">📄</span>
							<div>
								<div class="font-medium text-gray-900">Generic Report</div>
								<div class="text-sm text-gray-500">Create a report without linking to a project</div>
							</div>
						</div>
						<div class="text-xs text-gray-400 mt-2">Ideal for templates, drafts, or general use</div>
					</button>
					
					<!-- Option 2: Select a project -->
					<div class="border rounded-lg p-6">
						<h3 class="font-medium text-gray-900 mb-3">Link to a Project</h3>
						<p class="text-sm text-gray-600 mb-4">Choose a project to include its data (trees, notes, tasks) in the report.</p>
						
						{#if allProjects.length === 0}
							<div class="text-center py-4">
								<p class="text-gray-500 mb-3">No projects found.</p>
								<a href="/project" class="btn btn-primary text-sm">Create a Project</a>
							</div>
						{:else}
							<div class="space-y-3 max-h-60 overflow-y-auto">
								{#each allProjects as project}
									<button
										on:click={() => project.id && selectProject(project.id)}
										class="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 transition-colors text-left w-full"
									>
										<div class="flex-1">
											<div class="font-medium text-gray-900 text-sm">{project.name}</div>
											<div class="text-xs text-gray-500">{project.client || 'No client specified'}</div>
										</div>
										<div class="text-blue-600">→</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				
				<!-- AI Assistant -->
				<UnifiedAIPrompt
					projectId={selectedProjectId}
					isOpen={showAIAssistant}
				/>
			</div>
		{/if}

		<!-- Step 2: Template Selection -->
		{#if currentStep === 'template-select'}
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Select Report Template</h2>
				<p class="text-gray-600 mb-6">Choose a template to generate a professional report. Templates are pre-formatted with all necessary sections and styling.</p>
				
				<div class="grid gap-4 md:grid-cols-2">
					{#each availableTemplates as template}
						<button
							on:click={() => selectTemplate(template)}
							class="flex flex-col items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
						>
							<div class="flex items-center gap-3 mb-2">
								<span class="text-2xl">{template.thumbnail || '📄'}</span>
								<div>
									<div class="font-medium text-gray-900">{template.name}</div>
									<div class="text-sm text-gray-500">{template.description}</div>
								</div>
							</div>
							<div class="text-xs text-gray-400 mt-2">Click to select</div>
						</button>
					{/each}
				</div>

				{#if selectedProject}
					<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<h3 class="font-medium text-blue-800 mb-2">Project Context</h3>
						<p class="text-blue-700 text-sm">
							Generating report for: <strong>{selectedProject.name}</strong><br>
							{trees.length} trees, {notes.length} notes, {tasks.length} tasks available
						</p>
					</div>
				{:else}
					<div class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
						<h3 class="font-medium text-gray-800 mb-2">No Project Selected</h3>
						<p class="text-gray-700 text-sm">
							Creating a generic report. You can attach this to a project later.
						</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Step 3: AI-Guided Flow -->
		{#if currentStep === 'ai-guided' && selectedTemplate}
			<ReportWizard
				selectedTemplate={selectedTemplate}
				selectedProject={selectedProject}
				trees={trees}
				notes={notes}
				tasks={tasks}
				missingData={missingData}
				showMissingDataWarning={showMissingDataWarning}
				aiFlowStep={aiFlowStep}
				pullProjectData={pullProjectData}
				gapFillQuestions={gapFillQuestions}
				currentGapIndex={currentGapIndex}
				followUpQuestions={followUpQuestions}
				reportMode={reportMode}
				additionalNotes={additionalNotes}
				generating={generating}
				on:goBack={goBack}
				on:continueAIFlow={continueAIFlow}
				on:generateReport={generateReport}
				on:suggestClientNameForGap={suggestClientNameForGap}
				on:suggestSiteAddressForGap={suggestSiteAddressForGap}
				on:cleanAnswerWithAI={cleanAnswerWithAI}
				on:generateFollowUpForGap={generateFollowUpForGap}
			/>
		{/if}

		<!-- Step 4: Generated Report -->
		{#if currentStep === 'generate' && generatedReport}
			<ReportPreview
				selectedTemplate={selectedTemplate}
				selectedProject={selectedProject}
				generatedReport={generatedReport}
				safeGeneratedReport={safeGeneratedReport}
				copyToClipboard={copyToClipboard}
				downloadAsHtml={downloadAsHtml}
				downloadAsPdf={downloadAsPdf}
				downloadAsWord={downloadAsWord}
				downloadAsPlainText={downloadAsPlainText}
				startOver={startOver}
			/>
		{/if}

		<!-- Step 5: Edit Mode -->
		{#if currentStep === 'edit' && generatedReport}
			<ReportEditor
				bind:generatedReport
				selectedTemplate={selectedTemplate}
				selectedProject={selectedProject}
				enterSectionEditMode={enterSectionEditMode}
				copyToClipboard={copyToClipboard}
				downloadAsHtml={downloadAsHtml}
				startOver={startOver}
			/>
		{/if}
		
		<!-- Step 6: Section-by-Section Edit Mode -->
		{#if currentStep === 'edit-sections' && sections.length > 0}
			<SectionEditor
				bind:sections
				bind:currentSectionIndex
				safeSectionContent={safeSectionContent}
				previousSection={previousSection}
				nextSection={nextSection}
				updateCurrentSection={updateCurrentSection}
				saveAndExitSectionEdit={saveAndExitSectionEdit}
				cancelSectionEdit={() => {
					editMode = 'full';
					currentStep = 'edit';
				}}
			/>
		{/if}
	{/if}
</div>

<style>
	.card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
	}
	
	.btn-primary {
		background-color: #059669;
		color: white;
	}
	
	.btn-primary:hover {
		background-color: #047857;
	}
	
	.btn-primary:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
	
	.btn-secondary {
		background-color: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.btn-secondary:hover {
		background-color: #f9fafb;
	}
	
	.input {
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		width: 100%;
	}
	
	.input:focus {
		outline: none;
		box-shadow: 0 0 0 2px #059669;
		border-color: #059669;
	}
</style>
