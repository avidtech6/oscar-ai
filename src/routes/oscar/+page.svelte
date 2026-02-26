<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { groqApiKey, settings } from '$lib/stores/settings';
	import { projectContextStore, currentProjectId, currentProject, projectHistory } from '$lib/services/unified/ProjectContextStore';
	import { unifiedIntentEngine } from '$lib/services/unified/UnifiedIntentEngine';
	import { intentFeedbackService } from '$lib/services/unified/IntentFeedbackService';
	import { actionExecutorService } from '$lib/services/unified/ActionExecutorService';
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	import MicButton from '$lib/components/MicButton.svelte';
	import UnifiedContextSwitcher from '$lib/components/chat/UnifiedContextSwitcher.svelte';
	// TODO: Migrate these legacy imports to unified services
	import {
		getAIContext,
		formatContextForAI,
		type AIContext
	} from '$lib/services/aiActions';
	import {
		inferProjectFromMessage,
		proposeContextSwitch,
		resolvePronounReference,
		getContextSwitchOptions
	} from '$lib/services/unified/ContextInferenceService';
	import { saveChatMessage, getChatHistory, clearChatHistory, type ChatMessage } from '$lib/db';
	import type { IntentType } from '$lib/services/unified/UnifiedIntentEngine';
	import type { ActionResult } from '$lib/services/aiActions';
	import { sanitizeForMatch, safeMatch, validateNonEmptyString } from '$lib/copilot/sanitizeInput';

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	interface Message {
		role: 'user' | 'oscar';
		content: string;
		timestamp: string;
		actionUrl?: string;
		actionType?: IntentType;
		actionResult?: ActionResult;
		objects?: any[];
		id?: string;
	}

	let messages: Message[] = [];
	let inputMessage = '';
	let sending = false;
	let error = '';
	let showFAQ = true;
	let currentContext: AIContext | null = null;
	let isLoadingHistory = false;
	let isRealTimeTranscribing = false;
	
	// Context inference state
	let contextInferenceResult: any = null;
	let showContextSwitchPrompt = false;
	let pendingConfirmation = false;
	let conversionOptions: any = null;
	let showConversionOptions = false;
	
	// Tagging confirmation state
	let showTaggingConfirmation = false;
	let taggingConfirmationData: any = null;
	let showMultipleProjectMatches = false;
	let multipleProjectMatches: Array<{ id: string; name: string }> = [];
	let showProjectSelection = false;
	let projectSelectionData: any = null;

	// FAQ data - more concise
	const faqs = [
		{
			question: 'Root Protection Area calculation',
			answer: 'Single-stem: RPA radius = DBH (mm) × 12. Multi-stemmed: stem diameter at 1.5m × 6.'
		},
		{
			question: 'BS5837 tree categories',
			answer: 'A: High quality (conservation, appearance, riparian). B: Moderate quality. C: Low quality (10+ years life). U: Unsuitable for retention.'
		},
		{
			question: 'Tree Constraints Plan',
			answer: 'Shows all trees, canopy spreads, RPAs, and constraints. Based on topographical survey, drawn to scale.'
		},
		{
			question: 'Preliminary Arboricultural Assessment',
			answer: 'Desk-based study identifying trees, preliminary categories, and potential development constraints. First step before full BS5837 survey.'
		}
	];

	onMount(async () => {
		if (!apiKey) {
			error = 'Please configure your Groq API key in Settings first.';
		}
		currentContext = await getAIContext();
		await loadChatHistory();
	});

	async function loadChatHistory() {
		isLoadingHistory = true;
		try {
			const history = await getChatHistory(100);
			if (history.length > 0) {
				messages = history.map(msg => ({
					role: msg.role,
					content: msg.content,
					timestamp: msg.timestamp.toISOString(),
					actionUrl: msg.actionUrl,
					actionType: msg.actionType as IntentType,
					actionResult: msg.actionResult,
					objects: msg.objects,
					id: msg.id
				}));
				showFAQ = false;
			}
		} catch (e) {
			console.error('Failed to load chat history:', e);
		} finally {
			isLoadingHistory = false;
		}
	}

	async function refreshChat() {
		messages = [];
		showFAQ = true;
		inputMessage = '';
		error = '';
	}

	async function saveAndRefresh() {
		// Chat is already saved automatically, just refresh
		await refreshChat();
	}

	async function sendMessage() {
		// Sanitize and validate input
		let userMessageText: string;
		try {
			userMessageText = validateNonEmptyString(inputMessage, 'Chat message');
		} catch (validationError) {
			error = validationError instanceof Error ? validationError.message : 'Invalid input';
			return;
		}

		if (sending) return;

		if (!apiKey) {
			error = 'Please configure your Groq API key in Settings first.';
			return;
		}

		sending = true;
		error = '';
		
		// Reset context inference state
		showContextSwitchPrompt = false;
		contextInferenceResult = null;
		showConversionOptions = false;
		conversionOptions = null;

		currentContext = await getAIContext();
		const contextInfo = formatContextForAI(currentContext);
		
		// Resolve pronoun references
		const resolutionResult = resolvePronounReference(
			userMessageText,
			{
				lastReferencedItem: null,
				lastCreatedItem: null,
				currentProject: currentContext?.currentProject || null
			}
		);
		
		// Extract the resolved message string from the result
		const resolvedMessageText = typeof resolutionResult === 'string'
			? resolutionResult
			: (resolutionResult?.resolvedMessage || userMessageText);
		
		// Add user message
		const userMessage: Message = {
			role: 'user',
			content: resolvedMessageText,
			timestamp: new Date().toISOString()
		};
		messages = [...messages, userMessage];
		
		// Save to persistent storage
		try {
			const savedId = await saveChatMessage({
				role: 'user',
				content: resolvedMessageText,
				actionUrl: userMessage.actionUrl,
				actionType: userMessage.actionType,
				actionResult: userMessage.actionResult,
				objects: userMessage.objects
			});
			userMessage.id = savedId;
		} catch (e) {
			console.error('Failed to save user message:', e);
		}
		
		inputMessage = '';

		try {
			// First, check for context inference
			const inference = await inferProjectFromMessage(resolvedMessageText);
			
			// Handle multiple project matches
			if (inference.shouldSwitch && inference.multipleMatches && inference.multipleMatches.length > 1) {
				contextInferenceResult = inference;
				multipleProjectMatches = inference.multipleMatches;
				showMultipleProjectMatches = true;
				
				// Don't proceed with AI response yet - wait for user decision
				sending = false;
				return;
			}
			
			// Handle single project match
			if (inference.shouldSwitch && inference.projectId) {
				contextInferenceResult = inference;
				showContextSwitchPrompt = true;
				
				// Don't proceed with AI response yet - wait for user decision
				sending = false;
				return;
			}
			
			// First, classify the intent using unified engine
			const intent = await unifiedIntentEngine.classifyIntent(resolvedMessageText);
			
			let actionResult: ActionResult | null = null;
			
			// If intent is detected (not chat), execute it
			if (intent && intent.type !== 'chat') {
				console.log('Intent detected:', intent.type, intent.data);
				// Convert legacy intent format to IntentResult
				const intentResult = {
					intent: intent.type,
					confidence: intent.confidence,
					data: intent.data,
					requiresConfirmation: intent.requiresConfirmation || false,
					conversionOptions: intent.conversionOptions
				};
				actionResult = await unifiedIntentEngine.executeIntent(intentResult);
				console.log('Action result:', actionResult);
				
				// Check if action needs project selection
				if (actionResult && !actionResult.success && actionResult.action === 'needsProjectSelection') {
					projectSelectionData = actionResult.data;
					showProjectSelection = true;
					
					// Don't proceed with AI response yet - wait for user decision
					sending = false;
					return;
				}
			}

			// Build system prompt - professional, concise, no lecturing
			let actionContext = '';
			if (actionResult) {
				if (actionResult.success) {
					actionContext = `\n\nACTION COMPLETED: ${actionResult.message}`;
				} else {
					actionContext = `\n\nACTION FAILED: ${actionResult.message}`;
				}
			}

			const systemPrompt = `You are Oscar, a professional Tree Consultant assistant. The user is an expert in arboriculture. Do not teach or lecture them.

IMPORTANT CONTEXT:
${contextInfo}
${actionContext}

When the user asks to CREATE, MAKE, WRITE, ADD, START, or PERFORM tasks, the action has already been executed. Acknowledge what was done briefly.

IMPORTANT:
- Never invent fictional data unless explicitly asked
- Only use real data from the context
- Be concise - provide options, not explanations
- Never explain basic arboricultural concepts
- Act like a professional helper, not a tutor

Provide concise, accurate guidance.`;

			// Send to Groq API
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: systemPrompt
						},
						...messages.map(m => ({
							role: m.role === 'oscar' ? 'assistant' : m.role,
							content: m.content
						}))
					],
					temperature: 0.7,
					max_tokens: 1024
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error?.message || 'Failed to get response from AI');
			}

			const data = await response.json();
			const aiResponse = data.choices[0].message.content;
			const assistantMessage: Message = {
				role: 'oscar',
				content: aiResponse,
				timestamp: new Date().toISOString(),
				actionUrl: actionResult?.success ? actionResult.redirectUrl : undefined,
				actionType: actionResult?.intentType,
				actionResult: actionResult || undefined,
				objects: actionResult?.objects
			};
			
			// Save assistant message to persistent storage
			try {
				const savedId = await saveChatMessage({
					role: 'oscar',
					content: aiResponse,
					actionUrl: assistantMessage.actionUrl,
					actionType: assistantMessage.actionType as any,
					actionResult: assistantMessage.actionResult,
					objects: assistantMessage.objects
				});
				assistantMessage.id = savedId;
			} catch (e) {
				console.error('Failed to save assistant message:', e);
			}
			
			messages = [...messages, assistantMessage];
			
			// Update unified context with last AI message
			// TODO: Add last AI message tracking to unified context store
			// if (actionResult?.objects && actionResult.objects.length > 0) {
			// 	// Update last referenced item
			// }
			
			// Check if we should show conversion options (General mode)
			const currentProjectIdValue = $currentProjectId;
			if (!currentProjectIdValue && !actionResult) {
				// Show conversion options for content generated in General mode
				// Simple conversion options for General Chat mode
				conversionOptions = {
					options: [
						{ type: 'note', icon: '📝', label: 'Save as Note' },
						{ type: 'report', icon: '📄', label: 'Save as Report' },
						{ type: 'blog', icon: '📰', label: 'Save as Blog' },
						{ type: 'task', icon: '📋', label: 'Save as Task' }
					],
					projects: currentContext?.projects?.slice(0, 3) || []
				};
				showConversionOptions = true;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to send message';
			console.error(e);
		} finally {
			sending = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function handleFAQClick(faq: { question: string; answer: string }) {
		showFAQ = false;
		inputMessage = faq.question;
	}

	function handleActionClick(url: string) {
		goto(url);
	}

	function handleObjectClick(obj: any, type: string) {
		let url = '/';
		switch (type) {
			case 'tasks':
			case 'task':
				url = `/notes?note=${obj.linkedNoteId || ''}&mode=edit`;
				break;
			case 'notes':
			case 'note':
				url = `/notes?note=${obj.id}&mode=edit`;
				break;
			case 'projects':
			case 'project':
				url = `/project/${obj.id}`;
				break;
			case 'trees':
			case 'tree':
				url = `/project/${obj.projectId}?tree=${obj.id}`;
				break;
			case 'reports':
			case 'report':
				url = `/reports?report=${obj.id}&mode=edit`;
				break;
			case 'blogs':
			case 'blog':
				url = `/blog?post=${obj.id}&mode=edit`;
				break;
			case 'diagrams':
			case 'diagram':
				url = `/diagrams?diagram=${obj.id}&mode=edit`;
				break;
		}
		goto(url);
	}

	function getTypeIcon(type: string): string {
		switch (type) {
			case 'task': return '📋';
			case 'tasks': return '📋';
			case 'note': return '📝';
			case 'notes': return '📝';
			case 'project': return '📁';
			case 'projects': return '📁';
			case 'tree': return '🌳';
			case 'trees': return '🌳';
			case 'report': return '📄';
			case 'reports': return '📄';
			case 'blog': return '📰';
			case 'blogs': return '📰';
			case 'diagram': return '📊';
			case 'diagrams': return '📊';
			default: return '📋';
		}
	}

	// Handle real-time transcription from mic with intent detection
	async function handleTranscript(event: CustomEvent<{ text: string }>) {
		const transcriptText = event.detail.text;
		if (transcriptText) {
			// Add to input message
			inputMessage += (inputMessage ? ' ' : '') + transcriptText;
			
			// Process voice transcription for intent detection
			try {
				const intentResult = await unifiedIntentEngine.processVoiceTranscription(transcriptText);
				
				// If intent is detected and requires immediate action, show feedback
				if (intentResult && intentResult.intent !== 'chat') {
					// Show intent feedback
					const feedback = await intentFeedbackService.getFeedback(intentResult);
					
					// Add a temporary message showing detected intent
					const intentMessage: Message = {
						role: 'oscar',
						content: `🎤 Voice command detected: **${intentResult.intent}** (${intentResult.confidence}% confidence)\n\n${feedback.message}`,
						timestamp: new Date().toISOString(),
						actionType: intentResult.intent
					};
					
					messages = [...messages, intentMessage];
					
					// If intent requires confirmation, use the existing pending confirmation system
					if (intentResult.requiresConfirmation) {
						// Store the intent for confirmation
						// TODO: Integrate with unified intent feedback service for pending actions
						// For now, just show a message that confirmation is needed
						const confirmationMessage: Message = {
							role: 'oscar',
							content: `Voice command requires confirmation. Use the confirmation dialog below to proceed.`,
							timestamp: new Date().toISOString()
						};
						messages = [...messages, confirmationMessage];
						
						// Set pending confirmation state (simplified for now)
						// In a full implementation, this would integrate with intentFeedbackService
						pendingConfirmation = true;
					}
				}
			} catch (error) {
				console.error('Error processing voice transcription:', error);
				// Continue normally even if intent detection fails
			}
		}
	}
	
	// Handle context switch confirmation
	async function handleContextSwitch(option: 'yes' | 'choose' | 'general') {
		if (!contextInferenceResult || !contextInferenceResult.projectId) return;
		
		showContextSwitchPrompt = false;
		
		if (option === 'yes') {
			// Switch to project mode
			projectContextStore.setCurrentProject(contextInferenceResult.projectId);
			
			// Show confirmation message
			const confirmationMessage: Message = {
				role: 'oscar',
				content: `Switched to project: **${contextInferenceResult.projectName}**. All new items will be saved here.`,
				timestamp: new Date().toISOString()
			};
			messages = [...messages, confirmationMessage];
			
			// Save confirmation message
			try {
				await saveChatMessage({
					role: 'oscar',
					content: confirmationMessage.content
				});
			} catch (e) {
				console.error('Failed to save confirmation message:', e);
			}
			
			// Continue with the original message
			await sendMessage();
		} else if (option === 'general') {
			// Stay in General Chat
			const confirmationMessage: Message = {
				role: 'oscar',
				content: `Staying in General Chat mode. No automatic database writes.`,
				timestamp: new Date().toISOString()
			};
			messages = [...messages, confirmationMessage];
			
			try {
				await saveChatMessage({
					role: 'oscar',
					content: confirmationMessage.content
				});
			} catch (e) {
				console.error('Failed to save confirmation message:', e);
			}
			
			// Continue with the original message
			await sendMessage();
		} else if (option === 'choose') {
			// Let user choose another project (could open project selector)
			// For now, just stay in current mode
			showContextSwitchPrompt = false;
			sending = false;
		}
	}
	
	// Handle conversion option selection
	async function handleConversionOption(type: string, projectId?: string) {
		showConversionOptions = false;
		
		// Create appropriate action based on type
		let actionResult: ActionResult | null = null;
		const lastMessage = messages[messages.length - 1];
		
		if (lastMessage.role === 'oscar') {
			const content = lastMessage.content;
			
			switch (type) {
				case 'note':
					actionResult = await unifiedIntentEngine.executeIntent({
						intent: 'note',
						confidence: 1,
						data: {
							title: 'Converted from Chat',
							content: content,
							projectId: projectId || undefined
						},
						requiresConfirmation: false
					});
					break;
					
				case 'report':
					actionResult = await unifiedIntentEngine.executeIntent({
						intent: 'report',
						confidence: 1,
						data: {
							title: 'Report from Chat',
							type: 'bs5837',
							content: content,
							projectId: projectId || undefined
						},
						requiresConfirmation: false
					});
					break;
					
				case 'blog':
					actionResult = await unifiedIntentEngine.executeIntent({
						intent: 'blog',
						confidence: 1,
						data: {
							title: 'Blog Post from Chat',
							content: content,
							projectId: projectId || undefined
						},
						requiresConfirmation: false
					});
					break;
					
				case 'task':
					actionResult = await unifiedIntentEngine.executeIntent({
						intent: 'task',
						confidence: 1,
						data: {
							title: 'Task from Chat',
							content: content,
							projectId: projectId || undefined
						},
						requiresConfirmation: false
					});
					break;
			}
		}
		
		if (actionResult) {
			// Add action result message
			const resultMessage: Message = {
				role: 'oscar',
				content: `✓ ${actionResult.message}`,
				timestamp: new Date().toISOString(),
				actionResult: actionResult
			};
			messages = [...messages, resultMessage];
			
			// Save result message
			try {
				await saveChatMessage({
					role: 'oscar',
					content: resultMessage.content,
					actionResult: actionResult
				});
			} catch (e) {
				console.error('Failed to save result message:', e);
			}
		}
	}
	
	// Handle pending action confirmation
	async function handleConfirmPendingAction() {
		// Pending actions are now handled by unified intent feedback system
		// This is a stub implementation for backward compatibility
		const result = {
			success: false,
			message: 'Pending action confirmation is now handled by the unified intent system. No pending actions found.'
		};
		
		// Add error message
		const errorMessage: Message = {
			role: 'oscar',
			content: `✗ ${result.message}`,
			timestamp: new Date().toISOString(),
			actionResult: result
		};
		messages = [...messages, errorMessage];
		
		try {
			await saveChatMessage({
				role: 'oscar',
				content: errorMessage.content,
				actionResult: result
			});
		} catch (e) {
			console.error('Failed to save error message:', e);
		}
		
		pendingConfirmation = false;
	}
	
	// Handle cancel pending action
	function handleCancelPendingAction() {
		// TODO: Clear pending action from unified system
		pendingConfirmation = false;
		
		// Add cancellation message
		const cancelMessage: Message = {
			role: 'oscar',
			content: 'Action cancelled.',
			timestamp: new Date().toISOString()
		};
		messages = [...messages, cancelMessage];
		
		try {
			saveChatMessage({
				role: 'oscar',
				content: cancelMessage.content
			});
		} catch (e) {
			console.error('Failed to save cancellation message:', e);
		}
	}
	
	// Handle multiple project selection
	async function handleMultipleProjectSelect(projectId: string) {
		showMultipleProjectMatches = false;
		
		if (projectId === 'general') {
			// Stay in General Chat
			const confirmationMessage: Message = {
				role: 'oscar',
				content: `Staying in General Chat mode. No automatic database writes.`,
				timestamp: new Date().toISOString()
			};
			messages = [...messages, confirmationMessage];
			
			try {
				await saveChatMessage({
					role: 'oscar',
					content: confirmationMessage.content
				});
			} catch (e) {
				console.error('Failed to save confirmation message:', e);
			}
			
			// Continue with the original message
			await sendMessage();
		} else if (projectId === 'cancel') {
			// Cancel and reset
			multipleProjectMatches = [];
			sending = false;
		} else {
			// Switch to selected project
			const selectedProject = multipleProjectMatches.find(p => p.id === projectId);
			if (selectedProject) {
				projectContextStore.setCurrentProject(projectId);
				
				// Show confirmation message
				const confirmationMessage: Message = {
					role: 'oscar',
					content: `Switched to project: **${selectedProject.name}**. All new items will be saved here.`,
					timestamp: new Date().toISOString()
				};
				messages = [...messages, confirmationMessage];
				
				// Save confirmation message
				try {
					await saveChatMessage({
						role: 'oscar',
						content: confirmationMessage.content
					});
				} catch (e) {
					console.error('Failed to save confirmation message:', e);
				}
				
				// Continue with the original message
				await sendMessage();
			}
		}
	}
	
	// Handle project selection for General Chat actions
	async function handleProjectSelection(option: string) {
		showProjectSelection = false;
		
		if (option === 'cancel') {
			// Cancel the action
			projectSelectionData = null;
			sending = false;
			return;
		}
		
		if (option === 'general') {
			// Save without project tag (General mode)
			const currentProjectIdValue = $currentProjectId;
			if (!currentProjectIdValue) {
				// Execute action without project ID
				const actionResult = await unifiedIntentEngine.executeIntent({
					intent: projectSelectionData.action.replace('create', '').toLowerCase() as any,
					confidence: 1,
					data: {
						...projectSelectionData.data,
						projectId: undefined
					},
					requiresConfirmation: false
				});
				
				// Add result message
				const resultMessage: Message = {
					role: 'oscar',
					content: `✓ ${actionResult.message}`,
					timestamp: new Date().toISOString(),
					actionResult: actionResult
				};
				messages = [...messages, resultMessage];
				
				// Save result message
				try {
					await saveChatMessage({
						role: 'oscar',
						content: resultMessage.content,
						actionResult: actionResult
					});
				} catch (e) {
					console.error('Failed to save result message:', e);
				}
			}
		} else {
			// Save with selected project
			const selectedProject = projectSelectionData.availableProjects?.find((p: any) => p.id === option);
			const projectName = selectedProject ? selectedProject.name : 'the project';
			
			// Execute action with project ID
			const actionResult = await unifiedIntentEngine.executeIntent({
				intent: projectSelectionData.action.replace('create', '').toLowerCase() as any,
				confidence: 1,
				data: {
					...projectSelectionData.data,
					projectId: option
				},
				requiresConfirmation: false
			});
			
			// Add project tagging confirmation
			if (actionResult.success) {
				actionResult.message = `${actionResult.message} (Tagged to: ${projectName})`;
				actionResult.data = { ...actionResult.data, projectTag: projectName };
			}
			
			// Add result message
			const resultMessage: Message = {
				role: 'oscar',
				content: `✓ ${actionResult.message}`,
				timestamp: new Date().toISOString(),
				actionResult: actionResult
			};
			messages = [...messages, resultMessage];
			
			// Save result message
			try {
				await saveChatMessage({
					role: 'oscar',
					content: resultMessage.content,
					actionResult: actionResult
				});
			} catch (e) {
				console.error('Failed to save result message:', e);
			}
		}
		
		projectSelectionData = null;
	}
	
	// Check for pending actions
	$: pendingConfirmation = false; // TODO: Get from unified intent feedback service
</script>

<svelte:head>
	<title>Oscar AI</title>
</svelte:head>

<div class="max-w-4xl mx-auto h-full flex flex-col">
	<!-- Header -->
	<div class="bg-white border-b border-gray-200 px-6 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-bold text-gray-900">Oscar AI</h1>
				<p class="text-sm text-gray-600">Tree Consultant Assistant</p>
			</div>
			<div class="flex items-center gap-3">
				<!-- Context Switcher -->
				<UnifiedContextSwitcher />
				
				<div class="flex gap-2">
					<button
						on:click={refreshChat}
						class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
						title="Refresh chat"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Refresh
					</button>
					<button
						on:click={saveAndRefresh}
						class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
						title="Save transcript and refresh"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
						</svg>
						Save & Refresh
					</button>
				</div>
			</div>
		</div>
		{#if $currentProjectId && currentContext?.currentProject}
			<p class="text-xs text-green-700 mt-2 bg-green-50 inline-block px-2 py-1 rounded">
				Working in: <strong>{currentContext.currentProject.name}</strong> - All new items will be saved to this project.
			</p>
		{:else}
			<p class="text-xs text-blue-700 mt-2 bg-blue-50 inline-block px-2 py-1 rounded">
				General mode - No automatic database writes. Use conversion buttons to save content.
			</p>
		{/if}
	</div>

	{#if error && !messages.length}
		<div class="flex-1 flex items-center justify-center p-6">
			<div class="text-center">
				<div class="text-4xl mb-4">🌳</div>
				<p class="text-gray-600 mb-4">{error}</p>
				<a href="/settings" class="btn btn-primary">Go to Settings</a>
			</div>
		</div>
	{:else}
		<!-- Messages -->
		<div class="flex-1 overflow-y-auto p-6 space-y-4">
			{#if isLoadingHistory}
				<div class="flex justify-center py-8">
					<div class="text-gray-500">Loading chat history...</div>
				</div>
			{:else if showFAQ && messages.length === 0}
				<div class="bg-gray-50 rounded-lg p-6 mb-4">
					<h2 class="text-sm font-semibold text-gray-700 mb-4">Quick Reference</h2>
					<div class="grid gap-2">
						{#each faqs as faq}
							<button
								on:click={() => handleFAQClick(faq)}
								class="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
							>
								<span class="text-gray-800 font-medium text-sm">{faq.question}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#each messages as message}
				<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="max-w-3xl {message.role === 'user' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-4">
						<div class="flex items-start gap-3">
							<span class="text-xl">
								{message.role === 'user' ? '👤' : '🌳'}
							</span>
							<div class="flex-1 min-w-0">
								{#if message.role === 'oscar'}
									<MarkdownRenderer content={message.content} />
								{:else}
									<p class="whitespace-pre-wrap">{message.content}</p>
								{/if}
								
								<!-- Action Result - Success -->
								{#if message.actionResult?.success && message.actionResult.intentType !== 'query'}
									<div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
										<p class="text-green-800 font-medium text-sm">✓ {message.actionResult.message}</p>
										{#if message.actionUrl}
											<button
												on:click={() => handleActionClick(message.actionUrl)}
												class="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm"
											>
												<span>Open</span>
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
												</svg>
											</button>
										{/if}
									</div>
								{/if}
								
								<!-- Action Result - Error -->
								{#if message.actionResult && !message.actionResult.success}
									<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
										<p class="text-red-800 text-sm">✗ {message.actionResult.message}</p>
									</div>
								{/if}
								
								<!-- Query Results -->
								{#if message.objects && message.objects.length > 0}
									<div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
										<p class="text-blue-800 font-medium mb-2 text-sm">
											{getTypeIcon(message.actionResult?.data?.objectType)} {message.actionResult?.message}
										</p>
										<div class="space-y-2 max-h-60 overflow-y-auto">
											{#each message.objects as obj}
												<button
													on:click={() => handleObjectClick(obj, message.actionResult?.data?.objectType)}
													class="w-full text-left p-2 bg-white rounded border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
												>
													<p class="font-medium text-gray-900 text-sm">
														{obj.title || obj.name || 'Untitled'}
													</p>
													{#if obj.content || obj.description}
														<p class="text-xs text-gray-500 truncate">
															{obj.content?.substring(0, 80) || obj.description?.substring(0, 80) || ''}
														</p>
													{/if}
													{#if obj.status}
														<span class="text-xs px-2 py-0.5 rounded-full {obj.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
															{obj.status}
														</span>
													{/if}
												</button>
											{/each}
										</div>
									</div>
								{/if}
								
								<!-- Query Results - Empty -->
								{#if message.actionResult?.intentType === 'query' && message.actionResult.success && (!message.objects || message.objects.length === 0)}
									<div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
										<p class="text-gray-600 text-sm">No items found.</p>
									</div>
								{/if}
								
								<p class="text-xs {message.role === 'user' ? 'text-green-200' : 'text-gray-400'} mt-2">
									{new Date(message.timestamp).toLocaleTimeString()}
								</p>
							</div>
						</div>
					</div>
				</div>
			{/each}

			{#if sending}
				<div class="flex justify-start">
					<div class="bg-gray-100 rounded-lg p-4">
						<div class="flex items-center gap-3">
							<span class="text-xl">🌳</span>
							<div class="flex items-center gap-1">
								<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
								<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
								<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
							</div>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Context Switch Prompt -->
			{#if showContextSwitchPrompt && contextInferenceResult}
				<div class="flex justify-start">
					<div class="max-w-3xl bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<div class="flex items-start gap-3">
							<span class="text-xl">🔄</span>
							<div class="flex-1 min-w-0">
								<p class="text-yellow-800 font-medium mb-2">
									{proposeContextSwitch(contextInferenceResult)}
								</p>
								<p class="text-yellow-700 text-sm mb-3">
									{contextInferenceResult.reason}
								</p>
								<div class="flex gap-2">
									<button
										on:click={() => handleContextSwitch('yes')}
										class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
									>
										Yes, switch to {contextInferenceResult.projectName}
									</button>
									<button
										on:click={() => handleContextSwitch('general')}
										class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
									>
										Keep in General Chat
									</button>
									<button
										on:click={() => handleContextSwitch('choose')}
										class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
									>
										Choose another project
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Pending Action Confirmation -->
			{#if pendingConfirmation}
				<div class="flex justify-start">
					<div class="max-w-3xl bg-orange-50 border border-orange-200 rounded-lg p-4">
						<div class="flex items-start gap-3">
							<span class="text-xl">⚠️</span>
							<div class="flex-1 min-w-0">
								<p class="text-orange-800 font-medium mb-2">
									Action requires confirmation
								</p>
								<p class="text-orange-700 text-sm mb-3">
									This action will modify the database. Please confirm to proceed.
								</p>
								<div class="flex gap-2">
									<button
										on:click={handleConfirmPendingAction}
										class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
									>
										Confirm & Execute
									</button>
									<button
										on:click={handleCancelPendingAction}
										class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Multiple Project Matches -->
			{#if showMultipleProjectMatches && multipleProjectMatches.length > 0}
				<div class="flex justify-start">
					<div class="max-w-3xl bg-purple-50 border border-purple-200 rounded-lg p-4">
						<div class="flex items-start gap-3">
							<span class="text-xl">🔍</span>
							<div class="flex-1 min-w-0">
								<p class="text-purple-800 font-medium mb-2">
									Multiple projects match your message
								</p>
								<p class="text-purple-700 text-sm mb-3">
									Which project did you mean?
								</p>
								<div class="space-y-2 mb-3">
									{#each multipleProjectMatches as project}
										<button
											on:click={() => handleMultipleProjectSelect(project.id)}
											class="w-full text-left p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
										>
											<span class="font-medium text-purple-900">{project.name}</span>
										</button>
									{/each}
								</div>
								<div class="flex gap-2">
									<button
										on:click={() => handleMultipleProjectSelect('general')}
										class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
									>
										Keep in General Chat
									</button>
									<button
										on:click={() => handleMultipleProjectSelect('cancel')}
										class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Project Selection for General Chat -->
			{#if showProjectSelection && projectSelectionData}
				<div class="flex justify-start">
					<div class="max-w-3xl bg-green-50 border border-green-200 rounded-lg p-4">
						<div class="flex items-start gap-3">
							<span class="text-xl">🏷️</span>
							<div class="flex-1 min-w-0">
								<p class="text-green-800 font-medium mb-2">
									Where should I save this {projectSelectionData.action.replace('create', '')}?
								</p>
								<p class="text-green-700 text-sm mb-3">
									Select a project to tag this item:
								</p>
								<div class="space-y-2 mb-3">
									{#if projectSelectionData.availableProjects && projectSelectionData.availableProjects.length > 0}
										{#each projectSelectionData.availableProjects as project}
											<button
												on:click={() => handleProjectSelection(project.id)}
												class="w-full text-left p-3 bg-white border border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
											>
												<span class="font-medium text-green-900">{project.name}</span>
											</button>
										{/each}
									{/if}
									
									{#if projectSelectionData.hasMoreProjects}
										<button
											on:click={() => {
												// Open project selector
												goto('/workspace');
											}}
											class="w-full text-left p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
										>
											<span class="font-medium text-gray-700">More projects...</span>
										</button>
									{/if}
								</div>
								<div class="flex gap-2">
									<button
										on:click={() => handleProjectSelection('general')}
										class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
									>
										Save without project tag
									</button>
									<button
										on:click={() => handleProjectSelection('cancel')}
										class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Conversion Options (General Chat) -->
			{#if showConversionOptions && conversionOptions}
				<div class="flex justify-start">
					<div class="max-w-3xl bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div class="flex items-start gap-3">
							<span class="text-xl">💾</span>
							<div class="flex-1 min-w-0">
								<p class="text-blue-800 font-medium mb-2">
									Save this content:
								</p>
								<div class="flex flex-wrap gap-2 mb-3">
									{#each conversionOptions.options as option}
										<button
											on:click={() => handleConversionOption(option.type)}
											class="px-3 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center gap-2"
										>
											<span>{option.icon}</span>
											<span>{option.label}</span>
										</button>
									{/each}
								</div>
								
								{#if conversionOptions.projects.length > 0}
									<p class="text-blue-700 text-sm mb-2">Or save to a project:</p>
									<div class="flex flex-wrap gap-2">
										{#each conversionOptions.projects as project}
											<button
												on:click={() => handleConversionOption('note', project.id)}
												class="px-3 py-2 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm"
											>
												Save to {project.name}
											</button>
										{/each}
										<button
											on:click={() => {
												// Open project selector
												goto('/workspace');
											}}
											class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
										>
											More...
										</button>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input -->
		<div class="bg-white border-t border-gray-200 p-4">
			{#if error && messages.length > 0}
				<div class="mb-2 text-red-600 text-sm">{error}</div>
			{/if}
			<div class="flex gap-2">
				<textarea
					bind:value={inputMessage}
					on:keydown={handleKeyDown}
					placeholder="Ask to create tasks, notes, or ask questions..."
					rows="2"
					class="input flex-1 resize-none"
					disabled={sending}
				></textarea>
				<MicButton on:transcript={handleTranscript} />
				<button
					on:click={sendMessage}
					disabled={sending || !inputMessage.trim()}
					class="btn btn-primary px-6"
				>
					{sending ? 'Sending...' : 'Send'}
				</button>
			</div>
			<p class="text-xs text-gray-500 mt-2">
				Try: "remember to check the oak tree", "show me my tasks", "make a note about the site visit"
			</p>
		</div>
	{/if}
</div>