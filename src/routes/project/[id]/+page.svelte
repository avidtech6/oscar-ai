<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { db } from '$lib/db';
	import type { Project, Tree, Note, Photo } from '$lib/db';
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
	import AIReviewChat from '$lib/components/ai/AIReviewChat.svelte';
	import { getProjectReviewStatus } from '$lib/services/projectReview';
	import PhotoCapture from '$lib/components/project/PhotoCapture.svelte';
	import ProjectDashboard from '$lib/components/project/ProjectDashboard.svelte';
	import TabSystem from '$lib/components/project/TabSystem.svelte';
	import TreeModal from '$lib/components/project/TreeModal.svelte';
	import UnifiedAIPrompt from '$lib/components/ai/UnifiedAIPrompt.svelte';

	let projectId = '';
	let project: Project | undefined;
	let trees: Tree[] = [];
	let notes: Note[] = [];
	let photos: Photo[] = [];
	let activeTab = 'trees';
	let loading = true;
	let saving = false;
	let error = '';
	
	// AI Review
	let showAIReview = false;
	let projectReviewStatus: { needsReview: boolean; issueCount: number; priority: 'high' | 'medium' | 'low' } | null = null;

	// Photo capture
	let showPhotoCapture = false;

	// Tree modal
	let showTreeModal = false;

	// Unified AI Prompt
	let showUnifiedAIPrompt = false;

	// Note form
	let newNote = {
		title: '',
		content: '',
		type: 'general' as 'general' | 'voice' | 'field'
	};

	onMount(async () => {
		projectId = $page.params.id;
		await loadProject();
	});

	async function loadProject() {
		loading = true;
		error = '';
		try {
			// Load project
			project = await db.projects.get(projectId);
			if (!project) {
				error = 'Project not found';
				return;
			}

			// Load trees
			trees = await db.trees.where('projectId').equals(projectId).toArray();

			// Load notes
			notes = await db.notes.where('projectId').equals(projectId).toArray();

			// Load photos
			photos = await db.photos.where('projectId').equals(projectId).toArray();

			// Load review status
			projectReviewStatus = await getProjectReviewStatus(projectId);
		} catch (e) {
			error = 'Failed to load project';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function saveProject() {
		saving = true;
		error = '';
		try {
			// Update project timestamp
			await db.projects.update(projectId, {
				updatedAt: new Date().toISOString()
			});
		} catch (e) {
			error = 'Failed to save';
			console.error(e);
		} finally {
			saving = false;
		}
	}

	async function addTree(treeData: {
		number: string;
		species: string;
		scientificName: string;
		DBH: number;
		height: number;
		age: string;
		category: 'A' | 'B' | 'C' | 'U' | '';
		condition: string;
		notes: string;
	}) {
		if (!treeData.number || !treeData.species) return;

		try {
			const treeId = await db.trees.add({
				projectId,
				number: treeData.number,
				species: treeData.species,
				scientificName: treeData.scientificName,
				DBH: treeData.DBH,
				height: treeData.height,
				age: treeData.age,
				category: treeData.category,
				condition: treeData.condition,
				notes: treeData.notes,
				RPA: treeData.DBH * 12,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});

			// Refresh trees list
			trees = await db.trees.where('projectId').equals(projectId).toArray();

			// Save project timestamp
			await saveProject();
		} catch (e) {
			error = 'Failed to add tree';
			console.error(e);
		}
	}

	async function deleteTree(treeId: number) {
		if (!confirm('Are you sure you want to delete this tree?')) return;

		try {
			await db.trees.delete(treeId);
			trees = await db.trees.where('projectId').equals(projectId).toArray();
			await saveProject();
		} catch (e) {
			error = 'Failed to delete tree';
			console.error(e);
		}
	}

	async function addNote() {
		if (!newNote.title || !newNote.content) return;

		try {
			await db.notes.add({
				projectId,
				title: newNote.title,
				content: newNote.content,
				type: newNote.type,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});

			// Refresh notes list
			notes = await db.notes.where('projectId').equals(projectId).toArray();

			// Reset form
			newNote = {
				title: '',
				content: '',
				type: 'general'
			};

			await saveProject();
		} catch (e) {
			error = 'Failed to add note';
			console.error(e);
		}
	}

	// Handle voice transcription from VoiceRecorder
	async function handleVoiceTranscript(event: CustomEvent<{ text: string; projectId: string }>) {
		const { text } = event.detail;
		
		try {
			// Create a note from the transcription
			const timestamp = new Date();
			const noteTitle = `Voice Note - ${timestamp.toLocaleDateString('en-GB')} ${timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
			
			await db.notes.add({
				projectId,
				title: noteTitle,
				content: text,
				type: 'voice',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});

			// Refresh notes list
			notes = await db.notes.where('projectId').equals(projectId).toArray();
			await saveProject();
		} catch (e) {
			error = 'Failed to save voice note';
			console.error(e);
		}
	}

	async function deleteNote(noteId: number) {
		if (!confirm('Are you sure you want to delete this note?')) return;

		try {
			await db.notes.delete(noteId);
			notes = await db.notes.where('projectId').equals(projectId).toArray();
			await saveProject();
		} catch (e) {
			error = 'Failed to delete note';
			console.error(e);
		}
	}

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'A': return 'bg-green-100 text-green-800';
			case 'B': return 'bg-blue-100 text-blue-800';
			case 'C': return 'bg-yellow-100 text-yellow-800';
			case 'U': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
		switch (priority) {
			case 'high': return 'bg-red-100 text-red-800 border-red-200';
			case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}

	function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
		switch (priority) {
			case 'high': return 'High Priority';
			case 'medium': return 'Medium Priority';
			case 'low': return 'Low Priority';
			default: return 'Needs Review';
		}
	}

	function toggleAIReview() {
		showAIReview = !showAIReview;
	}

	// Photo handling
	async function handlePhotoUpload(event: CustomEvent<{ filename: string; imageData: string; metadata: any }>) {
		try {
			const { filename, imageData, metadata } = event.detail;
			
			// Convert base64 to blob
			const byteCharacters = atob(imageData);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: 'image/jpeg' });
			
			// Save to database
			await db.photos.add({
				projectId,
				filename,
				blob,
				mimeType: 'image/jpeg',
				createdAt: new Date()
			});
			
			// Refresh photos list
			photos = await db.photos.where('projectId').equals(projectId).toArray();
			await saveProject();
		} catch (e) {
			error = 'Failed to save photo';
			console.error(e);
		}
	}

	async function deletePhoto(photoId: string) {
		if (!confirm('Are you sure you want to delete this photo?')) return;
		
		try {
			await db.photos.delete(photoId);
			photos = await db.photos.where('projectId').equals(projectId).toArray();
			await saveProject();
		} catch (e) {
			error = 'Failed to delete photo';
			console.error(e);
		}
	}

	// Get voice notes (notes with type 'voice')
	function getVoiceNotes() {
		return notes.filter(note => note.type === 'voice');
	}

	// Get all items for combined view
	function getAllItems() {
		const allItems = [
			...trees.map(tree => ({ ...tree, type: 'tree' as const })),
			...notes.map(note => ({ ...note, type: 'note' as const })),
			...photos.map(photo => ({ ...photo, type: 'photo' as const }))
		];
		
		// Sort by creation date (newest first)
		return allItems.sort((a, b) => {
			const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return dateB - dateA;
		});
	}
</script>

<svelte:head>
	<title>{project?.name || 'Project'} - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500">Loading project...</p>
		</div>
	{:else if !project}
		<div class="text-center py-12">
			<p class="text-gray-500">Project not found</p>
			<a href="/workspace" class="btn btn-primary mt-4">Back to Workspace</a>
		</div>
	{:else}
		<!-- Project Dashboard -->
		<ProjectDashboard
			{project}
			{projectReviewStatus}
			treesCount={trees.length}
			notesCount={notes.length}
			photosCount={photos.length}
			voiceNotesCount={getVoiceNotes().length}
			onBack={() => goto('/workspace')}
			onSave={saveProject}
			onToggleAIReview={toggleAIReview}
			onAddTree={() => showTreeModal = true}
			onAddNote={() => activeTab = 'notes'}
			onAddPhoto={() => showPhotoCapture = true}
			onAddVoiceNote={() => activeTab = 'voice'}
		/>

		<!-- Tab System -->
		<TabSystem
			{activeTab}
			tabs={[
				{ id: 'trees', label: 'Trees', count: trees.length },
				{ id: 'notes', label: 'Notes', count: notes.length },
				{ id: 'photos', label: 'Photos', count: photos.length },
				{ id: 'voice', label: 'Voice Notes', count: getVoiceNotes().length },
				{ id: 'all', label: 'All Items', count: getAllItems().length }
			]}
			onTabChange={(tabId) => activeTab = tabId}
		/>

		<!-- Trees Tab -->
		{#if activeTab === 'trees'}
			<!-- Trees List -->
			<div class="card">
				<div class="p-4 border-b border-gray-200 flex items-center justify-between">
					<h2 class="text-lg font-semibold">Tree Survey ({trees.length})</h2>
					<button
						on:click={() => showTreeModal = true}
						class="btn btn-primary"
					>
						<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
						</svg>
						Add Tree
					</button>
				</div>
				{#if trees.length === 0}
					<div class="p-8 text-center text-gray-500">
						<p>No trees added yet. Click "Add Tree" to add your first tree.</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DBH</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cat.</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RPA</th>
									<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each trees as tree}
									<tr class="hover:bg-gray-50">
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tree.number}</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{tree.species}
											{#if tree.scientificName}
												<span class="text-gray-400 italic"> ({tree.scientificName})</span>
											{/if}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tree.DBH}mm</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tree.height}m</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getCategoryColor(tree.category)}">
												{tree.category || '-'}
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tree.condition || '-'}</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tree.RPA}mm</td>
										<td class="px-6 py-4 whitespace-nowrap text-right text-sm">
											<button
												on:click={() => tree.id && deleteTree(tree.id)}
												class="text-red-600 hover:text-red-900"
											>
												Delete
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Notes Tab -->
		{#if activeTab === 'notes'}
			<!-- Voice Recorder -->
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Voice Note</h2>
				<p class="text-sm text-gray-600 mb-4">Record a voice note and it will be automatically transcribed using AI.</p>
				<VoiceRecorder
					{projectId}
					on:transcript={handleVoiceTranscript}
				/>
			</div>

			<!-- Add Note Form -->
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Add New Note</h2>
				<form on:submit|preventDefault={addNote} class="space-y-4">
					<div>
						<label for="noteTitle" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
						<input
							id="noteTitle"
							type="text"
							bind:value={newNote.title}
							placeholder="Note title"
							class="input w-full"
							required
						/>
					</div>
					<div>
						<label for="noteType" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
						<select id="noteType" bind:value={newNote.type} class="input w-full">
							<option value="general">General</option>
							<option value="field">Field Note</option>
							<option value="voice">Voice Note</option>
						</select>
					</div>
					<div>
						<label for="noteContent" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
						<textarea
							id="noteContent"
							bind:value={newNote.content}
							placeholder="Note content..."
							rows="4"
							class="input w-full"
							required
						></textarea>
					</div>
					<button type="submit" class="btn btn-primary">Add Note</button>
				</form>
			</div>

			<!-- Notes List -->
			<div class="card">
				<div class="p-4 border-b border-gray-200">
					<h2 class="text-lg font-semibold">Project Notes</h2>
				</div>
				{#if notes.length === 0}
					<div class="p-8 text-center text-gray-500">
						<p>No notes added yet. Add your first note above!</p>
					</div>
				{:else}
					<div class="divide-y divide-gray-200">
						{#each notes as note}
							<div class="p-4 hover:bg-gray-50">
								<div class="flex items-start justify-between">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="text-lg font-medium text-gray-900">{note.title}</h3>
											<span class="px-2 py-0.5 text-xs rounded-full
												{note.type === 'field' ? 'bg-green-100 text-green-800' :
												 note.type === 'voice' ? 'bg-purple-100 text-purple-800' :
												 'bg-gray-100 text-gray-800'}">
												{note.type}
											</span>
										</div>
										<p class="text-gray-600 whitespace-pre-wrap">{note.content}</p>
										<p class="text-xs text-gray-400 mt-2">
											{new Date(note.createdAt).toLocaleString()}
										</p>
										
									</div>
									<button
										on:click={() => note.id && deleteNote(note.id)}
										class="ml-4 text-red-600 hover:text-red-900"
									>
										Delete
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Photos Tab -->
		{#if activeTab === 'photos'}
			<!-- Photo Capture Button -->
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Add Photos</h2>
				<p class="text-sm text-gray-600 mb-4">Capture photos using your device camera or upload existing images.</p>
				<button
					on:click={() => showPhotoCapture = true}
					class="btn btn-primary"
				>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
					</svg>
					Take Photo
				</button>
			</div>

			<!-- Photos List -->
			<div class="card">
				<div class="p-4 border-b border-gray-200">
					<h2 class="text-lg font-semibold">Project Photos ({photos.length})</h2>
				</div>
				{#if photos.length === 0}
					<div class="p-8 text-center text-gray-500">
						<p>No photos added yet. Take your first photo above!</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
						{#each photos as photo}
							<div class="relative group">
								<div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
									{#if photo.blob instanceof Blob}
										<img
											src={URL.createObjectURL(photo.blob)}
											alt={photo.filename || 'Photo'}
											class="w-full h-full object-cover"
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center text-gray-400">
											<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
											</svg>
										</div>
									{/if}
								</div>
								<div class="mt-2">
									<p class="text-sm font-medium text-gray-900 truncate">{photo.filename}</p>
									<p class="text-xs text-gray-500">
										{#if photo.createdAt}
											{new Date(photo.createdAt).toLocaleDateString()}
										{/if}
									</p>
								</div>
								<button
									on:click={() => photo.id && deletePhoto(photo.id)}
									class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									title="Delete photo"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/if}

	<!-- Photo Capture Modal -->
	{#if showPhotoCapture}
		<PhotoCapture
			isOpen={showPhotoCapture}
			projectId={projectId}
			photosFolderId=""
			on:upload={handlePhotoUpload}
			on:close={() => showPhotoCapture = false}
		/>
	{/if}

	<!-- Tree Modal -->
	<TreeModal
		isOpen={showTreeModal}
		{projectId}
		onClose={() => showTreeModal = false}
		onSave={addTree}
	/>

	<!-- Photo Capture Modal -->
	{#if showPhotoCapture}
		<PhotoCapture
			isOpen={showPhotoCapture}
			projectId={projectId}
			photosFolderId=""
			on:upload={handlePhotoUpload}
			on:close={() => showPhotoCapture = false}
		/>
	{/if}

	<!-- Unified AI Prompt -->
	<UnifiedAIPrompt
		{projectId}
		isOpen={showUnifiedAIPrompt}
	/>

	<!-- AI Review Chat Modal -->
	{#if showAIReview && project}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
				<div class="p-4 border-b border-gray-200 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900">AI Project Review</h2>
					<button
						on:click={toggleAIReview}
						class="text-gray-400 hover:text-gray-600"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>
				<div class="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
					<AIReviewChat projectId={projectId} projectName={project.name} />
				</div>
			</div>
		</div>
	{/if}

	<!-- Floating AI Assistant Button -->
	<div class="fixed bottom-6 right-6 z-40">
		<button
			on:click={() => showUnifiedAIPrompt = true}
			class="bg-forest-600 text-white p-4 rounded-full shadow-lg hover:bg-forest-700 transition-colors flex items-center justify-center"
			title="AI Assistant"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
			</svg>
		</button>
	</div>
</div>
