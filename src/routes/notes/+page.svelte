<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db, getAllNotes, type Note, getNotesByTag } from '$lib/db';
	import { groqApiKey, groqModels } from '$lib/stores/settings';
	import { goto } from '$app/navigation';
	import { fade, slide } from 'svelte/transition';
	import MicButton from '$lib/components/MicButton.svelte';

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	let notes: Note[] = [];
	let projects: any[] = [];
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
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];
			
			mediaRecorder.ondataavailable = (e) => {
				audioChunks.push(e.data);
			};
			
			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				await transcribeAudio(audioBlob);
				stream.getTracks().forEach(track => track.stop());
			};
			
			mediaRecorder.start();
			isRecording = true;
		} catch (e) {
			error = 'Failed to start recording';
			console.error(e);
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
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

	async function aiSummarize() {
		if (!noteForm.content.trim()) return;
		
		isProcessingAI = true;
		aiAction = 'Summarizing...';
		
		try {
			if (!apiKey) {
				error = 'Please set your Groq API key in Settings';
				return;
			}
			
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-70b-versatile',
					messages: [
						{
							role: 'user',
							content: `Summarize the following note concisely:\n\n${noteForm.content}`
						}
					],
					temperature: 0.3
				})
			});
			
			if (!response.ok) {
				throw new Error('AI request failed');
			}
			
			const data = await response.json();
			noteForm.content = data.choices[0].message.content;
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
			if (!apiKey) {
				error = 'Please set your Groq API key in Settings';
				return;
			}
			
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-70b-versatile',
					messages: [
						{
							role: 'user',
							content: `Expand and elaborate on the following note with more detail:\n\n${noteForm.content}`
						}
					],
					temperature: 0.7
				})
			});
			
			if (!response.ok) {
				throw new Error('AI request failed');
			}
			
			const data = await response.json();
			noteForm.content = data.choices[0].message.content;
		} catch (e) {
			error = 'Failed to expand';
			console.error(e);
		} finally {
			isProcessingAI = false;
			aiAction = '';
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

	$: if (selectedTag !== undefined || searchQuery !== undefined) {
		loadNotes();
	}
</script>

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
				<div class="card p-4 hover:shadow-md transition-shadow cursor-pointer" on:click={() => openEditForm(note)} transition:fade>
					<div class="flex items-start justify-between mb-2">
						<h3 class="font-semibold text-gray-900 truncate flex-1">{note.title}</h3>
						<button
							on:click|stopPropagation={() => deleteNote(note)}
							class="text-gray-400 hover:text-red-500 p-1"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
							</svg>
						</button>
					</div>
					
					<p class="text-gray-600 text-sm line-clamp-3 mb-3">{note.content}</p>
					
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
