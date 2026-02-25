<script lang="ts">
	import { onMount } from 'svelte';
	import appflowyStore, { workspaces, documents, loading, error } from '../stores/appflowyStore';
	import type { AppFlowyDocument, AppFlowyWorkspace } from '../types';
	import NewWorkspaceModal from './Shared/NewWorkspaceModal.svelte';
	import NewDocumentModal from './Shared/NewDocumentModal.svelte';

	// Reactive store values
	let selectedWorkspaceId: string | null = null;
	let showNewDocumentForm = false;
	let showNewWorkspaceForm = false;
	
	// Form data
	let newDocument = {
		title: '',
		type: 'document' as 'document' | 'spreadsheet' | 'kanban',
		workspaceId: '',
		userId: 'user-1', // TODO: Replace with actual user ID
		content: { type: 'document', blocks: [] },
		collaborators: [] as string[]
	};
	
	let newWorkspace = {
		name: '',
		description: '',
		ownerId: 'user-1', // TODO: Replace with actual user ID
		members: [] as string[],
		documents: [] as string[]
	};

	onMount(async () => {
		await appflowyStore.loadWorkspaces();
	});

	// Handle workspace selection
	function selectWorkspace(workspaceId: string) {
		selectedWorkspaceId = workspaceId;
		appflowyStore.loadDocuments(workspaceId);
	}

	// Handle document selection
	function selectDocument(document: AppFlowyDocument) {
		appflowyStore.setCurrentDocument(document);
		// TODO: Navigate to document editor
	}

	// Create new document
	async function handleCreateDocument(): Promise<boolean> {
		if (!newDocument.title.trim()) {
			alert('Please enter a document title');
			return false;
		}

		if (!newDocument.workspaceId) {
			alert('Please select a workspace');
			return false;
		}

		const success = await appflowyStore.createDocument(newDocument);
		if (success) {
			showNewDocumentForm = false;
			newDocument = {
				title: '',
				type: 'document',
				workspaceId: '',
				userId: 'user-1',
				content: { type: 'document', blocks: [] },
				collaborators: []
			};
		}
		return success || false;
	}

	// Create new workspace
	async function handleCreateWorkspace(): Promise<boolean> {
		if (!newWorkspace.name.trim()) {
			alert('Please enter a workspace name');
			return false;
		}

		const success = await appflowyStore.createWorkspace(newWorkspace);
		if (success) {
			showNewWorkspaceForm = false;
			newWorkspace = {
				name: '',
				description: '',
				ownerId: 'user-1',
				members: [],
				documents: []
			};
		}
		return success || false;
	}

	// Format date for display
	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Get document type icon
	function getDocumentTypeIcon(type: string): string {
		switch (type) {
			case 'document': return '📄';
			case 'spreadsheet': return '📊';
			case 'kanban': return '📋';
			default: return '📄';
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">AppFlowy Documents</h2>
			<p class="text-gray-600">Collaborative document workspace</p>
		</div>
		<div class="flex space-x-3">
			<button
				on:click={() => showNewWorkspaceForm = true}
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
			>
				New Workspace
			</button>
			<button
				on:click={() => showNewDocumentForm = true}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				New Document
			</button>
		</div>
	</div>

	<!-- Error Message -->
	{#if $error}
		<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
			<p class="text-red-700">Error: {$error}</p>
			<button
				on:click={() => appflowyStore.clearError()}
				class="mt-2 text-sm text-red-600 hover:text-red-800"
			>
				Dismiss
			</button>
		</div>
	{/if}

	<!-- Loading State -->
	{#if $loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{/if}

	<!-- Workspace Selection -->
	<div class="bg-white rounded-lg border border-gray-200 p-4">
		<h3 class="text-lg font-semibold text-gray-900 mb-3">Workspaces</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each $workspaces as workspace (workspace.id)}
				<div
					on:click={() => selectWorkspace(workspace.id)}
					class={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
						selectedWorkspaceId === workspace.id
							? 'border-blue-500 bg-blue-50'
							: 'border-gray-200 hover:border-gray-300'
					}`}
				>
					<div class="flex items-start justify-between">
						<div>
							<h4 class="font-medium text-gray-900">{workspace.name}</h4>
							<p class="text-sm text-gray-600 mt-1">{workspace.description}</p>
						</div>
						<div class="text-xs text-gray-500">
							{workspace.documents.length} docs
						</div>
					</div>
					<div class="mt-3 flex items-center justify-between text-sm">
						<span class="text-gray-500">
							{workspace.members.length} members
						</span>
						<span class="text-gray-500">
							Updated {formatDate(workspace.updatedAt)}
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Documents List -->
	{#if selectedWorkspaceId}
		<div class="bg-white rounded-lg border border-gray-200 p-4">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Documents</h3>
				{#if $workspaces.find(w => w.id === selectedWorkspaceId)}
					<span class="text-sm text-gray-600">
						Workspace: {$workspaces.find(w => w.id === selectedWorkspaceId)?.name}
					</span>
				{/if}
			</div>
			
			{#if $documents.length === 0}
				<div class="text-center py-8 text-gray-500">
					<p>No documents in this workspace yet.</p>
					<button
						on:click={() => {
							if (selectedWorkspaceId) {
								newDocument.workspaceId = selectedWorkspaceId;
								showNewDocumentForm = true;
							}
						}}
						class="mt-3 text-blue-600 hover:text-blue-800"
					>
						Create your first document
					</button>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each $documents as document (document.id)}
						<div
							on:click={() => selectDocument(document)}
							class="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer transition-all"
						>
							<div class="flex items-start justify-between">
								<div class="flex items-start space-x-3">
									<span class="text-xl">{getDocumentTypeIcon(document.type)}</span>
									<div>
										<h4 class="font-medium text-gray-900">{document.title}</h4>
										<p class="text-sm text-gray-600 mt-1 capitalize">
											{document.type} • v{document.version}
										</p>
									</div>
								</div>
								<div class="text-xs text-gray-500">
									{document.collaborators.length} collab
								</div>
							</div>
							<div class="mt-3 flex items-center justify-between text-sm">
								<span class="text-gray-500">
									Modified {formatDate(document.lastModified)}
								</span>
								<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
									{document.type}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- New Workspace Modal -->
	<NewWorkspaceModal
		show={showNewWorkspaceForm}
		workspace={newWorkspace}
		onCreate={handleCreateWorkspace}
		onClose={() => showNewWorkspaceForm = false}
	/>

	<!-- New Document Modal -->
	<NewDocumentModal
		show={showNewDocumentForm}
		document={newDocument}
		workspaces={$workspaces}
		onCreate={handleCreateDocument}
		onClose={() => showNewDocumentForm = false}
	/>

	<!-- Info Panel -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="ml-3">
				<h3 class="text-sm font-medium text-blue-800">AppFlowy Integration</h3>
				<div class="mt-2 text-sm text-blue-700">
					<p>This is a mock integration with AppFlowy. To enable real integration:</p>
					<ol class="list-decimal pl-5 mt-1 space-y-1">
						<li>Set up an AppFlowy account</li>
						<li>Configure API keys in environment variables</li>
						<li>Set <code class="text-xs">APPFLOWY_CONFIG.enabled = true</code> in the service</li>
					</ol>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom styles if needed */
</style>