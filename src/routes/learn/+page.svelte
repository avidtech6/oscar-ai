<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { settings } from '$lib/stores/settings';
	import { extractTextFromPDF, isValidPDFFile } from '$lib/services/pdfExtractor';
	import { extractStyleFromDocx, isValidDocxFile, type VisualStyle } from '$lib/services/docxExtractor';

	interface StyleProfile {
		id?: string;
		name: string;
		tone: string;
		structure: string;
		formattingRules: string;
		vocabulary: string;
		typicalPhrases: string;
		sectionOrder: string;
		recommendationsStyle: string;
		defectsStyle: string;
		disclaimers: string;
		examples: string;
		visualStyle?: VisualStyle;
		createdAt: string;
	}

	let styleProfiles: StyleProfile[] = [];
	let loading = true;
	let analyzing = false;
	let error = '';
	let success = '';
	let processingFile = false;
	let fileError = '';
	let extractedVisualStyle: VisualStyle | null = null;

	let newProfile = {
		name: '',
		samples: '',
		tone: '',
		structure: '',
		formattingRules: '',
		vocabulary: '',
		typicalPhrases: '',
		sectionOrder: '',
		recommendationsStyle: '',
		defectsStyle: '',
		disclaimers: '',
		examples: ''
	};

	let selectedProfile: StyleProfile | null = null;
	const STORAGE_KEY = 'oscar_style_profiles';

	onMount(() => {
		loadProfiles();
	});

	function loadProfiles() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				styleProfiles = JSON.parse(stored);
			}
		} catch (e) {
			console.error('Failed to load style profiles:', e);
		} finally {
			loading = false;
		}
	}

	function saveProfiles() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(styleProfiles));
	}

	async function analyzeStyle() {
		if (!newProfile.samples.trim() || !newProfile.name.trim()) {
			error = 'Please provide a name and at least one sample text';
			return;
		}

		const currentSettings = get(settings);
		if (!currentSettings.groqApiKey) {
			error = 'Please configure your Groq API key in Settings first.';
			return;
		}

		analyzing = true;
		error = '';
		success = '';

		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${currentSettings.groqApiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: `You are an expert at analyzing writing styles. Analyze the provided text samples and extract the following style characteristics. Return your analysis in a structured format.

Analyze these aspects:
1. TONE: What is the overall tone? (formal, technical, conversational, etc.)
2. STRUCTURE: How is the content organized? (headings, paragraphs, bullet points, etc.)
3. FORMATTING RULES: What formatting conventions are used?
4. VOCABULARY: What kind of vocabulary is used? Any technical terms?
5. TYPICAL PHRASES: What phrases or expressions are commonly used?
6. SECTION ORDER: How are sections typically ordered in reports?
7. RECOMMENDATIONS STYLE: How are recommendations presented?
8. DEFECTS STYLE: How are defects/issues described?
9. DISCLAIMERS: What disclaimers or caveats are typically included?

Return your analysis in a clear, structured format.`
						},
						{
							role: 'user',
							content: `Analyze this writing sample(s) and extract the style characteristics:\n\n${newProfile.samples}`
						}
					],
					temperature: 0.5,
					max_tokens: 2048
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error?.message || 'Failed to analyze style');
			}

			const data = await response.json();
			const analysis = data.choices[0].message.content;
			parseAnalysis(analysis);
			success = 'Style analysis complete! Review and save the profile.';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to analyze style';
			console.error(e);
		} finally {
			analyzing = false;
		}
	}

	function parseAnalysis(analysis: string) {
		const lines = analysis.split('\n');
		let currentSection = '';

		for (const line of lines) {
			const lowerLine = line.toLowerCase();
			if (lowerLine.includes('tone:') || lowerLine.includes('1. tone')) {
				currentSection = 'tone';
				newProfile.tone = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('structure:') || lowerLine.includes('2. structure')) {
				currentSection = 'structure';
				newProfile.structure = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('formatting:') || lowerLine.includes('3. formatting')) {
				currentSection = 'formattingRules';
				newProfile.formattingRules = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('vocabulary:') || lowerLine.includes('4. vocabulary')) {
				currentSection = 'vocabulary';
				newProfile.vocabulary = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('phrases:') || lowerLine.includes('5. phrases')) {
				currentSection = 'typicalPhrases';
				newProfile.typicalPhrases = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('section') && lowerLine.includes('order')) {
				currentSection = 'sectionOrder';
				newProfile.sectionOrder = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('recommendation')) {
				currentSection = 'recommendationsStyle';
				newProfile.recommendationsStyle = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('defect')) {
				currentSection = 'defectsStyle';
				newProfile.defectsStyle = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (lowerLine.includes('disclaimer')) {
				currentSection = 'disclaimers';
				newProfile.disclaimers = line.replace(/^[^:]+:\s*/i, '').trim();
			} else if (currentSection && line.trim() && !line.match(/^[0-9]+\./)) {
				switch (currentSection) {
					case 'tone': newProfile.tone += ' ' + line.trim(); break;
					case 'structure': newProfile.structure += ' ' + line.trim(); break;
					case 'formattingRules': newProfile.formattingRules += ' ' + line.trim(); break;
					case 'vocabulary': newProfile.vocabulary += ' ' + line.trim(); break;
					case 'typicalPhrases': newProfile.typicalPhrases += ' ' + line.trim(); break;
					case 'sectionOrder': newProfile.sectionOrder += ' ' + line.trim(); break;
					case 'recommendationsStyle': newProfile.recommendationsStyle += ' ' + line.trim(); break;
					case 'defectsStyle': newProfile.defectsStyle += ' ' + line.trim(); break;
					case 'disclaimers': newProfile.disclaimers += ' ' + line.trim(); break;
				}
			}
		}
		newProfile.examples = newProfile.samples;
	}

	function saveProfile() {
		if (!newProfile.name.trim()) {
			error = 'Please provide a name for this style profile';
			return;
		}

		const profile: StyleProfile = {
			id: crypto.randomUUID(),
			name: newProfile.name.trim(),
			tone: newProfile.tone,
			structure: newProfile.structure,
			formattingRules: newProfile.formattingRules,
			vocabulary: newProfile.vocabulary,
			typicalPhrases: newProfile.typicalPhrases,
			sectionOrder: newProfile.sectionOrder,
			recommendationsStyle: newProfile.recommendationsStyle,
			defectsStyle: newProfile.defectsStyle,
			disclaimers: newProfile.disclaimers,
			examples: newProfile.examples,
			visualStyle: extractedVisualStyle || undefined,
			createdAt: new Date().toISOString()
		};

		styleProfiles = [...styleProfiles, profile];
		saveProfiles();

		newProfile = {
			name: '',
			samples: '',
			tone: '',
			structure: '',
			formattingRules: '',
			vocabulary: '',
			typicalPhrases: '',
			sectionOrder: '',
			recommendationsStyle: '',
			defectsStyle: '',
			disclaimers: '',
			examples: ''
		};
		extractedVisualStyle = null;
		success = 'Style profile saved successfully!';
		error = '';
	}

	function deleteProfile(id: string) {
		if (!confirm('Are you sure you want to delete this style profile?')) return;
		styleProfiles = styleProfiles.filter(p => p.id !== id);
		saveProfiles();
		selectedProfile = null;
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;
		
		const file = files[0];
		const isPdf = isValidPDFFile(file);
		const isDocx = isValidDocxFile(file);
		
		if (!isPdf && !isDocx) {
			fileError = 'Please select a valid PDF or Word (.docx) file';
			return;
		}
		
		processingFile = true;
		fileError = '';
		extractedVisualStyle = null;
		
		try {
			if (isDocx) {
				const result = await extractStyleFromDocx(file);
				if (newProfile.samples) {
					newProfile.samples += '\n\n--- Document Content ---\n\n' + result.textContent;
				} else {
					newProfile.samples = result.textContent;
				}
				extractedVisualStyle = result.visualStyle;
				
				let styleInfo = 'Word document processed successfully';
				if (result.visualStyle) {
					styleInfo += '. Visual style detected: ' + result.visualStyle.fonts.header + ' font, ' + result.visualStyle.layout.orientation + ' orientation';
				}
				success = styleInfo;
			} else {
				const extractedText = await extractTextFromPDF(file);
				if (newProfile.samples) {
					newProfile.samples += '\n\n--- PDF Content ---\n\n' + extractedText;
				} else {
					newProfile.samples = extractedText;
				}
				success = 'PDF content extracted successfully';
			}
		} catch (error) {
			fileError = error instanceof Error ? error.message : 'Failed to extract content';
		} finally {
			processingFile = false;
			input.value = '';
		}
	}

	function selectProfile(profile: StyleProfile) {
		selectedProfile = profile;
	}

	function getSystemPrompt(profile: StyleProfile): string {
		return 'You are writing in the style of ' + profile.name + '.\n\nTONE: ' + profile.tone + '\nSTRUCTURE: ' + profile.structure + '\nFORMATTING: ' + profile.formattingRules + '\nVOCABULARY: ' + profile.vocabulary + '\nTYPICAL PHRASES: ' + profile.typicalPhrases + '\nSECTION ORDER: ' + profile.sectionOrder + '\nRECOMMENDATIONS STYLE: ' + profile.recommendationsStyle + '\nDEFECTS STYLE: ' + profile.defectsStyle + '\nDISCLAIMERS: ' + profile.disclaimers + '\n\nFollow this style consistently in all your outputs.';
	}

	function formatMargins(layout: any): string {
		if (!layout || !layout.margins) return '1in';
		return layout.margins.top + 'in / ' + layout.margins.bottom + 'in';
	}
</script>

<svelte:head>
	<title>Learn My Style - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Learn My Style</h1>
		<p class="text-gray-600">Train Oscar AI to write in your unique style based on your previous reports and documents.</p>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
			{success}
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Create New Profile -->
		<div class="card p-6">
			<h2 class="text-lg font-semibold mb-4">Create New Style Profile</h2>
			
			<div class="space-y-4">
				<div>
					<label for="profileName" class="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
					<input id="profileName" type="text" bind:value={newProfile.name} placeholder="e.g., My BS5837 Reports" class="input w-full" />
				</div>

				<div>
					<label for="samples" class="block text-sm font-medium text-gray-700 mb-1">Writing Samples</label>
					<textarea id="samples" bind:value={newProfile.samples} placeholder="Paste examples of your previous reports..." rows="8" class="input w-full"></textarea>
				</div>

				<div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
					<label for="fileUpload" class="block text-sm font-medium text-gray-700 mb-2">Or Import from Document</label>
					<input 
						id="fileUpload"
						type="file" 
						accept=".pdf,.docx" 
						on:change={handleFileUpload} 
						disabled={processingFile} 
						class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100 disabled:opacity-50" 
					/>
					<p class="text-xs text-gray-500 mt-1">Upload PDF or Word (.docx) documents</p>
					{#if processingFile}
						<p class="text-sm text-forest-600 mt-2">Processing document...</p>
					{/if}
					{#if fileError}
						<p class="text-sm text-red-600 mt-2">{fileError}</p>
					{/if}
				</div>

				{#if extractedVisualStyle}
					<div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<h4 class="font-medium text-blue-900 mb-2">Visual Style Detected</h4>
						<div class="grid grid-cols-2 gap-2 text-sm">
							<div>Header Font: <span class="font-medium">{extractedVisualStyle.fonts.header}</span></div>
							<div>Body Font: <span class="font-medium">{extractedVisualStyle.fonts.body}</span></div>
							<div>Orientation: <span class="font-medium">{extractedVisualStyle.layout.orientation}</span></div>
							<div>Margins: <span class="font-medium">{extractedVisualStyle.layout.margins.top} inches</span></div>
							<div>Header: <span class="font-medium">{extractedVisualStyle.layout.hasHeader ? 'Yes' : 'No'}</span></div>
							<div>Footer: <span class="font-medium">{extractedVisualStyle.layout.hasFooter ? 'Yes' : 'No'}</span></div>
						</div>
					</div>
				{/if}

				<button on:click={analyzeStyle} disabled={analyzing || !newProfile.name.trim() || !newProfile.samples.trim()} class="btn btn-primary w-full">
					{analyzing ? 'Analyzing Style...' : 'Analyze Style with AI'}
				</button>
			</div>

			{#if success || newProfile.tone}
				<hr class="my-6" />
				<h3 class="font-semibold mb-4">Style Analysis Results</h3>
				<div class="space-y-4">
					<div>
						<label for="tone" class="block text-sm font-medium text-gray-700 mb-1">Tone</label>
						<textarea id="tone" bind:value={newProfile.tone} rows="2" class="input w-full"></textarea>
					</div>
					<div>
						<label for="structure" class="block text-sm font-medium text-gray-700 mb-1">Structure</label>
						<textarea id="structure" bind:value={newProfile.structure} rows="2" class="input w-full"></textarea>
					</div>
					<div>
						<label for="formatting" class="block text-sm font-medium text-gray-700 mb-1">Formatting Rules</label>
						<textarea id="formatting" bind:value={newProfile.formattingRules} rows="2" class="input w-full"></textarea>
					</div>
					<button on:click={saveProfile} class="btn btn-primary w-full">Save Style Profile</button>
				</div>
			{/if}
		</div>

		<!-- Saved Profiles -->
		<div class="card p-6">
			<h2 class="text-lg font-semibold mb-4">Saved Style Profiles</h2>
			{#if loading}
				<p class="text-gray-500">Loading profiles...</p>
			{:else if styleProfiles.length === 0}
				<p class="text-gray-500">No style profiles yet</p>
			{:else}
				<div class="space-y-3">
					{#each styleProfiles as profile}
						<div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
							<div class="flex items-center justify-between mb-2">
								<h3 class="font-medium text-gray-900">{profile.name}</h3>
								<div class="flex gap-2">
									<button on:click={() => selectProfile(profile)} class="text-sm text-forest-600 hover:underline">View</button>
									<button on:click={() => profile.id && deleteProfile(profile.id)} class="text-sm text-red-600 hover:underline">Delete</button>
								</div>
							</div>
							<div class="flex gap-2">
								{#if profile.visualStyle}
									<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Visual Style</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	{#if selectedProfile}
		<div class="card p-6 mt-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold">{selectedProfile.name} - Details</h2>
				<button on:click={() => selectedProfile = null} class="text-gray-500 hover:text-gray-700">Close</button>
			</div>

			{#if selectedProfile.visualStyle}
				<div class="mb-6 p-4 bg-blue-50 rounded-lg">
					<h3 class="font-medium text-blue-900 mb-3">Visual Style</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>Header Font: <span class="font-medium">{selectedProfile.visualStyle.fonts.header}</span></div>
						<div>Body Font: <span class="font-medium">{selectedProfile.visualStyle.fonts.body}</span></div>
						<div>Orientation: <span class="font-medium">{selectedProfile.visualStyle.layout.orientation}</span></div>
						<div>Margins: <span class="font-medium">{formatMargins(selectedProfile.visualStyle.layout)}</span></div>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<h3 class="font-medium text-gray-700 mb-2">Tone</h3>
					<p class="text-gray-600 text-sm">{selectedProfile.tone || 'Not specified'}</p>
				</div>
				<div>
					<h3 class="font-medium text-gray-700 mb-2">Structure</h3>
					<p class="text-gray-600 text-sm">{selectedProfile.structure || 'Not specified'}</p>
				</div>
			</div>

			<div class="mt-6 p-4 bg-gray-50 rounded-lg">
				<h3 class="font-medium text-gray-700 mb-2">System Prompt</h3>
				<pre class="text-xs text-gray-600 whitespace-pre-wrap">{getSystemPrompt(selectedProfile)}</pre>
			</div>
		</div>
	{/if}
</div>
