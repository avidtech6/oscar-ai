<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/db';
	import { groqApiKey } from '$lib/stores/settings';
	import { getProjectReviewStatus } from '$lib/services/projectReview';

	export let projectId: string = '';
	export let isOpen: boolean = false;

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	let project: any = null;
	let userInput = '';
	let processing = false;
	let conversation: Array<{ role: 'ai' | 'user' | 'system'; content: string }> = [];
	let availableActions = [
		{ id: 'review', label: 'Review Project', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', description: 'AI review of project completeness' },
		{ id: 'suggest', label: 'Suggest Improvements', icon: 'M13 10V3L4 14h7v7l9-11h-7z', description: 'Get AI suggestions for project' },
		{ id: 'generate', label: 'Generate Report', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', description: 'Generate AI-powered report' },
		{ id: 'analyze', label: 'Analyze Trees', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', description: 'Analyze tree data and patterns' },
		{ id: 'summarize', label: 'Summarize Notes', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', description: 'Summarize project notes and voice recordings' },
		{ id: 'qa', label: 'Q&A', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Ask questions about your project' }
	];

	onMount(async () => {
		if (projectId) {
			await loadProject();
		}
	});

	async function loadProject() {
		try {
			project = await db.projects.get(projectId);
			if (project) {
				addSystemMessage(`Project "${project.name}" loaded. How can I help you today?`);
			}
		} catch (e) {
			console.error('Failed to load project:', e);
			addSystemMessage('Failed to load project. Please try again.');
		}
	}

	function addSystemMessage(content: string) {
		conversation.push({ role: 'system', content });
	}

	function addAIMessage(content: string) {
		conversation.push({ role: 'ai', content });
	}

	function addUserMessage(content: string) {
		conversation.push({ role: 'user', content });
	}

	async function handleAction(actionId: string) {
		if (processing) return;

		processing = true;
		addUserMessage(`I want to ${availableActions.find(a => a.id === actionId)?.label.toLowerCase()}.`);

		try {
			switch (actionId) {
				case 'review':
					await handleReviewAction();
					break;
				case 'suggest':
					await handleSuggestAction();
					break;
				case 'generate':
					await handleGenerateAction();
					break;
				case 'analyze':
					await handleAnalyzeAction();
					break;
				case 'summarize':
					await handleSummarizeAction();
					break;
				case 'qa':
					addAIMessage('What would you like to know about your project?');
					break;
				default:
					addAIMessage('I can help with that. Please tell me more about what you need.');
			}
		} catch (e) {
			console.error('Action failed:', e);
			addAIMessage('Sorry, I encountered an error. Please try again.');
		} finally {
			processing = false;
		}
	}

	async function handleReviewAction() {
		if (!project) {
			addAIMessage('Project not loaded. Please try again.');
			return;
		}

		const reviewStatus = await getProjectReviewStatus(projectId);
		
		let message = `## Project Review: ${project.name}\n\n`;
		
		if (reviewStatus?.needsReview) {
			message += `⚠️ **Needs Review** (${reviewStatus.priority} priority)\n`;
			message += `Found ${reviewStatus.issueCount} issue${reviewStatus.issueCount !== 1 ? 's' : ''}.\n\n`;
			message += 'I recommend:\n';
			message += '1. Check missing fields (client, location)\n';
			message += '2. Review tree data completeness\n';
			message += '3. Add photos for documentation\n';
			message += '4. Ensure notes cover key observations\n\n';
			message += 'Would you like me to help fix any specific issues?';
		} else {
			message += '✅ **Project looks good!**\n\n';
			message += 'All required fields are complete.\n';
			message += 'Ready for report generation.\n\n';
			message += 'What would you like to do next?';
		}

		addAIMessage(message);
	}

	async function handleSuggestAction() {
		if (!project) return;

		// Load project data for suggestions
		const trees = await db.trees.where('projectId').equals(projectId).toArray();
		const notes = await db.notes.where('projectId').equals(projectId).toArray();
		const photos = await db.photos.where('projectId').equals(projectId).toArray();

		let message = `## Suggestions for ${project.name}\n\n`;
		
		if (trees.length === 0) {
			message += '🌳 **Add Trees**: No trees surveyed yet. Consider adding tree data for a complete survey.\n\n';
		} else {
			message += `🌳 **Trees**: ${trees.length} trees surveyed. `;
			const categories = trees.map(t => t.category).filter(Boolean);
			if (categories.length > 0) {
				const categoryCounts = categories.reduce((acc, cat) => {
					acc[cat] = (acc[cat] || 0) + 1;
					return acc;
				}, {} as Record<string, number>);
				message += `Categories: ${Object.entries(categoryCounts).map(([cat, count]) => `${cat}(${count})`).join(', ')}.\n\n`;
			} else {
				message += 'Consider adding category classifications.\n\n';
			}
		}

		if (notes.length === 0) {
			message += '📝 **Add Notes**: No notes yet. Add field observations or voice notes.\n\n';
		} else {
			message += `📝 **Notes**: ${notes.length} notes. Consider adding photos to complement your notes.\n\n`;
		}

		if (photos.length === 0) {
			message += '📸 **Add Photos**: No photos yet. Visual documentation is valuable for reports.\n\n';
		} else {
			message += `📸 **Photos**: ${photos.length} photos. Good visual documentation!\n\n`;
		}

		message += '**Next Steps**:\n';
		message += '1. Complete missing data fields\n';
		message += '2. Review tree classifications\n';
		message += '3. Add supporting photos\n';
		message += '4. Generate comprehensive report';

		addAIMessage(message);
	}

	async function handleGenerateAction() {
		addAIMessage('Report generation is coming soon! For now, you can:\n\n1. Go to the Reports tab\n2. Select a template\n3. Generate your report\n\nWould you like me to guide you through the report generation process?');
	}

	async function handleAnalyzeAction() {
		const trees = await db.trees.where('projectId').equals(projectId).toArray();
		
		if (trees.length === 0) {
			addAIMessage('No tree data to analyze. Add trees first to get insights.');
			return;
		}

		const totalDBH = trees.reduce((sum, tree) => sum + (tree.DBH || 0), 0);
		const avgDBH = totalDBH / trees.length;
		const categories = trees.map(t => t.category).filter(Boolean);
		const categoryCounts = categories.reduce((acc, cat) => {
			acc[cat] = (acc[cat] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		let message = `## Tree Analysis: ${trees.length} trees\n\n`;
		message += `📊 **Average DBH**: ${avgDBH.toFixed(1)}mm\n`;
		message += `📈 **Total RPA**: ${trees.reduce((sum, tree) => sum + (tree.RPA || 0), 0)}mm\n\n`;
		
		if (Object.keys(categoryCounts).length > 0) {
			message += '**Category Distribution**:\n';
			Object.entries(categoryCounts).forEach(([cat, count]) => {
				const percentage = (count / trees.length * 100).toFixed(1);
				message += `- ${cat}: ${count} trees (${percentage}%)\n`;
			});
			message += '\n';
		}

		message += '**Recommendations**:\n';
		if (avgDBH < 300) {
			message += '- Consider younger tree preservation strategies\n';
		} else if (avgDBH > 600) {
			message += '- Mature trees may require special considerations\n';
		}

		if (categoryCounts['U']) {
			message += `- ${categoryCounts['U']} unsuitable trees identified\n`;
		}

		addAIMessage(message);
	}

	async function handleSummarizeAction() {
		const notes = await db.notes.where('projectId').equals(projectId).toArray();
		const voiceNotes = notes.filter(n => n.type === 'voice');
		const fieldNotes = notes.filter(n => n.type === 'field');
		const generalNotes = notes.filter(n => n.type === 'general');

		let message = `## Notes Summary\n\n`;
		message += `📝 **Total Notes**: ${notes.length}\n`;
		message += `🎤 **Voice Notes**: ${voiceNotes.length}\n`;
		message += `🌿 **Field Notes**: ${fieldNotes.length}\n`;
		message += `📄 **General Notes**: ${generalNotes.length}\n\n`;

		if (notes.length > 0) {
			message += '**Recent Notes**:\n';
			const recentNotes = notes
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 3);
			
			recentNotes.forEach(note => {
				const date = new Date(note.createdAt).toLocaleDateString();
				const preview = note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content;
				message += `- **${note.title}** (${date}): ${preview}\n`;
			});
		} else {
			message += 'No notes yet. Consider adding field observations or recording voice notes.';
		}

		addAIMessage(message);
	}

	async function handleSendMessage() {
		if (!userInput.trim() || processing) return;

		const message = userInput.trim();
		userInput = '';
		addUserMessage(message);

		processing = true;

		try {
			// Simple AI response for now
			const response = await generateAIResponse(message);
			addAIMessage(response);
		} catch (e) {
			console.error('AI response failed:', e);
			addAIMessage('Sorry, I encountered an error. Please check your API key in Settings.');
		} finally {
			processing = false;
		}
	}

	async function generateAIResponse(userMessage: string): Promise<string> {
		// Simple keyword-based responses for now
		const lowerMessage = userMessage.toLowerCase();

		if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
			return `Hello! I'm your AI assistant for project "${project?.name || 'this project'}". How can I help you today?`;
		}

		if (lowerMessage.includes('thank')) {
			return "You're welcome! Is there anything else I can help you with?";
		}

		if (lowerMessage.includes('tree') || lowerMessage.includes('species')) {
			const trees = await db.trees.where('projectId').equals(projectId).toArray();
			if (trees.length === 0) {
				return "No trees have been added to this project yet. Would you like to add some trees?";
			}
			return `This project has ${trees.length} trees surveyed. The most common species are: ${Array.from(new Set(trees.map(t => t.species))).slice(0, 3).join(', ')}.`;
		}

		if (lowerMessage.includes('note') || lowerMessage.includes('observation')) {
			const notes = await db.notes.where('projectId').equals(projectId).toArray();
			if (notes.length === 0) {
				return "No notes have been added yet. Consider adding field observations or recording voice notes.";
			}
			return `There are ${notes.length} notes in this project, including ${notes.filter(n => n.type === 'voice').length} voice notes.`;
		}

		if (lowerMessage.includes('photo') || lowerMessage.includes('image')) {
			const photos = await db.photos.where('projectId').equals(projectId).toArray();
			if (photos.length === 0) {
				return "No photos have been added yet. Visual documentation is important for reports.";
			}
			return `This project has ${photos.length} photos. Great visual documentation!`;
		}

		if (lowerMessage.includes('report') || lowerMessage.includes('generate')) {
			return "You can generate reports from the Reports tab. I can help you prepare the data first. Would you like me to review the project completeness?";
		}

		return "I understand you're asking about: " + userMessage + ". I can help you with project review, suggestions, analysis, or answering questions about your data. What specific help do you need?";
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
		if (e.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
		on:keydown={handleKeydown}
		tabindex="0"
	>
		<div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="px-6 py-4 border-b flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-gray-900">AI Assistant</h2>
					<p class="text-sm text-gray-600">
						{#if project}
							{project.name}
						{:else}
							Project Assistant
						{/if}
					</p>
				</div>
				<button
					on:click={() => isOpen = false}
					class="text-gray-400 hover:text-gray-600"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Main Content -->
			<div class="flex-1 flex overflow-hidden">
				<!-- Actions Sidebar -->
				<div class="w-1/3 border-r bg-gray-50 overflow-y-auto p-4">
					<h3 class="font-medium text-gray-900 mb-3">Quick Actions</h3>
					<div class="space-y-2">
						{#each availableActions as action}
							<button
								on:click={() => handleAction(action.id)}
								disabled={processing}
								class="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<div class="flex items-center gap-3">
									<div class="p-2 bg-forest-50 rounded-lg">
										<svg class="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon} />
										</svg>
									</div>
									<div class="flex-1">
										<p class="font-medium text-gray-900">{action.label}</p>
										<p class="text-xs text-gray-600 mt-1">{action.description}</p>
									</div>
								</div>
							</button>
						{/each}
					</div>

					<div class="mt-6 pt-4 border-t border-gray-200">
						<h4 class="font-medium text-gray-900 mb-2">Tips</h4>
						<ul class="text-xs text-gray-600 space-y-1">
							<li>• Ask about trees, notes, or photos</li>
							<li>• Request project review</li>
							<li>• Get suggestions for improvements</li>
							<li>• Analyze your data</li>
							<li>• Press Esc to close</li>
						</ul>
					</div>
				</div>

				<!-- Chat Area -->
				<div class="flex-1 flex flex-col">
					<!-- Conversation -->
					<div class="flex-1 overflow-y-auto p-4 space-y-4">
						{#each conversation as message, index (index)}
							{#if message.role !== 'system'}
								<div class={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
									<div class={`max-w-[80%] rounded-lg p-3 ${message.role === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-forest-600 text-white'}`}>
										{#if message.role === 'ai'}
											<div class="prose prose-sm max-w-none">
												{@html message.content.replace(/\n/g, '<br>').replace(/## (.*?)\n/g, '<h3 class="text-lg font-semibold mb-2">$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\* (.*?)\n/g, '<li>$1</li>')}
											</div>
										{:else}
											<p class="whitespace-pre-wrap">{message.content}</p>
										{/if}
									</div>
								</div>
							{/if}
						{/each}

						{#if processing}
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
								placeholder="Ask me anything about your project..."
								class="input flex-1"
								on:keydown={(e) => e.key === 'Enter' && handleSendMessage()}
								disabled={processing}
							/>
							<button
								on:click={handleSendMessage}
								class="btn btn-primary"
								disabled={processing || !userInput.trim()}
							>
								Send
							</button>
						</div>
						<p class="text-xs text-gray-500 mt-2">
							Press Enter to send, Esc to close
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}