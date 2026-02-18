<script lang="ts">
	import { onMount } from 'svelte';
	import { db, type Project } from '$lib/db';
	import { groqApiKey } from '$lib/stores/settings';
	// TODO: parseUserAnswer is a specialized AI function for parsing free-text answers
	// This doesn't need migration to unified architecture as it's not part of intent system
	import { parseUserAnswer } from '$lib/services/aiActions';
	import type { Issue } from '$lib/types/aiReview';

	export let projectId: string;
	export let open = false;

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	let project: Project | undefined;
	let issues: Issue[] = [];
	let loading = true;
	let error = '';
	let currentIssueIndex = 0;
	let aiConversation: Array<{role: 'ai' | 'user', content: string}> = [];
	let userInput = '';
	let processingAI = false;

	onMount(async () => {
		if (open && projectId) {
			await loadProjectAndScan();
		}
	});

	async function loadProjectAndScan() {
		loading = true;
		error = '';
		
		try {
			project = await db.projects.get(projectId);
			if (!project) {
				error = 'Project not found';
				loading = false;
				return;
			}

			issues = await scanProjectForIssues(projectId);
			
			if (issues.length > 0) {
				currentIssueIndex = 0;
				await startIssueConversation(issues[0]);
			}
			
		} catch (e) {
			error = 'Failed to load project';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function scanProjectForIssues(projectId: string): Promise<Issue[]> {
		const issues: Issue[] = [];
		
		try {
			const project = await db.projects.get(projectId);
			if (!project) return issues;

			// Check for missing client name
			if (!project.client || project.client === 'Not specified') {
				issues.push({
					id: 'missing-client',
					type: 'missing-field',
					field: 'client',
					originalInput: '',
					suggestions: [],
					explanation: 'Client name is missing or not specified.',
					status: 'pending'
				});
			}

			// Check for missing location
			if (!project.location || project.location === 'Not specified') {
				issues.push({
					id: 'missing-location',
					type: 'missing-field',
					field: 'location',
					originalInput: '',
					suggestions: [],
					explanation: 'Site address is missing or not specified.',
					status: 'pending'
				});
			}

		} catch (e) {
			console.error('Failed to scan project for issues:', e);
		}

		return issues;
	}

	async function startIssueConversation(issue: Issue) {
		aiConversation = [];
		
		let aiMessage = `I found an issue with the ${issue.field} field:\n\n`;
		aiMessage += `${issue.explanation}\n\n`;
		
		if (issue.suggestions.length > 0) {
			aiMessage += `I have ${issue.suggestions.length} suggestions:\n`;
			issue.suggestions.forEach((suggestion, index) => {
				aiMessage += `${index + 1}. ${suggestion.value} (confidence: ${Math.round(suggestion.confidence * 100)}%)\n`;
			});
			aiMessage += '\nWhich one would you like to use? Or enter a different value.';
		} else if (issue.type === 'missing-field') {
			aiMessage += `What ${issue.field === 'client' ? 'client name' : 'site address'} would you like to use?`;
		} else {
			aiMessage += 'How would you like to address this issue?';
		}
		
		aiConversation.push({ role: 'ai', content: aiMessage });
	}

	function selectIssue(index: number) {
		currentIssueIndex = index;
		startIssueConversation(issues[index]);
	}

	async function sendMessage() {
		if (!userInput.trim() || processingAI) return;
		
		const userMessage = userInput.trim();
		userInput = '';
		
		aiConversation.push({ role: 'user', content: userMessage });
		
		processingAI = true;
		
		try {
			const currentIssue = issues[currentIssueIndex];
			let aiResponse = '';
			
			if (currentIssue.type === 'missing-field') {
				if (currentIssue.field === 'client' || currentIssue.field === 'location') {
					const result = await parseUserAnswer(userMessage, currentIssue.field);
					
					if (result.confidence >= 70) {
						aiResponse = `I understand you want to use "${result.cleaned}" as the ${currentIssue.field === 'client' ? 'client name' : 'site address'}.\n`;
						aiResponse += `Confidence: ${result.confidence}% (High confidence)\n\n`;
						aiResponse += `Would you like me to apply this to the project?`;
						currentIssue.resolvedValue = result.cleaned;
					} else {
						aiResponse = `I parsed "${result.cleaned}" from your input, but I'm not very confident (${result.confidence}%).\n`;
						aiResponse += `Could you clarify or confirm this is correct?`;
					}
				}
			} else {
				aiResponse = `Thank you for your input. I'll help you resolve this issue.\n\n`;
				aiResponse += `Would you like me to apply "${userMessage}" to the ${currentIssue.field} field?`;
				currentIssue.resolvedValue = userMessage;
			}
			
			aiConversation.push({ role: 'ai', content: aiResponse });
			
		} catch (e) {
			console.error('Failed to process AI response:', e);
			aiConversation.push({ 
				role: 'ai', 
				content: 'I encountered an error. Please try again or check your API key in Settings.' 
			});
		} finally {
			processingAI = false;
		}
	}

	async function applyResolution() {
		const currentIssue = issues[currentIssueIndex];
		if (!currentIssue.resolvedValue || !project) return;
		
		try {
			if (currentIssue.field === 'client') {
				await db.projects.update(projectId, { client: currentIssue.resolvedValue });
			} else if (currentIssue.field === 'location') {
				await db.projects.update(projectId, { location: currentIssue.resolvedValue });
			}
			
			currentIssue.status = 'resolved';
			issues = [...issues];
			
			const nextIssueIndex = issues.findIndex(issue => issue.status === 'pending');
			if (nextIssueIndex >= 0) {
				currentIssueIndex = nextIssueIndex;
				await startIssueConversation(issues[nextIssueIndex]);
			} else {
				aiConversation.push({
					role: 'ai',
					content: '🎉 All issues resolved! Project is ready for report generation.'
				});
			}
			
		} catch (e) {
			console.error('Failed to apply resolution:', e);
			aiConversation.push({
				role: 'ai',
				content: 'Failed to update project. Please try again.'
			});
		}
	}

	function closeChat() {
		open = false;
		issues = [];
		aiConversation = [];
		currentIssueIndex = 0;
	}

	$: if (open && projectId) {
		loadProjectAndScan();
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="px-6 py-4 border-b flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-gray-900">AI Review Chat</h2>
					<p class="text-sm text-gray-600">
						{project?.name || 'Project Review'}
						{#if issues.length > 0}
							<span class="ml-2 text-forest-600">
								({issues.filter(i => i.status === 'pending').length} issues remaining)
							</span>
						{/if}
					</p>
				</div>
				<button on:click={closeChat} class="text-gray-400 hover:text-gray-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			
			<!-- Main Content -->
			<div class="flex-1 flex overflow-hidden">
				<!-- Issues List -->
				<div class="w-1/3 border-r bg-gray-50 overflow-y-auto p-4">
					<h3 class="font-medium text-gray-900 mb-3">Issues Found</h3>
					
					{#if loading}
						<div class="text-center py-8">
							<p class="text-gray-500">Scanning project...</p>
						</div>
					{:else if issues.length === 0}
						<div class="text-center py-8">
							<p class="text-gray-500">No issues found!</p>
						</div>
					{:else}
						<div class="space-y-2">
							{#each issues as issue, index (issue.id)}
								<button
									on:click={() => selectIssue(index)}
									class={`w-full text-left p-3 rounded-lg ${index === currentIssueIndex ? 'bg-forest-50 border border-forest-200' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
								>
									<div class="flex items-start gap-2">
										<div class={`w-2 h-2 mt-1.5 rounded-full ${issue.status === 'resolved' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
										<div class="flex-1">
											<p class="text-sm font-medium text-gray-900">
												{#if issue.field === 'client'}
													Client Name
												{:else if issue.field === 'location'}
													Site Address
												{:else}
													{issue.field}
												{/if}
											</p>
											<p class="text-xs text-gray-600 mt-1">{issue.explanation}</p>
											<div class="mt-2">
												<span class="text-xs px-2 py-0.5 rounded {issue.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
													{issue.status === 'resolved' ? 'Resolved' : 'Pending'}
												</span>
											</div>
										</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				
				<!-- Chat Area -->
				<div class="flex-1 flex flex-col">
					{#if loading}
						<div class="flex-1 flex items-center justify-center">
							<p class="text-gray-500">Loading...</p>
						</div>
					{:else if issues.length === 0}
						<div class="flex-1 flex items-center justify-center">
							<div class="text-center max-w-md">
								<svg class="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								<h3 class="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
								<p class="text-gray-600">Project looks complete and ready.</p>
								<button on:click={closeChat} class="btn btn-primary mt-4">Close</button>
							</div>
						</div>
					{:else}
						<!-- Conversation -->
						<div class="flex-1 overflow-y-auto p-4 space-y-4">
							{#each aiConversation as message, index (index)}
								<div class={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
									<div class={`max-w-[80%] rounded-lg p-3 ${message.role === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-forest-600 text-white'}`}>
										<p class="whitespace-pre-wrap text-sm">{message.content}</p>
									</div>
								</div>
							{/each}
							
							{#if processingAI}
								<div class="flex justify-start">
									<div class="bg-gray-100 rounded-lg p-3">
										<div class="flex items-center gap-2">
											<svg class="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											<span class="text-sm text-gray-600">AI is thinking...</span>
										</div>
									</div>
								</div>
							{/if}
						</div>
						
						<!-- Input Area -->
						<div class="border-t p-4">
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={userInput}
									placeholder="Type your response..."
									class="input flex-1"
									on:keydown={(e) => e.key === 'Enter' && sendMessage()}
									disabled={processingAI}
								/>
								<button
									on:click={sendMessage}
									class="btn btn-primary"
									disabled={processingAI || !userInput.trim()}
								>
									Send
								</button>
							</div>
							
							{#if issues[currentIssueIndex]?.resolvedValue}
								<div class="mt-4 flex gap-2">
									<button
										on:click={applyResolution}
										class="btn bg-green-600 text-white hover:bg-green-700"
									>
										Apply "{issues[currentIssueIndex].resolvedValue}"
									</button>
									<button
										on:click={() => {
											issues[currentIssueIndex].resolvedValue = '';
											aiConversation.push({
												role: 'ai',
												content: 'What would you like to use instead?'
											});
										}}
										class="btn btn-secondary"
									>
										Try Different
									</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}