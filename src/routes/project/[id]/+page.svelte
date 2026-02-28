<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { db } from '$lib/db';
	import { supabase } from '$lib/supabase/client';
	import { getNotes, createNote, updateNote, deleteNote as deleteNoteService } from '$lib/services/notesService';
	import { getTrees, createTree, updateTree, deleteTree as deleteTreeService } from '$lib/services/treesService';
	import { generateAndSaveReport } from '$lib/copilot/reportGenerator';
	import type { Project, Tree, Note, Photo } from '$lib/db';
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
	import AIReviewChat from '$lib/components/ai/AIReviewChat.svelte';
	import { getProjectReviewStatus } from '$lib/services/projectReview';
	import PhotoCapture from '$lib/components/project/PhotoCapture.svelte';
	import ProjectDashboard from '$lib/components/project/ProjectDashboard.svelte';
	import TabSystem from '$lib/components/project/TabSystem.svelte';
	import TreeModal from '$lib/components/project/TreeModal.svelte';
	import UnifiedAIPrompt from '$lib/components/ai/UnifiedAIPrompt.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import PhotoUploader from '$lib/components/PhotoUploader.svelte';

	// Project Overview Widgets
	import RecentNotes from '$lib/components/projectOverview/RecentNotes.svelte';
	import RecentTrees from '$lib/components/projectOverview/RecentTrees.svelte';
	import RecentPhotos from '$lib/components/projectOverview/RecentPhotos.svelte';
	import RecentReports from '$lib/components/projectOverview/RecentReports.svelte';
	import TaskSummary from '$lib/components/projectOverview/TaskSummary.svelte';
	import QuickActions from '$lib/components/projectOverview/QuickActions.svelte';
	import AiInsights from '$lib/components/projectOverview/AiInsights.svelte';

	let projectId = '';
	let project: Project | undefined;
	let trees: Tree[] = [];
	let notes: Note[] = [];
	let photos: Photo[] = [];
	let reports: any[] = []; // TODO: Add proper type for reports
	let tasks: any[] = []; // TODO: Add proper type for tasks
	let activeTab = 'overview';
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

	// Editing states
	let editingNoteId: string | null = null;
	let editingNoteContent = '';
	let editingTreeId: string | null = null;
	let editingTreeNotes = '';

	onMount(async () => {
		projectId = $page.params.id || '';
		await loadProject();

		// Add event listener for report generation
		window.addEventListener('generateReport', handleGenerateReport as EventListener);
	});

	onDestroy(() => {
		// Clean up event listener
		window.removeEventListener('generateReport', handleGenerateReport as EventListener);
	});

	// Handle report generation event
	async function handleGenerateReport(event: Event) {
		const customEvent = event as CustomEvent;
		const { projectId: eventProjectId, reportType = 'full' } = customEvent.detail || {};
		
		// Only proceed if the project ID matches
		if (eventProjectId && eventProjectId !== projectId) return;

		try {
			// Show loading state - mobile friendly message
			const originalError = error;
			error = '📱 Generating professional report... This may take a moment.';
			
			// For mobile, we might want to show a more persistent notification
			// but for now we'll use the existing error display

			// Get voice notes from database (actual VoiceNote objects)
			const { getVoiceNotes } = await import('$lib/db');
			const voiceNotes = await getVoiceNotes(projectId);
			
			// Get tasks from database
			const { getTasksByProject } = await import('$lib/db');
			const tasks = await getTasksByProject(projectId);
			
			// Generate the report
			const result = await generateAndSaveReport({
				project: project!,
				notes,
				voiceNotes,
				trees,
				tasks,
				reportType
			}, 'bs5837'); // Default to bs5837 report type

			// Mobile-friendly success message with emoji
			error = `✅ Report generated! ID: ${result.reportId.substring(0, 8)}...`;
			
			// On mobile, we might want to show a toast or navigate to the report
			// For now, clear after 4 seconds (longer for mobile users)
			setTimeout(() => {
				error = originalError;
				// On mobile, you might want to automatically navigate to the report
				// but for now we'll just show the success message
			}, 4000);
		} catch (err: any) {
			// Mobile-friendly error message
			error = `❌ Report generation failed: ${err.message || 'Please try again'}`;
			
			// Clear error after 5 seconds on mobile
			setTimeout(() => {
				error = '';
			}, 5000);
		}
	}

	async function loadProject() {
		loading = true;
		error = '';
		try {
			// Load project from IndexedDB (existing)
			project = await db.projects.get(projectId);
			if (!project) {
				error = 'Project not found';
				return;
			}

			// Load trees from Supabase
			trees = await getTrees(projectId);

			// Load notes from Supabase
			notes = await getNotes(projectId);

			// Load photos from IndexedDB (existing - will be migrated to Supabase later)
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
			// Update project timestamp in IndexedDB
			await db.projects.update(projectId, {
				updatedAt: new Date()
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
			// Create tree in Supabase
			const treeId = await createTree({
				projectId: projectId,
				number: treeData.number,
				species: treeData.species,
				scientificName: treeData.scientificName,
				DBH: treeData.DBH,
				height: treeData.height,
				age: treeData.age,
				category: treeData.category,
				condition: treeData.condition,
				notes: treeData.notes,
				photos: [],
				RPA: treeData.DBH * 12
			});

			// Also add to IndexedDB for compatibility
			await db.trees.add({
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
				photos: [],
				RPA: treeData.DBH * 12,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Refresh trees list
			await loadProject();
			await saveProject();
		} catch (e) {
			error = 'Failed to add tree';
			console.error(e);
		}
	}

	async function deleteTreeItem(treeId: string) {
		if (!confirm('Are you sure you want to delete this tree?')) return;

		try {
			// Delete from Supabase
			await deleteTreeService(treeId);
			
			// Delete from IndexedDB
			await db.trees.delete(treeId);
			
			await loadProject();
			await saveProject();
		} catch (e) {
			error = 'Failed to delete tree';
			console.error(e);
		}
	}

	async function addNote() {
		if (!newNote.title || !newNote.content) return;

		try {
			// Create note in Supabase
			const noteId = await createNote({
				projectId: projectId,
				title: newNote.title,
				content: newNote.content,
				type: newNote.type,
				tags: []
			});

			// Also add to IndexedDB for compatibility
			await db.notes.add({
				projectId,
				title: newNote.title,
				content: newNote.content,
				type: newNote.type,
				tags: [],
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Refresh notes list
			await loadProject();

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

	async function updateNoteContent(noteId: string, content: string) {
		try {
			await updateNote(noteId, { content });
			await loadProject();
			await saveProject();
		} catch (e) {
			error = 'Failed to update note';
			console.error(e);
		}
	}

	async function updateTreeNotes(treeId: string, notes: string) {
		try {
			await updateTree(treeId, { notes });
			await loadProject();
			await saveProject();
		} catch (e) {
			error = 'Failed to update tree notes';
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
			
			// Create in Supabase
			await createNote({
				projectId: projectId,
				title: noteTitle,
				content: text,
				type: 'voice',
				tags: []
			});

			// Also add to IndexedDB for compatibility
			await db.notes.add({
				projectId,
				title: noteTitle,
				content: text,
				type: 'voice',
				tags: [],
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Refresh notes list
			await loadProject();
			await saveProject();
		} catch (e) {
			error = 'Failed to save voice note';
			console.error(e);
		}
	}

	async function deleteNoteItem(noteId: string) {
		if (!confirm('Are you sure you want to delete this note?')) return;

		try {
			// Delete from Supabase
			await deleteNoteService(noteId);
			
			// Delete from IndexedDB
			await db.notes.delete(noteId);
			
			await loadProject();
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

	// Filtering state
	let treeFilter = '';
	let noteFilter = '';
	let photoFilter = '';
	let allItemsFilter = '';

	// Filtered trees
	$: filteredTrees = treeFilter
		? trees.filter(tree =>
			(tree.number?.toLowerCase().includes(treeFilter.toLowerCase()) ||
			tree.species?.toLowerCase().includes(treeFilter.toLowerCase()) ||
			tree.condition?.toLowerCase().includes(treeFilter.toLowerCase()) ||
			tree.notes?.toLowerCase().includes(treeFilter.toLowerCase()))
		)
		: trees;

	// Filtered notes
	$: filteredNotes = noteFilter
		? notes.filter(note =>
			note.title?.toLowerCase().includes(noteFilter.toLowerCase()) ||
			note.content?.toLowerCase().includes(noteFilter.toLowerCase())
		)
		: notes;

	// Filtered photos
	$: filteredPhotos = photoFilter
		? photos.filter(photo =>
			photo.filename?.toLowerCase().includes(photoFilter.toLowerCase())
		)
		: photos;

	// Filtered all items
	$: filteredAllItems = allItemsFilter
		? getAllItems().filter(item => {
			if (item.type === 'tree') {
				return (
					item.number?.toLowerCase().includes(allItemsFilter.toLowerCase()) ||
					item.species?.toLowerCase().includes(allItemsFilter.toLowerCase()) ||
					item.condition?.toLowerCase().includes(allItemsFilter.toLowerCase()) ||
					item.notes?.toLowerCase().includes(allItemsFilter.toLowerCase())
				);
			} else if (item.type === 'note') {
				return (
					item.title?.toLowerCase().includes(allItemsFilter.toLowerCase()) ||
					item.content?.toLowerCase().includes(allItemsFilter.toLowerCase())
				);
			} else if (item.type === 'photo') {
				return item.filename?.toLowerCase().includes(allItemsFilter.toLowerCase());
			}
			return false;
		})
		: getAllItems();

	// Handle image upload from PhotoUploader
	function handleImageUpload(event: CustomEvent<{ urls: string[] }>) {
		const { urls } = event.detail;
		if (urls.length > 0) {
			// For now, just show an alert. In a real implementation, we would:
			// 1. Insert the image into the currently active editor
			// 2. Or create a new note with the image
			alert(`Image uploaded! URL: ${urls[0]}\n\nCopy this URL and paste it into the rich text editor to insert the image.`);
		}
	}

	// Start editing a note
	function startEditNote(note: Note) {
		editingNoteId = note.id || null;
		editingNoteContent = note.content;
	}

	// Cancel editing a note
	function cancelEditNote() {
		editingNoteId = null;
		editingNoteContent = '';
	}

	// Save edited note
	async function saveEditNote() {
		if (editingNoteId) {
			await updateNoteContent(editingNoteId, editingNoteContent);
			editingNoteId = null;
			editingNoteContent = '';
		}
	}

	// Start editing tree notes
	function startEditTreeNotes(tree: Tree) {
		editingTreeId = tree.id || null;
		editingTreeNotes = tree.notes || '';
	}

	// Cancel editing tree notes
	function cancelEditTreeNotes() {
		editingTreeId = null;
		editingTreeNotes = '';
	}

	// Save edited tree notes
	async function saveEditTreeNotes() {
		if (editingTreeId) {
			await updateTreeNotes(editingTreeId, editingTreeNotes);
			editingTreeId = null;
			editingTreeNotes = '';
		}
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
				{ id: 'overview', label: 'Overview', count: 0 },
				{ id: 'trees', label: 'Trees', count: trees.length },
				{ id: 'notes', label: 'Notes', count: notes.length },
				{ id: 'photos', label: 'Photos', count: photos.length },
				{ id: 'voice', label: 'Voice Notes', count: getVoiceNotes().length },
				{ id: 'all', label: 'All Items', count: getAllItems().length }
			]}
			onTabChange={(tabId) => activeTab = tabId}
		/>

		<!-- Overview Tab -->
		{#if activeTab === 'overview'}
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-800 mb-6">Project Overview</h2>
				
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<!-- Recent Notes Widget -->
					<div>
						<RecentNotes {notes} {projectId} limit={5} />
					</div>
					
					<!-- Recent Trees Widget -->
					<div>
						<RecentTrees {trees} {projectId} limit={5} />
					</div>
					
					<!-- Recent Photos Widget -->
					<div>
						<RecentPhotos {photos} {projectId} limit={6} />
					</div>
					
					<!-- Recent Reports Widget -->
					<div>
						<RecentReports {reports} {projectId} limit={3} />
					</div>
					
					<!-- Tasks Summary Widget -->
					<div>
						<TaskSummary {tasks} {projectId} />
					</div>
					
					<!-- Quick Actions Panel -->
					<div>
						<QuickActions {projectId} />
					</div>
					
					<!-- AI Insights Widget -->
					<div class="md:col-span-2 lg:col-span-3">
						<AiInsights
							{trees}
							{notes}
							{reports}
							{tasks}
							{photos}
							{projectId}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Trees Tab -->
		{#if activeTab === 'trees'}
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-xl font-semibold text-gray-800">Trees ({filteredTrees.length})</h2>
					<button
						on:click={() => showTreeModal = true}
						class="btn btn-primary"
					>
						Add Tree
					</button>
				</div>

				<!-- Tree Filter -->
				<div class="mb-6">
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							bind:value={treeFilter}
							placeholder="Filter trees by number, species, condition, or notes..."
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					{#if treeFilter && filteredTrees.length === 0}
						<p class="text-sm text-gray-500 mt-2">No trees match your filter.</p>
					{/if}
				</div>

				{#if trees.length === 0}
					<div class="text-center py-8 text-gray-500">
						<p>No trees added yet.</p>
						<button
							on:click={() => showTreeModal = true}
							class="btn btn-primary mt-4"
						>
							Add Your First Tree
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each filteredTrees as tree (tree.id)}
							<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
								<div class="flex justify-between items-start mb-2">
									<h3 class="font-medium text-gray-800">{tree.number} - {tree.species}</h3>
									<button
										on:click={() => tree.id && deleteTreeItem(tree.id)}
										class="text-red-500 hover:text-red-700 text-sm"
									>
										Delete
									</button>
								</div>
								
								<div class="space-y-2 text-sm text-gray-600">
									<p><span class="font-medium">Condition:</span> {tree.condition}</p>
									<p><span class="font-medium">Category:</span> <span class="px-2 py-1 rounded text-xs {getCategoryColor(tree.category)}">{tree.category || 'Not set'}</span></p>
									
									{#if editingTreeId === tree.id}
										<div class="mt-4">
											<RichTextEditor
												value={editingTreeNotes}
												on:change={(e) => editingTreeNotes = e.detail}
												placeholder="Add notes about this tree..."
												projectId={projectId}
												treeId={tree.id}
											/>
											<div class="flex gap-2 mt-2">
												<button
													on:click={saveEditTreeNotes}
													class="btn btn-primary text-sm"
												>
													Save
												</button>
												<button
													on:click={cancelEditTreeNotes}
													class="btn btn-secondary text-sm"
												>
													Cancel
												</button>
											</div>
										</div>
									{:else}
										<div class="mt-3">
											<div class="flex justify-between items-center mb-1">
												<span class="font-medium">Notes:</span>
												<button
													on:click={() => startEditTreeNotes(tree)}
													class="text-blue-500 hover:text-blue-700 text-sm"
												>
													Edit
												</button>
											</div>
											{#if tree.notes}
												<div class="prose prose-sm max-w-none border border-gray-100 rounded p-3 bg-gray-50">
													{@html tree.notes}
												</div>
											{:else}
												<p class="text-gray-400 italic">No notes added</p>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Notes Tab -->
		{#if activeTab === 'notes'}
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
					<h2 class="text-xl font-semibold text-gray-800">Notes ({filteredNotes.length})</h2>
					<div class="flex flex-col sm:flex-row gap-2">
						<button
							on:click={() => activeTab = 'voice'}
							class="btn btn-secondary"
						>
							Add Voice Note
						</button>
						<button
							on:click={() => {
								// Trigger note compilation
								const event = new CustomEvent('openUnifiedAIPrompt', {
									detail: {
										projectId,
										initialPrompt: 'Compile all project notes into a draft report'
									}
								});
								window.dispatchEvent(event);
							}}
							class="btn btn-primary"
							disabled={notes.length === 0}
						>
							Compile Notes
						</button>
					</div>
				</div>

				<!-- Note Filter -->
				<div class="mb-6">
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							bind:value={noteFilter}
							placeholder="Filter notes by title or content..."
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					{#if noteFilter && filteredNotes.length === 0}
						<p class="text-sm text-gray-500 mt-2">No notes match your filter.</p>
					{/if}
				</div>

				<!-- New Note Form -->
				<div class="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
					<h3 class="font-medium text-gray-700 mb-3">Create New Note</h3>
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
							<input
								type="text"
								bind:value={newNote.title}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Note title"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
							<RichTextEditor
								value={newNote.content}
								on:change={(e) => newNote.content = e.detail}
								placeholder="Write your note here..."
								projectId={projectId}
							/>
						</div>
						<div class="flex justify-end">
							<button
								on:click={addNote}
								class="btn btn-primary"
								disabled={!newNote.title || !newNote.content}
							>
								Save Note
							</button>
						</div>
					</div>
				</div>

				<!-- Notes List -->
				{#if notes.length === 0}
					<div class="text-center py-8 text-gray-500">
						<p>No notes added yet.</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each filteredNotes as note (note.id)}
							<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
								<div class="flex justify-between items-start mb-3">
									<div>
										<h3 class="font-medium text-gray-800">{note.title}</h3>
										<p class="text-xs text-gray-500 mt-1">
											Created: {new Date(note.createdAt).toLocaleDateString()}
										</p>
									</div>
									<div class="flex gap-2">
										<button
											on:click={() => startEditNote(note)}
											class="text-blue-500 hover:text-blue-700 text-sm"
										>
											Edit
										</button>
										<button
											on:click={() => note.id && deleteNoteItem(note.id)}
											class="text-red-500 hover:text-red-700 text-sm"
										>
											Delete
										</button>
									</div>
								</div>
								
								{#if editingNoteId === note.id}
									<div class="mt-3">
										<RichTextEditor
											value={editingNoteContent}
											on:change={(e) => editingNoteContent = e.detail}
											placeholder="Edit note content..."
											projectId={projectId}
											noteId={note.id}
										/>
										<div class="flex gap-2 mt-2">
											<button
												on:click={saveEditNote}
												class="btn btn-primary text-sm"
											>
												Save
											</button>
											<button
												on:click={cancelEditNote}
												class="btn btn-secondary text-sm"
											>
												Cancel
											</button>
										</div>
									</div>
								{:else}
									<div class="prose prose-sm max-w-none">
										{@html note.content}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Photos Tab -->
		{#if activeTab === 'photos'}
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-xl font-semibold text-gray-800">Photos</h2>
					<div class="flex gap-2">
						<PhotoUploader projectId={projectId} on:upload={handleImageUpload} />
						<button
							on:click={() => showPhotoCapture = true}
							class="btn btn-primary"
						>
							Take Photo
						</button>
					</div>
				</div>

				{#if photos.length === 0}
					<div class="text-center py-8 text-gray-500">
						<p>No photos added yet.</p>
						<div class="mt-4 flex justify-center gap-2">
							<PhotoUploader projectId={projectId} on:upload={handleImageUpload} />
							<button
								on:click={() => showPhotoCapture = true}
								class="btn btn-primary"
							>
								Take Photo
							</button>
						</div>
					</div>
				{:else}
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{#each photos as photo (photo.id)}
							<div class="border border-gray-200 rounded-lg overflow-hidden">
								<div class="aspect-square bg-gray-100 flex items-center justify-center">
									{#if photo.blob}
										<img
											src={URL.createObjectURL(photo.blob)}
											alt={photo.filename}
											class="w-full h-full object-cover"
										/>
									{:else}
										<span class="text-gray-400">No image</span>
									{/if}
								</div>
								<div class="p-3">
									<p class="text-sm font-medium text-gray-700 truncate">{photo.filename}</p>
									<p class="text-xs text-gray-500 mt-1">
										{new Date(photo.createdAt).toLocaleDateString()}
									</p>
									<button
										on:click={() => photo.id && deletePhoto(photo.id)}
										class="mt-2 text-red-500 hover:text-red-700 text-sm"
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

		<!-- Voice Notes Tab -->
		{#if activeTab === 'voice'}
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-xl font-semibold text-gray-800">Voice Notes</h2>
					<VoiceRecorder
						on:transcript={handleVoiceTranscript}
						{projectId}
					/>
				</div>

				{#if getVoiceNotes().length === 0}
					<div class="text-center py-8 text-gray-500">
						<p>No voice notes recorded yet.</p>
						<p class="text-sm mt-2">Click the record button above to create your first voice note.</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each getVoiceNotes() as note (note.id)}
							<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
								<div class="flex justify-between items-start mb-3">
									<div>
										<h3 class="font-medium text-gray-800">{note.title}</h3>
										<p class="text-xs text-gray-500 mt-1">
											Created: {new Date(note.createdAt).toLocaleDateString()}
										</p>
									</div>
									<button
										on:click={() => note.id && deleteNoteItem(note.id)}
										class="text-red-500 hover:text-red-700 text-sm"
									>
										Delete
									</button>
								</div>
								<div class="prose prose-sm max-w-none bg-blue-50 p-3 rounded">
									{@html note.content}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- All Items Tab -->
		{#if activeTab === 'all'}
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-xl font-semibold text-gray-800 mb-6">All Project Items</h2>
				
				{#if getAllItems().length === 0}
					<div class="text-center py-8 text-gray-500">
						<p>No items added to this project yet.</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each getAllItems() as item (item.id)}
							<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
								<div class="flex items-start gap-3">
									<div class="mt-1">
										{#if item.type === 'tree'}
											<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
												🌳
											</span>
										{:else if item.type === 'note'}
											<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
												📝
											</span>
										{:else if item.type === 'photo'}
											<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800">
												📷
											</span>
										{/if}
									</div>
									<div class="flex-1">
										<div class="flex justify-between items-start">
											<div>
												<h3 class="font-medium text-gray-800">
													{#if item.type === 'tree'}
														{item.number} - {item.species}
													{:else if item.type === 'note'}
														{item.title}
													{:else if item.type === 'photo'}
														{item.filename}
													{/if}
												</h3>
												<p class="text-xs text-gray-500 mt-1">
													{item.type.charAt(0).toUpperCase() + item.type.slice(1)} •
													Created: {new Date(item.createdAt).toLocaleDateString()}
												</p>
											</div>
											<button
												on:click={() => {
													if (item.type === 'tree') {
														activeTab = 'trees';
													} else if (item.type === 'note') {
														activeTab = 'notes';
													} else if (item.type === 'photo') {
														activeTab = 'photos';
													}
												}}
												class="text-blue-500 hover:text-blue-700 text-sm"
											>
												View
											</button>
										</div>
										
										{#if item.type === 'tree' && item.notes}
											<div class="mt-2 text-sm text-gray-600 line-clamp-2">
												{@html item.notes}
											</div>
										{:else if item.type === 'note' && item.content}
											<div class="mt-2 text-sm text-gray-600 line-clamp-2">
												{@html item.content}
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Modals -->
		{#if showTreeModal}
			<TreeModal
				onClose={() => showTreeModal = false}
				onSave={addTree}
			/>
		{/if}

		{#if showPhotoCapture}
			<PhotoCapture
				isOpen={showPhotoCapture}
				projectId={projectId}
				on:close={() => showPhotoCapture = false}
				on:upload={handlePhotoUpload}
			/>
		{/if}

		{#if showAIReview}
			<AIReviewChat
				projectId={projectId}
				open={showAIReview}
				on:close={() => showAIReview = false}
			/>
		{/if}

		{#if showUnifiedAIPrompt}
			<UnifiedAIPrompt
				projectId={projectId}
				isOpen={showUnifiedAIPrompt}
				on:close={() => showUnifiedAIPrompt = false}
			/>
		{/if}
	{/if}
</div>
