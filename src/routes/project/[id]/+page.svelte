<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { db } from '$lib/db';
	import type { Project, Tree, Note } from '$lib/db';
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';

	let projectId = '';
	let project: Project | undefined;
	let trees: Tree[] = [];
	let notes: Note[] = [];
	let activeTab = 'trees';
	let loading = true;
	let saving = false;
	let error = '';
	

	// Tree form
	let newTree = {
		number: '',
		species: '',
		scientificName: '',
		DBH: 0,
		height: 0,
		age: '',
		category: '' as 'A' | 'B' | 'C' | 'U' | '',
		condition: '',
		notes: ''
	};

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

	async function addTree() {
		if (!newTree.number || !newTree.species) return;

		try {
			const treeId = await db.trees.add({
				projectId,
				number: newTree.number,
				species: newTree.species,
				scientificName: newTree.scientificName,
				DBH: newTree.DBH,
				height: newTree.height,
				age: newTree.age,
				category: newTree.category,
				condition: newTree.condition,
				notes: newTree.notes,
				RPA: newTree.DBH * 12,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});

			// Refresh trees list
			trees = await db.trees.where('projectId').equals(projectId).toArray();

			// Reset form
			newTree = {
				number: '',
				species: '',
				scientificName: '',
				DBH: 0,
				height: 0,
				age: '',
				category: '',
				condition: '',
				notes: ''
			};

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
</script>

<svelte:head>
	<title>{project?.name || 'Project'} - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<a href="/workspace" class="text-sm text-forest-600 hover:underline mb-1 inline-block">&larr; Back to Workspace</a>
			<h1 class="text-2xl font-bold text-gray-900">{project?.name || 'Loading...'}</h1>
			{#if project?.clientName}
				<p class="text-gray-600">Client: {project.clientName}</p>
			{/if}
		</div>
		<button
			on:click={saveProject}
			disabled={saving}
			class="btn btn-primary"
		>
			{saving ? 'Saving...' : 'Save'}
		</button>
	</div>

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
		<!-- Tabs -->
		<div class="border-b border-gray-200 mb-6">
			<nav class="-mb-px flex space-x-8">
				<button
					on:click={() => activeTab = 'trees'}
					class="py-4 px-1 border-b-2 font-medium text-sm transition-colors
						   {activeTab === 'trees' 
							   ? 'border-forest-500 text-forest-600' 
							   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Trees ({trees.length})
				</button>
				<button
					on:click={() => activeTab = 'notes'}
					class="py-4 px-1 border-b-2 font-medium text-sm transition-colors
						   {activeTab === 'notes' 
							   ? 'border-forest-500 text-forest-600' 
							   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Notes ({notes.length})
				</button>
			</nav>
		</div>

		<!-- Trees Tab -->
		{#if activeTab === 'trees'}
			<!-- Add Tree Form -->
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Add New Tree</h2>
				<form on:submit|preventDefault={addTree} class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label for="treeNumber" class="block text-sm font-medium text-gray-700 mb-1">Tree No.</label>
						<input
							id="treeNumber"
							type="text"
							bind:value={newTree.number}
							placeholder="e.g., T1"
							class="input w-full"
							required
						/>
					</div>
					<div>
						<label for="species" class="block text-sm font-medium text-gray-700 mb-1">Species</label>
						<input
							id="species"
							type="text"
							bind:value={newTree.species}
							placeholder="e.g., English Oak"
							class="input w-full"
							required
						/>
					</div>
					<div>
						<label for="scientificName" class="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
						<input
							id="scientificName"
							type="text"
							bind:value={newTree.scientificName}
							placeholder="e.g., Quercus robur"
							class="input w-full"
						/>
					</div>
					<div>
						<label for="DBH" class="block text-sm font-medium text-gray-700 mb-1">DBH (mm)</label>
						<input
							id="DBH"
							type="number"
							bind:value={newTree.DBH}
							placeholder="e.g., 450"
							class="input w-full"
						/>
					</div>
					<div>
						<label for="height" class="block text-sm font-medium text-gray-700 mb-1">Height (m)</label>
						<input
							id="height"
							type="number"
							bind:value={newTree.height}
							placeholder="e.g., 12"
							class="input w-full"
						/>
					</div>
					<div>
						<label for="age" class="block text-sm font-medium text-gray-700 mb-1">Age Class</label>
						<select id="age" bind:value={newTree.age} class="input w-full">
							<option value="">Select...</option>
							<option value="Young">Young</option>
							<option value="Semi-mature">Semi-mature</option>
							<option value="Mature">Mature</option>
							<option value="Over-mature">Over-mature</option>
							<option value="Ancient">Ancient</option>
						</select>
					</div>
					<div>
						<label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
						<select id="category" bind:value={newTree.category} class="input w-full">
							<option value="">Select...</option>
							<option value="A">A - High Quality</option>
							<option value="B">B - Moderate Quality</option>
							<option value="C">C - Low Quality</option>
							<option value="U">U - Unsuitable</option>
						</select>
					</div>
					<div>
						<label for="condition" class="block text-sm font-medium text-gray-700 mb-1">Condition</label>
						<input
							id="condition"
							type="text"
							bind:value={newTree.condition}
							placeholder="e.g., Good"
							class="input w-full"
						/>
					</div>
					<div class="md:col-span-2 lg:col-span-4">
						<label for="treeNotes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
						<textarea
							id="treeNotes"
							bind:value={newTree.notes}
							placeholder="Additional observations..."
							rows="2"
							class="input w-full"
						></textarea>
					</div>
					<div class="md:col-span-2 lg:col-span-4">
						<button type="submit" class="btn btn-primary">Add Tree</button>
					</div>
				</form>
			</div>

			<!-- Trees List -->
			<div class="card">
				<div class="p-4 border-b border-gray-200">
					<h2 class="text-lg font-semibold">Tree Survey</h2>
				</div>
				{#if trees.length === 0}
					<div class="p-8 text-center text-gray-500">
						<p>No trees added yet. Add your first tree above!</p>
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
	{/if}
</div>
