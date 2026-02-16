<script lang="ts">
	import MicButton from '$lib/components/MicButton.svelte';
	import { suggestClientName, suggestSiteAddress, parseUserAnswer, generateFollowUpQuestions } from '$lib/services/aiActions';
	
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
	
	function handleGapAnswerChange(index: number, value: string) {
		if (localGapFillQuestions[index]) {
			localGapFillQuestions[index].answer = value;
			gapFillQuestions = [...localGapFillQuestions];
		}
	}
	
	function handleGapIndexChange(index: number) {
		currentGapIndex = index;
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
						on:input={(e) => handleGapAnswerChange(localCurrentGapIndex, e.target.value)}
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
							localAdditionalNotes = e.target.value;
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