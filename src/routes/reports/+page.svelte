<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db, type Project, type Tree, type Note, type Task } from '$lib/db';
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
	import MicButton from '$lib/components/MicButton.svelte';

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
		
		// Check for missing data
		if (selectedProjectId) {
			const data = await prepareTemplateData(selectedProjectId);
			missingData = checkMissingData(data, template.id);
			showMissingDataWarning = missingData.length > 0;
			
			// Generate gap fill questions
			generateGapFillQuestions();
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
		
		if (!selectedProject?.client || selectedProject.client === 'Not specified') {
			gapFillQuestions.push({
				id: crypto.randomUUID(),
				question: 'What is the client name?',
				answer: '',
				field: 'client'
			});
		}
		
		if (!selectedProject?.location || selectedProject.location === 'Not specified') {
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
		if (!selectedTemplate || !selectedProjectId) return;
		
		generating = true;
		error = '';
		generatedReport = '';

		try {
			let htmlContent = '';
			
			if (reportMode === 'template') {
				// Load template HTML
				const templateHtml = await loadTemplateHtml(selectedTemplate.id);
				
				// Prepare data
				const templateData = await prepareTemplateData(selectedProjectId);
				
				// Apply gap fill answers
				const updatedData = applyGapFillAnswers(templateData);
				
				// Render template
				htmlContent = renderTemplate(templateHtml, updatedData);
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
			
			// Save to local storage for later editing
			const report = {
				id: crypto.randomUUID(),
				projectId: selectedProjectId,
				type: selectedTemplate?.id,
				title: `${selectedTemplate?.name} - ${selectedProject?.name}`,
				content: htmlContent,
				generatedAt: new Date().toISOString()
			};
			
			const storedReports = localStorage.getItem('oscar_reports');
			const allReports = storedReports ? JSON.parse(storedReports) : [];
			allReports.push(report);
			localStorage.setItem('oscar_reports', JSON.stringify(allReports));
			
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to generate report';
			console.error(e);
		} finally {
			generating = false;
		}
	}

	function buildContextText(): string {
		let context = 'PROJECT: ' + selectedProject?.name + '\n';
		
		// Apply gap fill answers
		let clientName = selectedProject?.client || 'Not specified';
		let siteAddress = selectedProject?.location || 'Not specified';
		
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
		
		return context;
	}

	function applyGapFillAnswers(data: any): any {
		const updatedData = { ...data };
		
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
		a.download = `${selectedTemplate?.id || 'report'}_${selectedProject?.name || 'report'}_${new Date().toISOString().split('T')[0]}.html`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	
	function downloadAsPdf() {
		if (!generatedReport) return;
		
		// Create a new window with the report content
		const printWindow = window.open('', '_blank');
		if (!printWindow) {
			alert('Please allow popups to generate PDF');
			return;
		}
		
		const title = (selectedTemplate?.name || 'Report') + ' - ' + (selectedProject?.name || '');
		
		// Build HTML using a template literal with proper escaping
		const html = `<!DOCTYPE html>
<html>
<head>
	<title>${title}</title>
	<style>
		@media print {
			body { margin: 0; padding: 0; }
			@page { margin: 20mm; }
			.no-print { display: none !important; }
		}
		.print-button {
			position: fixed;
			top: 20px;
			right: 20px;
			padding: 10px 20px;
			background: #059669;
			color: white;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			z-index: 1000;
		}
	</style>
</head>
<body>
	<button class="print-button no-print" onclick="window.print()">Print to PDF</button>
	<div>${generatedReport}</div>
	<script>
		// Auto-print after a short delay
		setTimeout(() => {
			window.print();
			// Close window after print dialog (with delay)
			setTimeout(() => window.close(), 1000);
		}, 500);
	</script>
</body>
</html>`;
		
		printWindow.document.write(html);
		printWindow.document.close();
	}
	
	function downloadAsWord() {
		if (!generatedReport) return;
		
		// Convert HTML to Word document
		const htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<title>${selectedTemplate?.name || 'Report'} - ${selectedProject?.name || ''}</title>
				<style>
					body { font-family: Arial, sans-serif; margin: 20px; }
					h1, h2, h3 { color: #2e7d32; }
					table { border-collapse: collapse; width: 100%; }
					th, td { border: 1px solid #ddd; padding: 8px; }
					th { background-color: #f5f5f5; }
				</style>
			</head>
			<body>
				${generatedReport}
			</body>
			</html>
		`;
		
		// Create a blob with Word-compatible HTML
		const blob = new Blob([htmlContent], { type: 'application/msword' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${selectedTemplate?.id || 'report'}_${selectedProject?.name || 'report'}_${new Date().toISOString().split('T')[0]}.doc`;
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
		a.download = `${selectedTemplate?.id || 'report'}_${selectedProject?.name || 'report'}_${new Date().toISOString().split('T')[0]}.txt`;
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
			// Prepare project data for AI
			const projectData = await prepareTemplateData(selectedProjectId);
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
			// Prepare project data for AI
			const projectData = await prepareTemplateData(selectedProjectId);
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
</script>

<svelte:head>
	<title>Reports - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<!-- Persistent Project Context Bar -->
	<div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
		<div>
			{#if selectedProject}
				<h2 class="font-medium text-blue-800">Building report for:</h2>
				<p class="text-blue-700 text-lg font-semibold">{selectedProject.name}</p>
				<p class="text-blue-600 text-sm">
					{trees.length} trees, {notes.length} notes, {tasks.length} tasks available
				</p>
			{:else}
				<h2 class="font-medium text-blue-800">Select a project to begin.</h2>
				<p class="text-blue-600 text-sm">
					All reports must be linked to a project.
				</p>
			{/if}
		</div>
		{#if selectedProject}
			<button
				on:click={() => {
					currentStep = 'project-select';
					selectedProject = undefined;
				}}
				class="btn btn-secondary text-sm"
			>
				Change Project
			</button>
		{/if}
	</div>

	<h1 class="text-2xl font-bold text-gray-900 mb-6">HTML Report Builder</h1>

	{#if error && !generatedReport}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500">Loading project data...</p>
		</div>
	{:else}
		<!-- Step 1: Project Selection -->
		{#if currentStep === 'project-select'}
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Select a Project</h2>
				<p class="text-gray-600 mb-6">All reports must be linked to a project. Choose a project to continue.</p>
				
				{#if allProjects.length === 0}
					<div class="text-center py-8">
						<p class="text-gray-500 mb-4">No projects found.</p>
						<a href="/project" class="btn btn-primary">Create a Project</a>
					</div>
				{:else}
					<div class="grid gap-3">
						{#each allProjects as project}
							<button
								on:click={() => selectProject(project.id!)}
								class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-left"
							>
								<div class="flex-1">
									<div class="font-medium text-gray-900">{project.name}</div>
									<div class="text-sm text-gray-500">{project.client || 'No client specified'}</div>
									<div class="text-xs text-gray-400 mt-1">{project.location || 'No location specified'}</div>
								</div>
								<div class="text-blue-600">→</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Step 2: Template Selection -->
		{#if currentStep === 'template-select' && selectedProject}
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

				<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<h3 class="font-medium text-blue-800 mb-2">Project Context</h3>
					<p class="text-blue-700 text-sm">
						Generating report for: <strong>{selectedProject.name}</strong><br>
						{trees.length} trees, {notes.length} notes, {tasks.length} tasks available
					</p>
				</div>
			</div>
		{/if}

		<!-- Step 3: AI-Guided Flow -->
		{#if currentStep === 'ai-guided' && selectedTemplate && selectedProject}
			<div class="card p-6 mb-6">
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-lg font-semibold">AI-Guided Report Assembly</h2>
						<p class="text-gray-600">Template: <strong>{selectedTemplate.name}</strong></p>
					</div>
					<button
						on:click={goBack}
						class="btn btn-secondary"
					>
						← Back
					</button>
				</div>

				<!-- Project Confirmation Step -->
				{#if aiFlowStep === 'project-confirm'}
					<div class="mb-6">
						<h3 class="font-medium mb-3">Confirm Project Context</h3>
						<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
							<p class="text-green-700">
								<strong>✓ Project confirmed:</strong> {selectedProject.name}
							</p>
							<p class="text-green-600 text-sm mt-1">
								Client: {selectedProject.client || 'Not specified'}<br>
								Site: {selectedProject.location || 'Not specified'}
							</p>
						</div>
						<div class="mt-4">
							<button
								on:click={continueAIFlow}
								class="btn btn-primary"
							>
								Continue →
							</button>
						</div>
					</div>
				{/if}

				<!-- Data Pull Step -->
				{#if aiFlowStep === 'data-pull'}
					<div class="mb-6">
						<h3 class="font-medium mb-3">Pull in Project Data</h3>
						<p class="text-gray-600 mb-4">
							Do you want me to pull in all trees, notes, voice memos, and tasks tagged to this project?
						</p>
						
						<div class="grid gap-3 mb-6">
							<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 {pullProjectData ? 'border-forest-500 bg-forest-50' : 'border-gray-200'}">
								<input
									type="radio"
									name="pullData"
									checked={pullProjectData}
									on:change={() => pullProjectData = true}
									class="mt-0"
								/>
								<div>
									<div class="font-medium text-gray-900">Yes, pull in all project data</div>
									<div class="text-sm text-gray-500">
										{trees.length} trees, {notes.length} notes, {tasks.length} tasks will be included
									</div>
								</div>
							</label>
							
							<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 {!pullProjectData ? 'border-forest-500 bg-forest-50' : 'border-gray-200'}">
								<input
									type="radio"
									name="pullData"
									checked={!pullProjectData}
									on:change={() => pullProjectData = false}
									class="mt-0"
								/>
								<div>
									<div class="font-medium text-gray-900">Let me choose what to include</div>
									<div class="text-sm text-gray-500">Select specific items later</div>
								</div>
							</label>
						</div>

						<div class="flex gap-4">
							<button
								on:click={continueAIFlow}
								class="btn btn-primary"
							>
								Continue →
							</button>
							<button
								on:click={goBack}
								class="btn btn-secondary"
							>
								← Back
							</button>
						</div>
					</div>
				{/if}

				<!-- Gap Fill Step -->
				{#if aiFlowStep === 'gap-fill' && gapFillQuestions.length > 0}
					<div class="mb-6">
						<h3 class="font-medium mb-3">Fill Missing Information</h3>
						<p class="text-gray-600 mb-4">
							The following information is missing or incomplete:
						</p>
						
						<div class="mb-6">
							<div class="mb-2">
								<label class="block text-sm font-medium text-gray-700 mb-1">
									{gapFillQuestions[currentGapIndex].question}
								</label>
								<textarea
									bind:value={gapFillQuestions[currentGapIndex].answer}
									rows="3"
									class="input w-full"
									placeholder="Enter your answer..."
								></textarea>
								<div class="mt-2 flex gap-2">
									<MicButton on:transcript={(e) => gapFillQuestions[currentGapIndex].answer += e.detail.text} />
									{#if gapFillQuestions[currentGapIndex].field === 'client'}
										<button
											on:click={suggestClientNameForGap}
											class="btn btn-secondary text-sm flex items-center gap-1"
											type="button"
										>
											<span>🤖</span>
											<span>Suggest with AI</span>
										</button>
										<button
											on:click={cleanAnswerWithAI}
											class="btn btn-secondary text-sm flex items-center gap-1"
											type="button"
										>
											<span>🧹</span>
											<span>Clean with AI</span>
										</button>
									{/if}
									{#if gapFillQuestions[currentGapIndex].field === 'location'}
										<button
											on:click={suggestSiteAddressForGap}
											class="btn btn-secondary text-sm flex items-center gap-1"
											type="button"
										>
											<span>🤖</span>
											<span>Suggest with AI</span>
										</button>
										<button
											on:click={cleanAnswerWithAI}
											class="btn btn-secondary text-sm flex items-center gap-1"
											type="button"
										>
											<span>🧹</span>
											<span>Clean with AI</span>
										</button>
										<button
											on:click={generateFollowUpForGap}
											class="btn btn-secondary text-sm flex items-center gap-1"
											type="button"
										>
											<span>❓</span>
											<span>Ask AI for follow-up questions</span>
										</button>
									{/if}
								</div>
							</div>
							
							{#if gapFillQuestions[currentGapIndex].field === 'location' && followUpQuestions.length > 0}
								<div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
									<h4 class="font-medium text-blue-800 mb-2">AI Follow‑Up Questions</h4>
									<ul class="list-disc pl-5 text-blue-700 text-sm space-y-1">
										{#each followUpQuestions as question}
											<li>{question}</li>
										{/each}
									</ul>
									<p class="text-blue-600 text-xs mt-2">Consider answering these questions to provide more precise location details.</p>
								</div>
							{/if}
							
							<div class="text-sm text-gray-500 mt-2">
								Question {currentGapIndex + 1} of {gapFillQuestions.length}
								{#if gapFillQuestions[currentGapIndex].field === 'client' || gapFillQuestions[currentGapIndex].field === 'location'}
									<span class="ml-2 text-blue-600">• AI suggestion available</span>
								{/if}
							</div>
						</div>

						<div class="flex gap-4">
							<button
								on:click={continueAIFlow}
								class="btn btn-primary"
							>
								{#if currentGapIndex < gapFillQuestions.length - 1}
									Next Question →
								{:else}
									Review Report
								{/if}
							</button>
							{#if currentGapIndex > 0}
								<button
									on:click={() => currentGapIndex--}
									class="btn btn-secondary"
								>
									← Previous
								</button>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Review Step -->
				{#if aiFlowStep === 'review'}
					<div class="mb-6">
						<h3 class="font-medium mb-3">Review and Generate</h3>
						
						{#if showMissingDataWarning}
							<div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<h3 class="font-medium text-yellow-800 mb-2">⚠️ Missing Data Detected</h3>
								<p class="text-yellow-700 text-sm mb-2">The following data is missing or incomplete:</p>
								<ul class="list-disc pl-5 text-yellow-700 text-sm">
									{#each missingData as item}
										<li>{item}</li>
									{/each}
								</ul>
								<p class="text-yellow-700 text-sm mt-2">You can still generate the report, but these sections may be incomplete.</p>
							</div>
						{/if}

						<div class="mb-6">
							<h3 class="font-medium mb-3">Generation Method</h3>
							<div class="flex gap-4">
								<label class="flex items-center gap-2">
									<input
										type="radio"
										name="generationMethod"
										value="template"
										bind:group={reportMode}
										checked
									/>
									<span>Template-based (Fast, structured)</span>
								</label>
								<label class="flex items-center gap-2">
									<input
										type="radio"
										name="generationMethod"
										value="ai"
										bind:group={reportMode}
									/>
									<span>AI-generated (Flexible, creative)</span>
								</label>
							</div>
						</div>

						{#if reportMode === 'ai'}
							<div class="mb-6">
								<h3 class="font-medium mb-3">Additional Notes (Optional)</h3>
								<textarea
									bind:value={additionalNotes}
									placeholder="Any specific requirements or additional information for the AI..."
									rows="4"
									class="input w-full"
								></textarea>
								<div class="mt-2">
									<MicButton on:transcript={(e) => additionalNotes += e.detail.text} />
								</div>
							</div>
						{/if}

						<div class="flex gap-4">
							<button
								on:click={continueAIFlow}
								disabled={generating}
								class="btn btn-primary flex-1"
							>
								{generating ? 'Generating...' : `Generate ${selectedTemplate.name}`}
							</button>
							<button
								on:click={goBack}
								class="btn btn-secondary"
							>
								← Back
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Step 4: Generated Report -->
		{#if currentStep === 'generate' && generatedReport}
			<div class="card">
				<div class="p-4 border-b border-gray-200 flex items-center justify-between">
					<div>
						<h2 class="text-lg font-semibold">Generated Report</h2>
						<p class="text-sm text-gray-500">{selectedTemplate?.name} - {selectedProject?.name}</p>
					</div>
					<div class="flex gap-2">
						<button
							on:click={copyToClipboard}
							class="btn btn-secondary text-sm"
						>
							Copy HTML
						</button>
						<button
							on:click={downloadAsHtml}
							class="btn btn-primary text-sm"
						>
							HTML
						</button>
						<button
							on:click={downloadAsPdf}
							class="btn btn-primary text-sm"
						>
							PDF
						</button>
						<button
							on:click={downloadAsWord}
							class="btn btn-primary text-sm"
						>
							Word
						</button>
						<button
							on:click={downloadAsPlainText}
							class="btn btn-secondary text-sm"
						>
							TXT
						</button>
						<button
							on:click={startOver}
							class="btn btn-secondary text-sm"
						>
							New Report
						</button>
					</div>
				</div>
				
				<div class="p-6">
					<div class="mb-4 text-sm text-gray-600">
						Report generated successfully. Export in multiple formats:
					</div>
					
					<!-- Export Options -->
					<div class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
						<button
							on:click={downloadAsHtml}
							class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div class="text-2xl mb-2">📄</div>
							<div class="font-medium">HTML</div>
							<div class="text-xs text-gray-500">Web format</div>
						</button>
						<button
							on:click={downloadAsPdf}
							class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div class="text-2xl mb-2">📊</div>
							<div class="font-medium">PDF</div>
							<div class="text-xs text-gray-500">Print-ready</div>
						</button>
						<button
							on:click={downloadAsWord}
							class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div class="text-2xl mb-2">📝</div>
							<div class="font-medium">Word</div>
							<div class="text-xs text-gray-500">Editable</div>
						</button>
						<button
							on:click={downloadAsPlainText}
							class="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div class="text-2xl mb-2">📃</div>
							<div class="font-medium">Plain Text</div>
							<div class="text-xs text-gray-500">Simple format</div>
						</button>
					</div>
					
					<!-- Report Preview -->
					<div class="border rounded-lg overflow-hidden">
						<div class="bg-gray-100 px-4 py-2 border-b text-sm font-medium">
							Report Preview
						</div>
						<div class="p-4 max-h-[600px] overflow-auto">
							{#if generatedReport.includes('<!DOCTYPE html>') || generatedReport.includes('<html>')}
								<iframe
									srcdoc={generatedReport}
									class="w-full h-[500px] border-0"
									title="Report Preview"
								></iframe>
							{:else}
								<pre class="whitespace-pre-wrap font-sans text-sm text-gray-700">{generatedReport}</pre>
							{/if}
						</div>
					</div>
					
					<div class="mt-6 text-sm text-gray-500">
						<strong>Note:</strong> HTML format is best for web viewing, PDF for printing, Word for editing, and plain text for simple sharing.
					</div>
				</div>
			</div>
		{/if}

		<!-- Step 5: Edit Mode -->
		{#if currentStep === 'edit' && generatedReport}
			<div class="card">
				<div class="p-4 border-b border-gray-200 flex items-center justify-between">
					<h2 class="text-lg font-semibold">Edit Report</h2>
					<div class="flex gap-2">
						<button
							on:click={enterSectionEditMode}
							class="btn btn-secondary text-sm"
						>
							Edit by Sections
						</button>
						<button
							on:click={copyToClipboard}
							class="btn btn-secondary text-sm"
						>
							Copy HTML
						</button>
						<button
							on:click={downloadAsHtml}
							class="btn btn-primary text-sm"
						>
							Download HTML
						</button>
						<button
							on:click={startOver}
							class="btn btn-secondary text-sm"
						>
							New Report
						</button>
					</div>
				</div>
				
				<div class="p-6">
					<div class="mb-4">
						<textarea
							bind:value={generatedReport}
							rows="20"
							class="input w-full font-mono text-sm"
							placeholder="Edit your report HTML here..."
						></textarea>
					</div>
					
					<div class="flex gap-4">
						<button
							on:click={downloadAsHtml}
							class="btn btn-primary"
						>
							Save & Download
						</button>
						<button
							on:click={startOver}
							class="btn btn-secondary"
						>
							Discard Changes
						</button>
					</div>
				</div>
			</div>
		{/if}
		
		<!-- Step 6: Section-by-Section Edit Mode -->
		{#if currentStep === 'edit-sections' && sections.length > 0}
			<div class="card">
				<div class="p-4 border-b border-gray-200 flex items-center justify-between">
					<div>
						<h2 class="text-lg font-semibold">Edit Report Sections</h2>
						<p class="text-sm text-gray-500">
							Section {currentSectionIndex + 1} of {sections.length}: {sections[currentSectionIndex].title}
						</p>
					</div>
					<div class="flex gap-2">
						<button
							on:click={saveAndExitSectionEdit}
							class="btn btn-primary text-sm"
						>
							Save & Exit
						</button>
						<button
							on:click={() => {
								editMode = 'full';
								currentStep = 'edit';
							}}
							class="btn btn-secondary text-sm"
						>
							Cancel
						</button>
					</div>
				</div>
				
				<div class="p-6">
					<!-- Section Navigation -->
					<div class="mb-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="font-medium">Sections</h3>
							<div class="flex gap-2">
								<button
									on:click={previousSection}
									disabled={currentSectionIndex === 0}
									class="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									← Previous
								</button>
								<button
									on:click={nextSection}
									disabled={currentSectionIndex === sections.length - 1}
									class="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next →
								</button>
							</div>
						</div>
						
						<div class="flex flex-wrap gap-2">
							{#each sections as section, index}
								<button
									on:click={() => currentSectionIndex = index}
									class="px-3 py-2 text-sm border rounded-lg transition-colors {currentSectionIndex === index ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}"
								>
									{section.title}
								</button>
							{/each}
						</div>
					</div>
					
					<!-- Section Editor -->
					<div class="mb-6">
						<h3 class="font-medium mb-3">Editing: {sections[currentSectionIndex].title}</h3>
						<textarea
							bind:value={sections[currentSectionIndex].content}
							rows="15"
							class="input w-full font-mono text-sm"
							placeholder="Edit section content..."
						></textarea>
						<div class="mt-2 text-sm text-gray-500">
							This section contains HTML. You can edit the content directly.
						</div>
					</div>
					
					<!-- Section Preview -->
					<div class="mb-6">
						<h3 class="font-medium mb-3">Section Preview</h3>
						<div class="border rounded-lg p-4 bg-gray-50 max-h-[300px] overflow-auto">
							<div class="section-title font-medium text-lg mb-3">{sections[currentSectionIndex].title}</div>
							<div class="prose max-w-none" innerHTML={sections[currentSectionIndex].content}></div>
						</div>
					</div>
					
					<div class="flex gap-4">
						<button
							on:click={updateCurrentSection}
							class="btn btn-primary"
						>
							Save Section
						</button>
						<button
							on:click={nextSection}
							disabled={currentSectionIndex === sections.length - 1}
							class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next Section →
						</button>
					</div>
				</div>
			</div>
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
		ring: 2px;
		ring-color: #059669;
		border-color: #059669;
	}
</style>
