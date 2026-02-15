<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db } from '$lib/db';
	import { groqApiKey } from '$lib/stores/settings';
	import type { Project, Tree, Note } from '$lib/db';
	import MicButton from '$lib/components/MicButton.svelte';

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	let projectId = '';
	let project: Project | undefined;
	let trees: Tree[] = [];
	let notes: Note[] = [];
	let selectedReportType = '';
	let generatedReport = '';
	let generating = false;
	let error = '';
	let contextText = '';
	let additionalNotes = '';
	let loading = true;

	const reportTypes = [
		{ value: 'BS5837', label: 'BS5837:2012 Tree Survey', description: 'Complete tree constraints survey with category assessment' },
		{ value: 'AIA', label: 'Arboricultural Impact Assessment', description: 'Assessment of development impacts on trees' },
		{ value: 'AMS', label: 'Arboricultural Method Statement', description: 'Detailed tree protection methodology' },
		{ value: 'TREE_CONDITION', label: 'Tree Condition Report', description: 'Visual Tree Assessment (VTA) report' }
	];

	onMount(async () => {
		// Get project ID and report ID from URL
		const urlParams = new URLSearchParams($page.url.search);
		projectId = urlParams.get('project') || '';
		const reportId = urlParams.get('report');
		const mode = urlParams.get('mode');
		
		if (projectId) {
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
					selectedReportType = report.type?.toUpperCase() || 'BS5837';
				}
			}
		}
	});

	async function loadProjectContext() {
		try {
			// Load project
			project = await db.projects.get(projectId);
			if (!project) {
				error = 'Project not found';
				loading = false;
				return;
			}

			// Load trees
			trees = await db.trees.where('projectId').equals(projectId).toArray();

			// Load notes
			notes = await db.notes.where('projectId').equals(projectId).toArray();

			// Build context text
			let context = 'PROJECT: ' + project.name + '\n';
			if (project.clientName) context += 'Client: ' + project.clientName + '\n';
			if (project.siteAddress) context += 'Site: ' + project.siteAddress + '\n\n';
			
			context += 'TREES:\n';
			if (trees.length > 0) {
				trees.forEach(tree => {
					context += `- ${tree.number}: ${tree.species} (${tree.scientificName || 'N/A'})\n`;
					context += `  DBH: ${tree.DBH}mm, Height: ${tree.height || 'N/A'}m\n`;
					context += `  Category: ${tree.category || 'Not assessed'}, Condition: ${tree.condition || 'N/A'}\n`;
					if (tree.notes) context += `  Notes: ${tree.notes}\n`;
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
			
			contextText = context;
		} catch (e) {
			error = 'Failed to load project';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function generateReport() {
		if (!selectedReportType) return;
		
		if (!apiKey) {
			error = 'Please configure your Groq API key in Settings first.';
			return;
		}

		generating = true;
		error = '';
		generatedReport = '';

		try {
			let systemPrompt = '';
			let userPrompt = '';

			switch (selectedReportType) {
				case 'BS5837':
					systemPrompt = 'You are an expert arboricultural consultant. Generate a professional BS5837:2012 tree survey report.';
					userPrompt = `Generate a BS5837:2012 tree survey report based on the following data:\n\n${contextText}\n\nAdditional notes: ${additionalNotes || 'None'}`;
					break;
				case 'AIA':
					systemPrompt = 'You are an expert arboricultural consultant. Generate a professional Arboricultural Impact Assessment.';
					userPrompt = `Generate an Arboricultural Impact Assessment based on the following data:\n\n${contextText}\n\nAdditional notes: ${additionalNotes || 'None'}`;
					break;
				case 'AMS':
					systemPrompt = 'You are an expert arboricultural consultant. Generate a professional Arboricultural Method Statement.';
					userPrompt = `Generate an Arboricultural Method Statement based on the following data:\n\n${contextText}\n\nAdditional notes: ${additionalNotes || 'None'}`;
					break;
				case 'TREE_CONDITION':
					systemPrompt = 'You are an expert arboricultural consultant. Generate a professional Tree Condition Report.';
					userPrompt = `Generate a Tree Condition Report (Visual Tree Assessment) based on the following data:\n\n${contextText}\n\nAdditional notes: ${additionalNotes || 'None'}`;
					break;
			}

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
					max_tokens: 2048
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error?.message || 'Failed to generate report');
			}

			const data = await response.json();
			generatedReport = data.choices[0].message.content;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to generate report';
			console.error(e);
		} finally {
			generating = false;
		}
	}

	function copyToClipboard() {
		if (generatedReport) {
			navigator.clipboard.writeText(generatedReport);
			alert('Report copied to clipboard!');
		}
	}
</script>

<svelte:head>
	<title>Reports - Oscar AI</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Generate Reports</h1>

	{#if error && !generatedReport}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500">Loading...</p>
		</div>
	{:else}
		<!-- Report Type Selection -->
		<div class="card p-6 mb-6">
			<h2 class="text-lg font-semibold mb-4">Select Report Type</h2>
			<div class="grid gap-3">
				{#each reportTypes as type}
					<label class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors {selectedReportType === type.value ? 'border-forest-500 bg-forest-50' : 'border-gray-200'}">
						<input
							type="radio"
							name="reportType"
							value={type.value}
							bind:group={selectedReportType}
							class="mt-1"
						/>
						<div>
							<div class="font-medium text-gray-900">{type.label}</div>
							<div class="text-sm text-gray-500">{type.description}</div>
						</div>
					</label>
				{/each}
			</div>
		</div>

		<!-- Additional Notes -->
		<div class="card p-6 mb-6">
			<h2 class="text-lg font-semibold mb-4">Additional Notes (Optional)</h2>
			<textarea
				bind:value={additionalNotes}
				placeholder="Any specific requirements or additional information..."
				rows="4"
				class="input w-full"
			></textarea>
			<div class="mt-2">
				<MicButton on:transcript={(e) => additionalNotes += e.detail.text} />
			</div>
		</div>

		<!-- Generate Button -->
		<div class="mb-6">
			<button
				on:click={generateReport}
				disabled={!selectedReportType || generating}
				class="btn btn-primary w-full"
			>
				{generating ? 'Generating Report...' : 'Generate Report'}
			</button>
		</div>

		<!-- Generated Report -->
		{#if generatedReport}
			<div class="card">
				<div class="p-4 border-b border-gray-200 flex items-center justify-between">
					<h2 class="text-lg font-semibold">Generated Report</h2>
					<button
						on:click={copyToClipboard}
						class="btn btn-secondary text-sm"
					>
						Copy to Clipboard
					</button>
				</div>
				<div class="p-6">
					<pre class="whitespace-pre-wrap font-sans text-sm text-gray-700">{generatedReport}</pre>
				</div>
			</div>
		{/if}
	{/if}
</div>
