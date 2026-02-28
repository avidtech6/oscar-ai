<script lang="ts">
	import MicButton from '$lib/components/MicButton.svelte';
	import { suggestClientName, suggestSiteAddress, parseUserAnswer, generateFollowUpQuestions } from '$lib/services/aiActions';
	import { analyzeReportStyle, getStyleGuide } from '$lib/services/styleLearnerService';
	
	export let selectedTemplate: any;
	export let selectedProject: any;
	export let trees: any[] = [];
	export let notes: any[] = [];
	export let tasks: any[] = [];
	export let missingData: string[] = [];
	export let showMissingDataWarning = false;
	export let gapFillQuestions: Array<{id: string; question: string; answer: string; field: string}> = [];
	export let currentGapIndex = 0;
	export let followUpQuestions: string[] = [];
	export let aiFlowStep: 'project-confirm' | 'data-pull' | 'gap-fill' | 'review' = 'project-confirm';
	export let pullProjectData = false;
	export let reportMode: 'template' | 'ai' = 'template';
	export let additionalNotes = '';
	export let generating = false;
	export let apiKey = '';
	
	export let goBack: () => void;
	export let continueAIFlow: () => void;
	export let generateReport: () => Promise<void>;
	export let suggestClientNameForGap: () => Promise<void>;
	export let suggestSiteAddressForGap: () => Promise<void>;
	export let cleanAnswerWithAI: () => Promise<void>;
	export let generateFollowUpForGap: () => Promise<void>;
	
	// Local bindings
	$: localGapFillQuestions = gapFillQuestions;
	$: localCurrentGapIndex = currentGapIndex;
	$: localFollowUpQuestions = followUpQuestions;
	$: localPullProjectData = pullProjectData;
	$: localReportMode = reportMode;
	$: localAdditionalNotes = additionalNotes;
	
	// Style analysis state
	let styleAnalyzing = false;
	let styleAnalysisResult: any = null;
	let showStyleAnalysis = false;
	let styleGuide: any = null;
	
	function handleGapAnswerChange(index: number, value: string) {
		if (localGapFillQuestions[index]) {
			localGapFillQuestions[index].answer = value;
			gapFillQuestions = [...localGapFillQuestions];
		}
	}
	
	function handleGapIndexChange(index: number) {
		currentGapIndex = index;
	}
	
	async function analyzeReportStyleAction() {
		styleAnalyzing = true;
		styleAnalysisResult = null;
		showStyleAnalysis = false;
		
		try {
			// For demo, we'll analyze a sample report text
			const sampleReport = `This is a sample report for style analysis. It demonstrates the typical structure and tone used in ${selectedTemplate?.name || 'arboricultural'} reports.`;
			
			const result = await analyzeReportStyle(sampleReport, selectedTemplate?.id);
			
			if (result.success) {
				styleAnalysisResult = result.data;
				showStyleAnalysis = true;
			} else {
				console.error('Style analysis failed:', result.error);
				alert('Style analysis failed. Please try again.');
			}
		} catch (error) {
			console.error('Style analysis error:', error);
			alert('Error during style analysis.');
		} finally {
			styleAnalyzing = false;
		}
	}
	
	async function loadStyleGuide() {
		try {
			const result = await getStyleGuide(selectedTemplate?.id);
			
			if (result.success) {
				styleGuide = result.data?.guide || result.data;
			} else {
				// Create a mock guide
				styleGuide = {
					tone: 'Professional and authoritative',
					structure: 'Introduction → Methodology → Findings → Recommendations → Conclusion',
					phrasing: 'Use formal language, avoid contractions',
					formatting: 'Use headings, bullet points for lists, tables for data',
					examples: [
						'It is recommended that the tree be monitored annually.',
						'The assessment indicates moderate risk of failure.',
						'In accordance with BS5837:2012, a root protection area should be established.',
					],
				};
			}
		} catch (error) {
			console.error('Failed to load style guide:', error);
			styleGuide = null;
		}
	}
	
	// Load style guide when component mounts or template changes
	$: if (selectedTemplate && !styleGuide) {
		loadStyleGuide();
	}
</script>

<div class="card p-6 mb-6">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-lg font-semibold">AI-Guided Report Assembly</h2>
			<p class="text-gray-600">Template: <strong>{selectedTemplate?.name}</strong></p>
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
			<h3 class="font-medium mb-3">Confirm Report Context</h3>
			{#if selectedProject}
				<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
					<p class="text-green-700">
						<strong>✓ Project confirmed:</strong> {selectedProject.name}
					</p>
					<p class="text-green-600 text-sm mt-1">
						Client: {selectedProject.client || 'Not specified'}<br>
						Site: {selectedProject.location || 'Not specified'}
					</p>
				</div>
			{:else}
				<div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p class="text-blue-700">
						<strong>✓ Generic Report</strong>
					</p>
					<p class="text-blue-600 text-sm mt-1">
						Creating a report without a project. You can attach it to a project later.
					</p>
				</div>
			{/if}
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
			<h3 class="font-medium mb-3">Report Data</h3>
			{#if selectedProject}
				<p class="text-gray-600 mb-4">
					Do you want me to pull in all trees, notes, voice memos, and tasks tagged to this project?
				</p>
				
				<div class="grid gap-3 mb-6">
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
						class:border-forest-500={localPullProjectData}
						class:bg-forest-50={localPullProjectData}
						class:border-gray-200={!localPullProjectData}
					>
						<input
							type="radio"
							name="pullData"
							checked={localPullProjectData}
							on:change={() => {
								localPullProjectData = true;
								pullProjectData = localPullProjectData;
							}}
							class="mt-0"
						/>
						<div>
							<div class="font-medium text-gray-900">Yes, pull in all project data</div>
							<div class="text-sm text-gray-500">
								{trees.length} trees, {notes.length} notes, {tasks.length} tasks will be included
							</div>
						</div>
					</label>
					
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
						class:border-forest-500={!localPullProjectData}
						class:bg-forest-50={!localPullProjectData}
						class:border-gray-200={localPullProjectData}
					>
						<input
							type="radio"
							name="pullData"
							checked={!localPullProjectData}
							on:change={() => {
								localPullProjectData = false;
								pullProjectData = localPullProjectData;
							}}
							class="mt-0"
						/>
						<div>
							<div class="font-medium text-gray-900">Let me choose what to include</div>
							<div class="text-sm text-gray-500">Select specific items later</div>
						</div>
					</label>
				</div>
			{:else}
				<p class="text-gray-600 mb-4">
					No project selected. You can create a generic report or add project data manually.
				</p>
				<div class="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
					<p class="text-gray-700 text-sm">
						To include project data (trees, notes, tasks), please select a project first.
					</p>
				</div>
			{/if}

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
	{#if aiFlowStep === 'gap-fill' && localGapFillQuestions.length > 0}
		<div class="mb-6">
			<h3 class="font-medium mb-3">Fill Missing Information</h3>
			<p class="text-gray-600 mb-4">
				The following information is missing or incomplete:
			</p>
			
			<div class="mb-6">
				<div class="mb-2">
					<label class="block text-sm font-medium text-gray-700 mb-1">
						{localGapFillQuestions[localCurrentGapIndex]?.question}
					</label>
					<textarea
						value={localGapFillQuestions[localCurrentGapIndex]?.answer || ''}
						on:input={(e) => handleGapAnswerChange(localCurrentGapIndex, (e.target as HTMLTextAreaElement).value)}
						rows="3"
						class="input w-full"
						placeholder="Enter your answer..."
					></textarea>
					<div class="mt-2 flex gap-2">
						<MicButton on:transcript={(e) => handleGapAnswerChange(localCurrentGapIndex, localGapFillQuestions[localCurrentGapIndex]?.answer + e.detail.text)} />
						{#if localGapFillQuestions[localCurrentGapIndex]?.field === 'client'}
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
						{#if localGapFillQuestions[localCurrentGapIndex]?.field === 'location'}
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
				
				{#if localGapFillQuestions[localCurrentGapIndex]?.field === 'location' && localFollowUpQuestions.length > 0}
					<div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
						<h4 class="font-medium text-blue-800 mb-2">AI Follow‑Up Questions</h4>
						<ul class="list-disc pl-5 text-blue-700 text-sm space-y-1">
							{#each localFollowUpQuestions as question}
								<li>{question}</li>
							{/each}
						</ul>
						<p class="text-blue-600 text-xs mt-2">Consider answering these questions to provide more precise location details.</p>
					</div>
				{/if}
				
				<div class="text-sm text-gray-500 mt-2">
					Question {localCurrentGapIndex + 1} of {localGapFillQuestions.length}
					{#if localGapFillQuestions[localCurrentGapIndex]?.field === 'client' || localGapFillQuestions[localCurrentGapIndex]?.field === 'location'}
						<span class="ml-2 text-blue-600">• AI suggestion available</span>
					{/if}
				</div>
			</div>

			<div class="flex gap-4">
				<button
					on:click={continueAIFlow}
					class="btn btn-primary"
				>
					{#if localCurrentGapIndex < localGapFillQuestions.length - 1}
						Next Question →
					{:else}
						Review Report
					{/if}
				</button>
				{#if localCurrentGapIndex > 0}
					<button
						on:click={() => handleGapIndexChange(localCurrentGapIndex - 1)}
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

			<!-- Style Analysis Section -->
			<div class="mb-6">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-medium">Report Style Analysis</h3>
					<button
						on:click={analyzeReportStyleAction}
						disabled={styleAnalyzing}
						class="btn btn-secondary text-sm"
					>
						{#if styleAnalyzing}
							<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Analyzing...
						{:else}
							Analyze Report Style
						{/if}
					</button>
				</div>
				
				{#if styleGuide}
					<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
						<h4 class="font-medium text-blue-800 mb-2">Style Guide for {selectedTemplate?.name || 'Report'}</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<div>
								<div class="font-medium text-gray-700">Tone:</div>
								<div class="text-gray-600">{styleGuide.tone}</div>
							</div>
							<div>
								<div class="font-medium text-gray-700">Structure:</div>
								<div class="text-gray-600">{styleGuide.structure}</div>
							</div>
							<div>
								<div class="font-medium text-gray-700">Phrasing:</div>
								<div class="text-gray-600">{styleGuide.phrasing}</div>
							</div>
							<div>
								<div class="font-medium text-gray-700">Formatting:</div>
								<div class="text-gray-600">{styleGuide.formatting}</div>
							</div>
						</div>
						{#if styleGuide.examples && styleGuide.examples.length > 0}
							<div class="mt-3">
								<div class="font-medium text-gray-700 mb-1">Example Phrases:</div>
								<ul class="list-disc pl-5 text-gray-600 text-sm space-y-1">
									{#each styleGuide.examples as example}
										<li>{example}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				{/if}
				
				{#if showStyleAnalysis && styleAnalysisResult}
					<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
						<div class="flex items-center justify-between mb-3">
							<h4 class="font-medium text-green-800">Style Analysis Results</h4>
							<button
								on:click={() => showStyleAnalysis = false}
								class="text-green-700 hover:text-green-900"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						
						<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
							<div class="bg-white p-3 rounded border">
								<div class="text-xl font-bold text-green-700">{styleAnalysisResult.summary?.tone || 'Professional'}</div>
								<div class="text-xs text-gray-600">Tone</div>
							</div>
							<div class="bg-white p-3 rounded border">
								<div class="text-xl font-bold text-green-700">{styleAnalysisResult.summary?.formality || 'High'}</div>
								<div class="text-xs text-gray-600">Formality</div>
							</div>
							<div class="bg-white p-3 rounded border">
								<div class="text-xl font-bold text-green-700">{Math.round((styleAnalysisResult.summary?.confidence || 0) * 100)}%</div>
								<div class="text-xs text-gray-600">Confidence</div>
							</div>
							<div class="bg-white p-3 rounded border">
								<div class="text-xl font-bold text-green-700">{styleAnalysisResult.compatibilityScore || 0}%</div>
								<div class="text-xs text-gray-600">Compatibility</div>
							</div>
						</div>
						
						{#if styleAnalysisResult.recommendations && styleAnalysisResult.recommendations.length > 0}
							<div class="mt-3">
								<h5 class="font-medium text-gray-800 mb-2">Style Recommendations</h5>
								<div class="space-y-2">
									{#each styleAnalysisResult.recommendations as rec}
										<div class="flex items-start gap-2 p-2 bg-white rounded border">
											<div class="flex-shrink-0 mt-0.5">
												{#if rec.type === 'tone'}
													<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
														Tone
													</span>
												{:else if rec.type === 'structure'}
													<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
														Structure
													</span>
												{:else if rec.type === 'phrasing'}
													<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
														Phrasing
													</span>
												{:else}
													<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
														{rec.type}
													</span>
												{/if}
											</div>
											<div class="flex-1">
												<div class="text-sm text-gray-800">{rec.suggestion}</div>
												<div class="text-xs text-gray-500 mt-1">
													Confidence: {Math.round((rec.confidence || 0) * 100)}%
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
						
						{#if styleAnalysisResult.styleProfile?.preferredPhrasing && styleAnalysisResult.styleProfile.preferredPhrasing.length > 0}
							<div class="mt-3">
								<h5 class="font-medium text-gray-800 mb-2">Preferred Phrases</h5>
								<div class="flex flex-wrap gap-2">
									{#each styleAnalysisResult.styleProfile.preferredPhrasing.slice(0, 5) as phrase}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
											{phrase.phrase}
											<span class="ml-1 text-blue-600 text-xs">
												({Math.round(phrase.confidence * 100)}%)
											</span>
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
				
				<p class="text-sm text-gray-600">
					Style analysis helps ensure your report matches the expected tone, structure, and phrasing for {selectedTemplate?.name || 'this report type'}.
				</p>
			</div>

			<div class="mb-6">
				<h3 class="font-medium mb-3">Generation Method</h3>
				<div class="flex gap-4">
					<label class="flex items-center gap-2">
						<input
							type="radio"
							name="generationMethod"
							value="template"
							checked={localReportMode === 'template'}
							on:change={() => {
								localReportMode = 'template';
								reportMode = localReportMode;
							}}
						/>
						<span>Template-based (Fast, structured)</span>
					</label>
					<label class="flex items-center gap-2">
						<input
							type="radio"
							name="generationMethod"
							value="ai"
							checked={localReportMode === 'ai'}
							on:change={() => {
								localReportMode = 'ai';
								reportMode = localReportMode;
							}}
						/>
						<span>AI-generated (Flexible, creative)</span>
					</label>
				</div>
			</div>

			{#if localReportMode === 'ai'}
				<div class="mb-6">
					<h3 class="font-medium mb-3">Additional Notes (Optional)</h3>
					<textarea
						bind:value={localAdditionalNotes}
						on:input={(e) => {
							localAdditionalNotes = (e.target as HTMLTextAreaElement).value;
							additionalNotes = localAdditionalNotes;
						}}
						placeholder="Any specific requirements or additional information for the AI..."
						rows="4"
						class="input w-full"
					></textarea>
					<div class="mt-2">
						<MicButton on:transcript={(e) => {
							localAdditionalNotes += e.detail.text;
							additionalNotes = localAdditionalNotes;
						}} />
					</div>
				</div>
			{/if}

			<div class="flex gap-4">
				<button
					on:click={generateReport}
					disabled={generating}
					class="btn btn-primary flex-1"
				>
					{generating ? 'Generating...' : `Generate ${selectedTemplate?.name}`}
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