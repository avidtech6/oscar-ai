<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db, getAllNotes, type Note, getNotesByTag, type Project } from '$lib/db';
	import { groqApiKey, groqModels } from '$lib/stores/settings';
	// Unified architecture imports
	import { actionExecutorService } from '$lib/services/unified/ActionExecutorService';
	import { unifiedIntentEngine } from '$lib/services/unified/UnifiedIntentEngine';
	import { projectContextStore } from '$lib/services/unified/ProjectContextStore';
	import { voiceRecordingService } from '$lib/services/unified/VoiceRecordingService';
	import { inferProjectFromMessage, resolvePronounReference } from '$lib/services/unified/ContextInferenceService';
	import { goto } from '$app/navigation';
	import { fade, slide } from 'svelte/transition';
	import MicButton from '$lib/components/MicButton.svelte';

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	let notes: Note[] = [];
	let projects: Project[] = [];
	let loading = true;
	let error = '';
	let searchQuery = '';
	let selectedTag = '';
	let allTags: string[] = [];
	let isRecording = false;
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];

	// Form state
	let showForm = false;
	let editingNote: Note | null = null;
	let noteForm = {
		title: '',
		content: '',
		tags: '',
		projectId: '',
		type: 'general' as 'general' | 'voice' | 'field'
	};

	// AI state
	let isProcessingAI = false;
	let aiAction = '';

	// Context inference and confirmation state
	let showContextSwitchPrompt = false;
	let contextSwitchMessage = '';
	let contextSwitchProjectId = '';
	let contextSwitchProjectName = '';
	
	let showConfirmationDialog = false;
	let confirmationMessage = '';
	let confirmationAction: () => void = () => {};
	let confirmationCancel: () => void = () => {};

	// Multi-select state
	let selectedNotes = new Set<string>();
	let showMultiSelectActions = false;
	let bulkAIPrompt = '';
	let bulkAIProcessing = false;
	let bulkAIResult = '';

	onMount(async () => {
		// Check for URL parameters (from AI actions)
		const urlParams = new URLSearchParams($page.url.search);
		const noteId = urlParams.get('note');
		const mode = urlParams.get('mode');
		
		await loadNotes();
		await loadProjects();
		
		// If note ID is provided, open it for editing
		if (noteId && mode === 'edit') {
			const allNotes = await getAllNotes();
			const note = allNotes.find(n => n.id === noteId);
			if (note) {
				openEditForm(note);
			}
		}
	});

	async function loadProjects() {
		try {
			projects = await db.projects.toArray();
		} catch (e) {
			console.error('Failed to load projects:', e);
		}
	}

	async function loadNotes() {
		loading = true;
		error = '';
		try {
			if (selectedTag) {
				notes = await getNotesByTag(selectedTag);
			} else if (searchQuery) {
				const all = await getAllNotes();
				notes = all.filter(n => 
					n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
					n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
				);
			} else {
				notes = await getAllNotes();
			}
			extractTags();
		} catch (e) {
			error = 'Failed to load notes';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	function extractTags() {
		const tagSet = new Set<string>();
		notes.forEach(note => {
			note.tags?.forEach(tag => tagSet.add(tag));
		});
		allTags = Array.from(tagSet).sort();
	}

	function openNewNoteForm() {
		editingNote = null;
		noteForm = {
			title: '',
			content: '',
			tags: '',
			projectId: '',
			type: 'general'
		};
		showForm = true;
	}

	function openEditForm(note: Note) {
		editingNote = note;
		noteForm = {
			title: note.title,
			content: note.content,
			tags: note.tags?.join(', ') || '',
			projectId: note.projectId || '',
			type: note.type || 'general'
		};
		showForm = true;
	}

	async function saveNote() {
		if (!noteForm.title.trim()) return;
		
		error = '';
		const tags = noteForm.tags.split(',').map(t => t.trim()).filter(t => t);
		
		try {
			if (editingNote) {
				await db.notes.update(editingNote.id!, {
					title: noteForm.title,
					content: noteForm.content,
					tags,
					projectId: noteForm.projectId || undefined,
					type: noteForm.type,
					updatedAt: new Date()
				});
			} else {
				await db.notes.add({
					title: noteForm.title,
					content: noteForm.content,
					tags,
					projectId: noteForm.projectId || undefined,
					type: noteForm.type,
					createdAt: new Date(),
					updatedAt: new Date()
				});
			}
			
			showForm = false;
			editingNote = null;
			await loadNotes();
		} catch (e) {
			error = 'Failed to save note';
			console.error(e);
		}
	}

	async function deleteNote(note: Note) {
		if (!confirm('Are you sure you want to delete this note?')) return;
		
		try {
			await db.notes.delete(note.id!);
			await loadNotes();
		} catch (e) {
			error = 'Failed to delete note';
			console.error(e);
		}
	}

	async function startRecording() {
		try {
			// Use unified voice recording service with intent detection
			const success = await voiceRecordingService.startRecordingWithIntentDetection(
				{
					autoTranscribe: true,
					maxDuration: 30000, // 30 seconds max for notes
				},
				{
					onTranscription: (text: string, isFinal: boolean) => {
						if (isFinal && text.trim()) {
							// Add transcription to note content
							noteForm.content += (noteForm.content ? '\n\n' : '') + text;
							noteForm.type = 'voice';
						}
					},
					onIntentDetected: (intentResult: any) => {
						// Log intent detection for voice notes
						console.log('Voice intent detected in notes:', intentResult);
					},
					onError: (errorMsg: string) => {
						error = `Voice recording error: ${errorMsg}`;
					}
				}
			);
			
			if (success) {
				isRecording = true;
			} else {
				error = 'Failed to start recording';
			}
		} catch (e) {
			error = 'Failed to start recording';
			console.error(e);
		}
	}

	function stopRecording() {
		if (isRecording) {
			voiceRecordingService.stopRecording();
			isRecording = false;
		}
	}

	async function transcribeAudio(audioBlob: Blob) {
		isProcessingAI = true;
		aiAction = 'Transcribing voice note...';
		
		try {
			if (!apiKey) {
				error = 'Please set your Groq API key in Settings';
				return;
			}
			
			// Convert blob to base64
			const reader = new FileReader();
			const base64Promise = new Promise<string>((resolve) => {
				reader.onloadend = () => {
					const base64 = reader.result as string;
					resolve(base64.split(',')[1]);
				};
			});
			reader.readAsDataURL(audioBlob);
			const base64Audio = await base64Promise;
			
			const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
				},
				body: new FormData()
					.append('file', audioBlob, 'audio.webm')
					.append('model', 'whisper-large-v3')
			});
			
			if (!response.ok) {
				throw new Error('Transcription failed');
			}
			
			const data = await response.json();
			
			// Add transcription to current note or create new one
			if (editingNote) {
				noteForm.content += '\n\n' + data.text;
			} else {
				noteForm.content = data.text;
				noteForm.type = 'voice';
			}
		} catch (e) {
			error = 'Failed to transcribe audio';
			console.error(e);
		} finally {
			isProcessingAI = false;
			aiAction = '';
		}
	}

	// Helper functions for context inference and confirmation
	function showContextSwitchPromptFn(projectId: string, projectName: string, message: string) {
		contextSwitchProjectId = projectId;
		contextSwitchProjectName = projectName;
		contextSwitchMessage = message;
		showContextSwitchPrompt = true;
	}

	function hideContextSwitchPrompt() {
		showContextSwitchPrompt = false;
		contextSwitchMessage = '';
		contextSwitchProjectId = '';
		contextSwitchProjectName = '';
	}

	function switchToProjectContext() {
	 if (contextSwitchProjectId) {
	   projectContextStore.setCurrentProject(contextSwitchProjectId);
	   hideContextSwitchPrompt();
	 }
}

	function showConfirmationDialogFn(message: string, action: () => void, cancel?: () => void) {
		confirmationMessage = message;
		confirmationAction = action;
		confirmationCancel = cancel || (() => {});
		showConfirmationDialog = true;
	}

	function hideConfirmationDialog() {
		showConfirmationDialog = false;
		confirmationMessage = '';
		confirmationAction = () => {};
		confirmationCancel = () => {};
	}

	function confirmAction() {
		confirmationAction();
		hideConfirmationDialog();
	}

	function cancelAction() {
		confirmationCancel();
		hideConfirmationDialog();
	}

	async function aiSummarize() {
		if (!noteForm.content.trim()) return;
		
		isProcessingAI = true;
		aiAction = 'Summarizing...';
		
		try {
			// Get current context from unified ProjectContextStore
			const hasCurrentProject = !!$projectContextStore.currentProjectId;
			
			// Prepare the AI request
			const userMessage = `Summarize the following note concisely:\n\n${noteForm.content}`;
			
			// Check for project references in the note content
			const inferredProject = inferProjectFromMessage(noteForm.content, projects);
			if (inferredProject && !hasCurrentProject) {
				// Show context switch prompt
				showContextSwitchPromptFn(
					inferredProject.id,
					inferredProject.name,
					`This note mentions "${inferredProject.name}". Would you like to switch to Project Mode for this action?`
				);
				return;
			}
			
			// Use unified intent engine to detect intent
			const intentResult = await unifiedIntentEngine.detectIntent(userMessage);
			
			// Execute using unified action executor
			const result = await actionExecutorService.execute(intentResult, {
				content: noteForm.content,
				noteId: editingNote?.id,
				noteTitle: noteForm.title,
				action: 'summarize'
			});
			
			if (result.success) {
				// If we're in General Chat mode, we might get conversion options instead of direct result
				if (!hasCurrentProject && result.requiresConfirmation) {
					// Show conversion options dialog
					showConfirmationDialogFn(
						`AI can't directly modify notes in General Chat mode. Choose an option:`,
						() => {
							// User confirmed - use the message as content
							if (result.message) {
								noteForm.content = result.message;
							}
						},
						() => {
							// User cancelled
							console.log('User cancelled conversion');
						}
					);
				} else if (result.message) {
					noteForm.content = result.message;
				}
			} else {
				error = result.message || 'Failed to summarize';
			}
		} catch (e) {
			error = 'Failed to summarize';
			console.error(e);
		} finally {
			isProcessingAI = false;
			aiAction = '';
		}
	}

	async function aiExpand() {
		if (!noteForm.content.trim()) return;
		
		isProcessingAI = true;
		aiAction = 'Expanding...';
		
		try {
			// Get current context from unified ProjectContextStore
			const hasCurrentProject = !!$projectContextStore.currentProjectId;
			
			// Prepare the AI request
			const userMessage = `Expand and elaborate on the following note with more detail:\n\n${noteForm.content}`;
			
			// Check for project references in the note content
			const inferredProject = inferProjectFromMessage(noteForm.content, projects);
			if (inferredProject && !hasCurrentProject) {
				// Show context switch prompt
				showContextSwitchPromptFn(
					inferredProject.id,
					inferredProject.name,
					`This note mentions "${inferredProject.name}". Would you like to switch to Project Mode for this action?`
				);
				return;
			}
			
			// Use unified intent engine to detect intent
			const intentResult = await unifiedIntentEngine.detectIntent(userMessage);
			
			// Execute using unified action executor
			const result = await actionExecutorService.execute(intentResult, {
				content: noteForm.content,
				noteId: editingNote?.id,
				noteTitle: noteForm.title,
				action: 'expand'
			});
			
			if (result.success) {
				// If we're in General Chat mode, we might get conversion options instead of direct result
				if (!hasCurrentProject && result.requiresConfirmation) {
					// Show conversion options dialog
					showConfirmationDialogFn(
						`AI can't directly modify notes in General Chat mode. Choose an option:`,
						() => {
							// User confirmed - use the message as content
							if (result.message) {
								noteForm.content = result.message;
							}
						},
						() => {
							// User cancelled
							console.log('User cancelled conversion');
						}
					);
				} else if (result.message) {
					noteForm.content = result.message;
				}
			} else {
				error = result.message || 'Failed to expand';
			}
		} catch (e) {
			error = 'Failed to expand';
			console.error(e);
		} finally {
			isProcessingAI = false;
			aiAction = '';
		}
	}

	// Per-item AI interaction
	let aiPromptForNote: string | null = null;
	let aiPromptText = '';
	let aiPromptProcessing = false;
	let aiPromptResult = '';

	async function openAIPrompt(noteId: string) {
		aiPromptForNote = noteId;
		aiPromptText = '';
		aiPromptResult = '';
	}

	function closeAIPrompt() {
		aiPromptForNote = null;
		aiPromptText = '';
		aiPromptResult = '';
	}

	async function submitAIPrompt() {
		if (!aiPromptText.trim() || !aiPromptForNote) return;
		
		aiPromptProcessing = true;
		aiPromptResult = '';
		
		try {
			const note = notes.find(n => n.id === aiPromptForNote);
			if (!note) {
				error = 'Note not found';
				return;
			}
			
			// Get current context from unified ProjectContextStore
			const hasCurrentProject = !!$projectContextStore.currentProjectId;
			
			// Prepare the AI request with note context
			const userMessage = `Regarding the note titled "${note.title}" with content: ${note.content}\n\n${aiPromptText}`;
			
			// Check for project references in the note content and prompt
			const combinedText = note.content + ' ' + aiPromptText;
			const inferredProject = inferProjectFromMessage(combinedText, projects);
			if (inferredProject && !hasCurrentProject) {
				// Show context switch prompt
				showContextSwitchPromptFn(
					inferredProject.id,
					inferredProject.name,
					`This note mentions "${inferredProject.name}". Would you like to switch to Project Mode for this action?`
				);
				return;
			}
			
			// Use unified intent engine to detect intent
			const intentResult = await unifiedIntentEngine.detectIntent(userMessage);
			
			// Execute using unified action executor
			const result = await actionExecutorService.execute(intentResult, {
				content: note.content,
				noteId: note.id,
				noteTitle: note.title,
				noteTags: note.tags,
				noteType: note.type,
				prompt: aiPromptText,
				action: 'process_prompt'
			});
			
			if (result.success) {
				// If we're in General Chat mode, we might get conversion options instead of direct result
				if (!hasCurrentProject && result.requiresConfirmation) {
					// Show conversion options dialog
					showConfirmationDialogFn(
						`AI can't directly modify notes in General Chat mode. Choose an option:`,
						() => {
							// User confirmed - use the message as content
							if (result.message) {
								aiPromptResult = result.message;
							}
						},
						() => {
							// User cancelled
							console.log('User cancelled conversion');
						}
					);
				} else if (result.message) {
					aiPromptResult = result.message;
				}
			} else {
				error = result.message || 'Failed to process AI request';
			}
		} catch (e) {
			error = 'Failed to process AI request';
			console.error(e);
		} finally {
			aiPromptProcessing = false;
		}
	}

	async function applyAIResultToNote() {
		if (!aiPromptForNote || !aiPromptResult) return;
		
		try {
			const note = notes.find(n => n.id === aiPromptForNote);
			if (!note) return;
			
			// Update the note with the AI result
			await db.notes.update(note.id!, {
				content: note.content + '\n\n---\n\nAI Response:\n' + aiPromptResult,
				updatedAt: new Date()
			});
			
			await loadNotes();
			closeAIPrompt();
		} catch (e) {
			error = 'Failed to update note';
			console.error(e);
		}
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getProjectName(projectId?: string) {
		if (!projectId) return null;
		const project = projects.find(p => p.id === projectId);
		return project?.name || null;
	}

	function getTypeColor(type: string) {
		switch (type) {
			case 'voice': return 'bg-purple-100 text-purple-800';
			case 'field': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	// Multi-select functions
	function toggleNoteSelection(noteId: string) {
		if (selectedNotes.has(noteId)) {
			selectedNotes.delete(noteId);
		} else {
			selectedNotes.add(noteId);
		}
		showMultiSelectActions = selectedNotes.size > 0;
	}

	function selectAllNotes() {
		selectedNotes.clear();
		notes.forEach(note => {
			if (note.id) selectedNotes.add(note.id);
		});
		showMultiSelectActions = true;
	}

	function clearSelection() {
		selectedNotes.clear();
		showMultiSelectActions = false;
	}

	function getSelectedNotes(): Note[] {
		return notes.filter(note => note.id && selectedNotes.has(note.id));
	}

	async function deleteSelectedNotes() {
		const selected = getSelectedNotes();
		if (selected.length === 0) return;
		
		if (!confirm(`Are you sure you want to delete ${selected.length} note${selected.length !== 1 ? 's' : ''}?`)) {
			return;
		}
		
		try {
			for (const note of selected) {
				if (note.id) {
					await db.notes.delete(note.id);
				}
			}
			await loadNotes();
			clearSelection();
		} catch (e) {
			error = 'Failed to delete notes';
			console.error(e);
		}
	}

	async function tagSelectedNotes() {
		const selected = getSelectedNotes();
		if (selected.length === 0) return;
		
		const tag = prompt('Enter tag to add to selected notes:');
		if (!tag) return;
		
		try {
			for (const note of selected) {
				if (note.id) {
					const currentTags = note.tags || [];
					if (!currentTags.includes(tag)) {
						await db.notes.update(note.id, {
							tags: [...currentTags, tag],
							updatedAt: new Date()
						});
					}
				}
			}
			await loadNotes();
		} catch (e) {
			error = 'Failed to tag notes';
			console.error(e);
		}
	}

	function openBulkAIPrompt() {
		bulkAIPrompt = '';
		bulkAIResult = '';
	}

	function closeBulkAIPrompt() {
		bulkAIPrompt = '';
		bulkAIResult = '';
	}

	async function processBulkAIPrompt() {
		if (!bulkAIPrompt.trim() || selectedNotes.size === 0) return;
		
		bulkAIProcessing = true;
		bulkAIResult = '';
		
		try {
			const selected = getSelectedNotes();
			if (selected.length === 0) return;
			
			// Get current context from unified ProjectContextStore
			const hasCurrentProject = !!$projectContextStore.currentProjectId;
			
			// Prepare combined content from all selected notes
			const combinedContent = selected.map(note =>
				`Note: "${note.title}"\n${note.content}\n---`
			).join('\n\n');
			
			// Prepare the AI request
			const userMessage = `Regarding the following ${selected.length} note${selected.length !== 1 ? 's' : ''}:\n\n${combinedContent}\n\n${bulkAIPrompt}`;
			
			// Check for project references
			const allContent = combinedContent + ' ' + bulkAIPrompt;
			const inferredProject = inferProjectFromMessage(allContent, projects);
			if (inferredProject && !hasCurrentProject) {
				// Show context switch prompt
				showContextSwitchPromptFn(
					inferredProject.id,
					inferredProject.name,
					`These notes mention "${inferredProject.name}". Would you like to switch to Project Mode for this action?`
				);
				return;
			}
			
			// Use unified intent engine to detect intent
			const intentResult = await unifiedIntentEngine.detectIntent(userMessage);
			
			// Execute using unified action executor
			const result = await actionExecutorService.execute(intentResult, {
				content: combinedContent,
				noteIds: selected.map(n => n.id).filter(Boolean) as string[],
				noteTitle: `Bulk action on ${selected.length} notes`,
				prompt: bulkAIPrompt,
				action: 'bulk_process'
			});
			
			if (result.success) {
				if (!hasCurrentProject && result.requiresConfirmation) {
					// Show conversion options dialog
					showConfirmationDialogFn(
						`AI can't directly modify notes in General Chat mode. Choose an option:`,
						() => {
							// User confirmed - use the message as content
							if (result.message) {
								bulkAIResult = result.message;
							}
						},
						() => {
							console.log('User cancelled conversion');
						}
					);
				} else if (result.message) {
					bulkAIResult = result.message;
				}
			} else {
				error = result.message || 'Failed to process bulk AI request';
			}
		} catch (e) {
			error = 'Failed to process bulk AI request';
			console.error(e);
		} finally {
			bulkAIProcessing = false;
		}
	}

	async function applyBulkAIResult() {
		if (!bulkAIResult || selectedNotes.size === 0) return;
		
		try {
			const selected = getSelectedNotes();
			for (const note of selected) {
				if (note.id) {
					await db.notes.update(note.id, {
						content: note.content + '\n\n---\n\nBulk AI Response:\n' + bulkAIResult,
						updatedAt: new Date()
					});
				}
			}
			await loadNotes();
			closeBulkAIPrompt();
		} catch (e) {
			error = 'Failed to update notes';
			console.error(e);
		}
	}

	$: if (selectedTag !== undefined || searchQuery !== undefined) {
		loadNotes();
	}

	$: showMultiSelectActions = selectedNotes.size > 0;
</script>

<!-- Context Switch Prompt Modal -->
{#if showContextSwitchPrompt}
	<div class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" transition:fade>
		<div class="bg-white rounded-lg shadow-xl w-full max-w-md" transition:slide>
			<div class="px-6 py-4 border-b">
				<h3 class="text-lg font-semibold text-gray-900">Switch to Project Mode?</h3>
			</div>
			
			<div class="p-6">
				<p class="text-gray-700 mb-4">{contextSwitchMessage}</p>
				<p class="text-sm text-gray-600 mb-6">
					Project Mode allows AI to directly modify notes and tasks within this project.
				</p>
				
				<div class="flex gap-3">
					<button
						on:click={hideContextSwitchPrompt}
						class="btn btn-secondary flex-1"
					>
						Stay in General Chat
					</button>
					<button
						on:click={switchToProjectContext}
						class="btn btn-primary flex-1"
					>
						Switch to {contextSwitchProjectName}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Confirmation Dialog Modal -->
{#if showConfirmationDialog}
	<div class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" transition:fade>
		<div class="bg-white rounded-lg shadow-xl w-full max-w-md" transition:slide>
			<div class="px-6 py-4 border-b">
				<h3 class="text-lg font-semibold text-gray-900">AI Action Required</h3>
			</div>
			
			<div class="p-6">
				<p class="text-gray-700 mb-4">{confirmationMessage}</p>
				<p class="text-sm text-gray-600 mb-6">
					In General Chat mode, AI can only provide conversion options. Switch to Project Mode for direct modifications.
				</p>
				
				<div class="flex gap-3">
					<button
						on:click={cancelAction}
						class="btn btn-secondary flex-1"
					>
						Cancel
					</button>
					<button
						on:click={confirmAction}
						class="btn btn-primary flex-1"
					>
						Use Conversion
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<svelte:head>
	<title>Notes - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Notes</h1>
			<p class="text-gray-600">Create and manage your notes with AI assistance</p>
		</div>
		<button on:click={openNewNoteForm} class="btn btn-primary">
			+ New Note
		</button>
	</div>

	<!-- Persistent AI Prompt Box -->
	<div class="mb-6">
		<div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
			<div class="flex items-center gap-3 mb-2">
				<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
				</svg>
				<h3 class="text-sm font-medium text-blue-900">AI Assistant</h3>
			</div>
			<p class="text-sm text-blue-700 mb-3">Ask AI to help with your notes. Select notes first for bulk actions.</p>
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={bulkAIPrompt}
					placeholder="Ask AI to summarize, organize, or analyze notes..."
					class="input flex-1 text-sm"
					on:keydown={(e) => e.key === 'Enter' && processBulkAIPrompt()}
				/>
				<button
					on:click={processBulkAIPrompt}
					disabled={bulkAIProcessing || !bulkAIPrompt.trim()}
					class="btn btn-primary text-sm"
				>
					{#if bulkAIProcessing}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Processing
					{:else}
						Ask AI
					{/if}
				</button>
			</div>
			<div class="mt-3 flex flex-wrap gap-2">
				<button
					on:click={() => bulkAIPrompt = 'Summarize the key points from these notes'}
					class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
				>
					Summarize
				</button>
				<button
					on:click={() => bulkAIPrompt = 'Find common themes across these notes'}
					class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
				>
					Find Themes
				</button>
				<button
					on:click={() => bulkAIPrompt = 'Create action items from these notes'}
					class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
				>
					Action Items
				</button>
				<button
					on:click={() => bulkAIPrompt = 'Organize these notes into categories'}
					class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
				>
					Organize
				</button>
			</div>
		</div>
	</div>

	<!-- Error -->
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	<!-- Search and Filter -->
	<div class="mb-6 flex flex-col md:flex-row gap-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search notes..."
			class="input flex-1"
		/>
		
		{#if allTags.length > 0}
			<select
				bind:value={selectedTag}
				class="input w-full md:w-48"
			>
				<option value="">All Tags</option>
				{#each allTags as tag}
					<option value={tag}>{tag}</option>
				{/each}
			</select>
		{/if}
	</div>

	<!-- Multi-select Actions Bar -->
	{#if showMultiSelectActions}
		<div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<span class="font-medium text-blue-800">
						{selectedNotes.size} note{selectedNotes.size !== 1 ? 's' : ''} selected
					</span>
					<div class="flex gap-2">
						<button
							on:click={tagSelectedNotes}
							class="btn btn-secondary text-sm"
						>
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
							</svg>
							Add Tag
						</button>
						<button
							on:click={openBulkAIPrompt}
							class="btn btn-primary text-sm"
						>
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
							</svg>
							AI Action
						</button>
						<button
							on:click={deleteSelectedNotes}
							class="btn btn-danger text-sm"
						>
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
							</svg>
							Delete
						</button>
					</div>
				</div>
				<button
					on:click={clearSelection}
					class="text-blue-600 hover:text-blue-800 text-sm"
				>
					Clear Selection
				</button>
			</div>
		</div>
	{:else if notes.length > 0}
		<div class="mb-4 flex justify-between items-center">
			<button
				on:click={selectAllNotes}
				class="text-sm text-gray-600 hover:text-gray-900"
			>
				<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				Select All
			</button>
		</div>
	{/if}

	<!-- Loading -->
	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500">Loading notes...</p>
		</div>
	<!-- Empty State -->
	{:else if notes.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500 mb-4">No notes yet</p>
			<button on:click={openNewNoteForm} class="btn btn-primary">
				Create Your First Note
			</button>
		</div>
	<!-- Notes List -->
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each notes as note (note.id)}
				<div class="card p-4 hover:shadow-md transition-shadow {selectedNotes.has(note.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}">
					<div class="flex items-start gap-3 mb-2">
						<!-- Checkbox for selection -->
						<input
							type="checkbox"
							checked={selectedNotes.has(note.id)}
							on:change={() => note.id && toggleNoteSelection(note.id)}
							class="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
						/>
						
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between">
								<h3 class="font-semibold text-gray-900 truncate flex-1 cursor-pointer" on:click={() => openEditForm(note)}>{note.title}</h3>
								<div class="flex gap-1">
									<button
										on:click|stopPropagation={() => note.id && openAIPrompt(note.id)}
										class="text-gray-400 hover:text-forest-600 p-1"
										title="Ask AI about this note"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
									</button>
									<button
										on:click|stopPropagation={() => deleteNote(note)}
										class="text-gray-400 hover:text-red-500 p-1"
										title="Delete note"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
										</svg>
									</button>
								</div>
							</div>
							
							<p class="text-gray-600 text-sm line-clamp-3 mb-3 cursor-pointer" on:click={() => openEditForm(note)}>{note.content}</p>
							
							<div class="flex flex-wrap gap-1 mb-2">
								{#if note.type}
									<span class="px-2 py-0.5 text-xs rounded {getTypeColor(note.type)}">
										{note.type}
									</span>
								{/if}
								{#each (note.tags || []).slice(0, 3) as tag}
									<span class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
										{tag}
									</span>
								{/each}
							</div>
							
							<div class="flex items-center justify-between text-xs text-gray-500">
								<span>{formatDate(note.updatedAt)}</span>
								{#if getProjectName(note.projectId)}
									<span class="text-forest-600">{getProjectName(note.projectId)}</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Note Form Modal -->
{#if showForm}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade>
		<div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" transition:slide>
			<!-- Header -->
			<div class="px-6 py-4 border-b flex items-center justify-between">
				<h2 class="text-lg font-semibold">
					{editingNote ? 'Edit Note' : 'New Note'}
				</h2>
				<button on:click={() => showForm = false} class="text-gray-400 hover:text-gray-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			
			<!-- Form -->
			<div class="flex-1 overflow-y-auto p-6 space-y-4">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
					<input
						id="title"
						type="text"
						bind:value={noteForm.title}
						placeholder="Note title"
						class="input w-full"
						required
					/>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
						<select id="type" bind:value={noteForm.type} class="input w-full">
							<option value="general">General</option>
							<option value="voice">Voice Note</option>
							<option value="field">Field Note</option>
						</select>
					</div>
					
					<div>
						<label for="project" class="block text-sm font-medium text-gray-700 mb-1">Link to Project</label>
						<select id="project" bind:value={noteForm.projectId} class="input w-full">
							<option value="">None</option>
							{#each projects as project}
								<option value={project.id}>{project.name}</option>
							{/each}
						</select>
					</div>
				</div>
				
				<div>
					<label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
					<input
						id="tags"
						type="text"
						bind:value={noteForm.tags}
						placeholder="e.g., important, meeting, idea"
						class="input w-full"
					/>
				</div>
				
				<div>
					<div class="flex items-center justify-between mb-1">
						<label for="content" class="block text-sm font-medium text-gray-700">Content</label>
						
						<!-- AI Tools -->
						<div class="flex gap-2">
							<button
								on:click={aiSummarize}
								disabled={isProcessingAI || !noteForm.content.trim()}
								class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
							>
								{isProcessingAI && aiAction === 'Summarizing...' ? 'Processing...' : 'Summarize'}
							</button>
							<button
								on:click={aiExpand}
								disabled={isProcessingAI || !noteForm.content.trim()}
								class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
							>
								{isProcessingAI && aiAction === 'Expanding...' ? 'Processing...' : 'Expand'}
							</button>
						</div>
					</div>
					<textarea
						id="content"
						bind:value={noteForm.content}
						placeholder="Write your note here..."
						rows="10"
						class="input w-full resize-none"
					></textarea>
					<div class="mt-2">
						<MicButton on:transcript={(e) => noteForm.content += e.detail.text} />
					</div>
				</div>
				
				<!-- Voice Recording -->
				<div class="flex items-center gap-4">
					{#if !isRecording}
						<button
							on:click={startRecording}
							class="btn btn-secondary flex items-center gap-2"
						>
							<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
								<path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
							</svg>
							Record Voice
						</button>
					{:else}
						<button
							on:click={stopRecording}
							class="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
						>
							<span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
							Stop Recording
						</button>
						<span class="text-sm text-red-600">Recording...</span>
					{/if}
					
					{#if isProcessingAI}
						<span class="text-sm text-forest-600">{aiAction}</span>
					{/if}
				</div>
			</div>
			
			<!-- Footer -->
			<div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
				<button on:click={() => showForm = false} class="btn btn-secondary">
					Cancel
				</button>
				<button on:click={saveNote} class="btn btn-primary">
					{editingNote ? 'Save Changes' : 'Create Note'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

<!-- AI Prompt Modal -->
{#if aiPromptForNote}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade>
		<div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" transition:slide>
			<!-- Header -->
			<div class="px-6 py-4 border-b flex items-center justify-between">
				<h2 class="text-lg font-semibold">
					Ask AI About Note
				</h2>
				<button on:click={closeAIPrompt} class="text-gray-400 hover:text-gray-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			
			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6 space-y-4">
				{#if aiPromptForNote}
					{#each notes.filter(n => n.id === aiPromptForNote) as note}
						<div class="bg-gray-50 p-4 rounded-lg mb-4">
							<h3 class="font-medium text-gray-900 mb-2">{note.title}</h3>
							<p class="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
							<div class="mt-2 text-xs text-gray-500">
								<span>Type: {note.type}</span>
								{#if note.tags && note.tags.length > 0}
									<span class="ml-4">Tags: {note.tags.join(', ')}</span>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
				
				<div>
					<label for="aiPrompt" class="block text-sm font-medium text-gray-700 mb-1">
						What would you like the AI to do with this note?
					</label>
					<textarea
						id="aiPrompt"
						bind:value={aiPromptText}
						placeholder="e.g., Summarize this note, Expand on this idea, Translate to Spanish, Create action items..."
						rows="3"
						class="input w-full resize-none"
						disabled={aiPromptProcessing}
					></textarea>
					<p class="text-xs text-gray-500 mt-1">
						Try: "Summarize", "Expand", "Create bullet points", "Translate", "Fix grammar", "Make more professional"
					</p>
				</div>
				
				{#if aiPromptResult}
					<div class="border-t pt-4">
						<h4 class="text-sm font-medium text-gray-700 mb-2">AI Response:</h4>
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<p class="text-gray-700 whitespace-pre-wrap text-sm">{aiPromptResult}</p>
						</div>
						<div class="mt-4 flex gap-3">
							<button
								on:click={applyAIResultToNote}
								class="btn btn-primary"
							>
								Add to Note
							</button>
							<button
								on:click={() => aiPromptResult = ''}
								class="btn btn-secondary"
							>
								Ask Another Question
							</button>
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Footer -->
			<div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
				<button on:click={closeAIPrompt} class="btn btn-secondary">
					Cancel
				</button>
				<button
					on:click={submitAIPrompt}
					class="btn btn-primary"
					disabled={aiPromptProcessing || !aiPromptText.trim()}
				>
					{#if aiPromptProcessing}
						<svg class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Processing...
					{:else}
						Ask AI
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Bulk AI Prompt Modal -->
{#if showMultiSelectActions && bulkAIPrompt !== undefined}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" transition:fade>
		<div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" transition:slide>
			<!-- Header -->
			<div class="px-6 py-4 border-b flex items-center justify-between">
				<h2 class="text-lg font-semibold">
					AI Action on {selectedNotes.size} Note{selectedNotes.size !== 1 ? 's' : ''}
				</h2>
				<button on:click={closeBulkAIPrompt} class="text-gray-400 hover:text-gray-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			
			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6 space-y-4">
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h3 class="font-medium text-blue-900 mb-2">Selected Notes:</h3>
					<ul class="text-sm text-blue-800 space-y-1">
						{#each getSelectedNotes() as note}
							<li class="truncate">• {note.title}</li>
						{/each}
					</ul>
				</div>
				
				<div>
					<label for="bulkAIPrompt" class="block text-sm font-medium text-gray-700 mb-1">
						What would you like the AI to do with these notes?
					</label>
					<textarea
						id="bulkAIPrompt"
						bind:value={bulkAIPrompt}
						placeholder="e.g., Summarize all notes, Find common themes, Create a combined report, Extract action items..."
						rows="4"
						class="input w-full resize-none"
						disabled={bulkAIProcessing}
					></textarea>
					<p class="text-xs text-gray-500 mt-1">
						Try: "Summarize key points", "Find common themes", "Create a combined report", "Extract action items", "Compare and contrast"
					</p>
				</div>
				
				{#if bulkAIResult}
					<div class="border-t pt-4">
						<h4 class="text-sm font-medium text-gray-700 mb-2">AI Response:</h4>
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<p class="text-gray-700 whitespace-pre-wrap text-sm">{bulkAIResult}</p>
						</div>
						<div class="mt-4 flex gap-3">
							<button
								on:click={applyBulkAIResult}
								class="btn btn-primary"
							>
								Add to All Notes
							</button>
							<button
								on:click={() => bulkAIResult = ''}
								class="btn btn-secondary"
							>
								Ask Another Question
							</button>
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Footer -->
			<div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
				<button on:click={closeBulkAIPrompt} class="btn btn-secondary">
					Cancel
				</button>
				<button
					on:click={processBulkAIPrompt}
					class="btn btn-primary"
					disabled={bulkAIProcessing || !bulkAIPrompt.trim()}
				>
					{#if bulkAIProcessing}
						<svg class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Processing...
					{:else}
						Ask AI
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
