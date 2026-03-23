<script lang="ts">
	import { onMount } from 'svelte';
	import type { Document, Folder } from '$lib/types';

	let searchTerm = $state('');
	let selectedFolder = $state<string | null>(null);
	let sortBy = $state<'name' | 'date' | 'type'>('name');
	let sortOrder = $state<'asc' | 'desc'>('asc');

	let folders: Folder[] = [
		{
			id: '1',
			name: 'Risk Assessments',
			type: 'folder',
			children: [
				{ id: '1-1', name: 'Oak Park Risk Assessment.pdf', type: 'document', size: '2.4 MB', modified: '2024-03-15' },
				{ id: '1-2', name: 'Construction Site Risk.pdf', type: 'document', size: '1.8 MB', modified: '2024-03-10' }
			]
		},
		{
			id: '2',
			name: 'Method Statements',
			type: 'folder',
			children: [
				{ id: '2-1', name: 'Tree Protection Method.pdf', type: 'document', size: '3.1 MB', modified: '2024-03-12' },
				{ id: '2-2', name: 'Emergency Works Method.pdf', type: 'document', size: '2.7 MB', modified: '2024-03-08' }
			]
		},
		{
			id: '3',
			name: 'Surveys',
			type: 'folder',
			children: [
				{ id: '3-1', name: 'TPO Survey Report.pdf', type: 'document', size: '4.2 MB', modified: '2024-03-05' },
				{ id: '3-2', name: 'Woodland Survey.pdf', type: 'document', size: '5.1 MB', modified: '2024-02-28' }
			]
		}
	];

	let allDocuments: Document[] = $derived(
		folders.flatMap(folder => 
			folder.children.map(doc => ({
				...doc,
				folder: folder.name,
				folderId: folder.id
			}))
		)
	);

	let filteredDocuments = $derived(() => {
		let docs = selectedFolder 
			? allDocuments.filter(doc => doc.folderId === selectedFolder)
			: allDocuments;

		if (searchTerm) {
			docs = docs.filter(doc => 
				doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				doc.folder.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return docs.sort((a, b) => {
			let compareValue = 0;
			switch (sortBy) {
				case 'name':
					compareValue = a.name.localeCompare(b.name);
					break;
				case 'date':
					compareValue = new Date(a.modified).getTime() - new Date(b.modified).getTime();
					break;
				case 'type':
					compareValue = a.type.localeCompare(b.type);
					break;
			}
			return sortOrder === 'asc' ? compareValue : -compareValue;
		});
	});

	let expandedFolders = $state<Set<string>>(new Set(['1', '2', '3']));

	function toggleFolder(folderId: string) {
		if (expandedFolders.has(folderId)) {
			expandedFolders.delete(folderId);
		} else {
			expandedFolders.add(folderId);
		}
	}

	function openDocument(document: Document) {
		console.log('Opening document:', document.name);
		// Implement document opening logic
	}

	function getDocumentIcon(type: string) {
		switch (type) {
			case 'pdf': return '📄';
			case 'doc': return '📝';
			case 'docx': return '📝';
			case 'xls': return '📊';
			case 'xlsx': return '📊';
			case 'jpg': return '🖼️';
			case 'jpeg': return '🖼️';
			case 'png': return '🖼️';
			case 'dwg': return '📐';
			case 'pdf': return '📄';
			default: return '📄';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="document-explorer">
	<div class="explorer-header">
		<h3>📁 Document Explorer</h3>
		<div class="explorer-controls">
			<input 
				type="text" 
				bind:value={searchTerm}
				placeholder="Search documents..."
				class="search-input"
			/>
			<select bind:value={sortBy} class="sort-select">
				<option value="name">Name</option>
				<option value="date">Date</option>
				<option value="type">Type</option>
			</select>
			<select bind:value={sortOrder} class="sort-select">
				<option value="asc">Ascending</option>
				<option value="desc">Descending</option>
			</select>
		</div>
	</div>

	<div class="explorer-content">
		<div class="folders-section">
			<h4>Folders</h4>
			<div class="folder-list">
				{#each folders as folder}
					<div class="folder-item">
						<div class="folder-header" onclick={() => toggleFolder(folder.id)}>
							<span class="folder-icon">{expandedFolders.has(folder.id) ? '📂' : '📁'}</span>
							<span class="folder-name">{folder.name}</span>
							<span class="folder-count">({folder.children.length})</span>
						</div>
						{#if expandedFolders.has(folder.id)}
							<div class="folder-contents">
								{#each folder.children as document}
									<div class="document-item" onclick={() => openDocument(document)}>
										<span class="document-icon">{getDocumentIcon(document.name.split('.').pop() || '')}</span>
										<div class="document-info">
											<div class="document-name">{document.name}</div>
											<div class="document-meta">
												<span class="document-size">{document.size}</span>
												<span class="document-date">{formatDate(document.modified)}</span>
											</div>
										</div>
										<span class="document-actions">↗️</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="documents-section">
			<h4>All Documents ({filteredDocuments.length})</h4>
			<div class="documents-grid">
				{#each filteredDocuments as document}
					<div class="document-card" onclick={() => openDocument(document)}>
						<div class="document-icon-large">{getDocumentIcon(document.name.split('.').pop() || '')}</div>
						<div class="document-details">
							<div class="document-title">{document.name}</div>
							<div class="document-path">{document.folder}</div>
							<div class="document-meta">
								<span class="document-size">{document.size}</span>
								<span class="document-date">{formatDate(document.modified)}</span>
							</div>
						</div>
						<div class="document-actions">
							<button class="action-btn" title="Download">⬇️</button>
							<button class="action-btn" title="Share">🔗</button>
							<button class="action-btn" title="More">⋯</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
.document-explorer {
	background: white;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
	overflow: hidden;
}

.explorer-header {
	padding: 1rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
}

.explorer-header h3 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.explorer-controls {
	display: flex;
	gap: 0.5rem;
	margin-top: 0.75rem;
	flex-wrap: wrap;
}

.search-input {
	flex: 1;
	min-width: 150px;
	padding: 0.5rem;
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	background: white;
}

.sort-select {
	padding: 0.5rem;
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	background: white;
}

.explorer-content {
	display: grid;
	grid-template-columns: 1fr 2fr;
	gap: 1rem;
	padding: 1rem;
	min-height: 400px;
}

.folders-section, .documents-section {
	background: #f9fafb;
	border-radius: 0.5rem;
	padding: 0.75rem;
}

.folders-section h4, .documents-section h4 {
	margin: 0 0 0.75rem 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.folder-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.folder-item {
	background: white;
	border-radius: 0.375rem;
	border: 1px solid #e5e7eb;
	overflow: hidden;
}

.folder-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.folder-header:hover {
	background: #f3f4f6;
}

.folder-icon {
	font-size: 1rem;
}

.folder-name {
	flex: 1;
	font-weight: 500;
	color: #111827;
}

.folder-count {
	font-size: 0.75rem;
	color: #6b7280;
}

.folder-contents {
	padding: 0 0.75rem 0.75rem 1.5rem;
}

.document-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	cursor: pointer;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
}

.document-item:hover {
	background: #f3f4f6;
}

.document-icon {
	font-size: 0.875rem;
}

.document-info {
	flex: 1;
}

.document-name {
	font-size: 0.875rem;
	font-weight: 500;
	color: #111827;
}

.document-meta {
	display: flex;
	gap: 0.75rem;
	font-size: 0.625rem;
	color: #6b7280;
}

.document-actions {
	opacity: 0;
	transition: opacity 0.2s ease;
}

.document-item:hover .document-actions {
	opacity: 1;
}

.documents-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 0.75rem;
}

.document-card {
	background: white;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.document-card:hover {
	border-color: #3b82f6;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.document-icon-large {
	font-size: 1.5rem;
}

.document-details {
	flex: 1;
	min-width: 0;
}

.document-title {
	font-size: 0.875rem;
	font-weight: 500;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.document-path {
	font-size: 0.625rem;
	color: #6b7280;
	margin: 0.125rem 0;
}

.document-meta {
	display: flex;
	gap: 0.5rem;
	font-size: 0.625rem;
	color: #6b7280;
}

.document-actions {
	display: flex;
	gap: 0.25rem;
}

.action-btn {
	background: none;
	border: none;
	cursor: pointer;
	padding: 0.25rem;
	border-radius: 0.125rem;
	font-size: 0.75rem;
	transition: background-color 0.2s ease;
}

.action-btn:hover {
	background: #f3f4f6;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
	.explorer-content {
		grid-template-columns: 1fr;
		gap: 0.75rem;
		padding: 0.75rem;
	}

	.explorer-controls {
		flex-direction: column;
		gap: 0.5rem;
	}

	.search-input {
		min-width: unset;
	}

	.documents-grid {
		grid-template-columns: 1fr;
	}

	.document-card {
		padding: 0.5rem;
	}

	.document-actions {
		opacity: 1;
		justify-content: flex-end;
	}

	.folder-contents {
		padding-left: 1rem;
	}
}
</style>