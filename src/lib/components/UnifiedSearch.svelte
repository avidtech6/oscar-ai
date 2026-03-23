<script lang="ts">
	import { onMount } from 'svelte';
	import type { Report, Project, Document } from '$lib/types';

	let searchQuery = $state('');
	let searchType = $state<'all' | 'reports' | 'projects' | 'documents'>('all');
	let searchResults = $state<any[]>([]);
	let isLoading = $state(false);
	let selectedResult = $state<any>(null);
	let showFilters = $state(false);

	// Mock data for demonstration
	let reports: Report[] = [
		{ 
			id: 1, 
			title: 'Tree Risk Assessment - Oak Park', 
			type: 'risk', 
			typeLabel: 'Risk Assessment',
			status: 'draft',
			date: '2024-03-15',
			client: 'City Council',
			location: 'Oak Park, London',
			tags: ['high-priority', 'oak', 'public-space'],
			description: 'Comprehensive risk assessment for mature oak trees in public park.'
		},
		{ 
			id: 2, 
			title: 'Arboricultural Method Statement - Construction Site', 
			type: 'method', 
			typeLabel: 'Method Statement',
			status: 'published',
			date: '2024-03-10',
			client: 'BuildRight Ltd',
			location: 'Construction Site A',
			tags: ['construction', 'protection', 'bs5837'],
			description: 'Method statement for tree protection during construction works.'
		}
	];

	let projects: Project[] = [
		{
			id: '1',
			name: 'Oak Park Development',
			description: 'Comprehensive tree risk assessment and management plan for urban park redevelopment',
			status: 'active',
			client: 'City Council',
			startDate: '2024-01-15',
			endDate: '2024-06-30',
			budget: 50000,
			progress: 65,
			tags: ['risk-assessment', 'urban', 'conservation'],
			documents: [],
			team: []
		}
	];

	let documents: Document[] = [
		{
			id: '1',
			name: 'Oak Park Risk Assessment.pdf',
			type: 'pdf',
			size: 2456789,
			modified: '2024-03-15',
			path: '/reports/oak-park-risk-assessment.pdf',
			project: 'Oak Park Development',
			tags: ['risk', 'oak', 'assessment']
		},
		{
			id: '2',
			name: 'Method Statement Template.docx',
			type: 'docx',
			size: 1234567,
			modified: '2024-03-10',
			path: '/templates/method-statement-template.docx',
			project: null,
			tags: ['template', 'method', 'construction']
		}
	];

	let searchHistory = $state<string[]>([]);

	$effect(() => {
		if (searchQuery.trim()) {
			// Add to search history
			if (!searchHistory.includes(searchQuery)) {
				searchHistory = [searchQuery, ...searchHistory.slice(0, 9)];
			}
			performSearch();
		} else {
			searchResults = [];
		}
	});

	async function performSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		isLoading = true;
		
		// Simulate API call delay
		await new Promise(resolve => setTimeout(resolve, 500));

		let results: any[] = [];

		// Search based on selected type
		if (searchType === 'all' || searchType === 'reports') {
			results = results.concat(
				reports.filter(report =>
					report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					report.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
					report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
				).map(report => ({
					...report,
					type: 'report',
					relevance: calculateRelevance(report.title, searchQuery) + 10
				}))
			);
		}

		if (searchType === 'all' || searchType === 'projects') {
			results = results.concat(
				projects.filter(project =>
					project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
					project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
				).map(project => ({
					...project,
					type: 'project',
					relevance: calculateRelevance(project.name, searchQuery) + 10
				}))
			);
		}

		if (searchType === 'all' || searchType === 'documents') {
			results = results.concat(
				documents.filter(document =>
					document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					document.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
				).map(document => ({
					...document,
					type: 'document',
					relevance: calculateRelevance(document.name, searchQuery)
				}))
			);
		}

		// Sort by relevance
		results.sort((a, b) => b.relevance - a.relevance);
		
		searchResults = results;
		isLoading = false;
	}

	function calculateRelevance(text: string, query: string): number {
		const lowerText = text.toLowerCase();
		const lowerQuery = query.toLowerCase();
		
		if (lowerText === lowerQuery) return 100;
		if (lowerText.startsWith(lowerQuery)) return 90;
		if (lowerText.includes(lowerQuery)) return 70;
		
		// Count word matches
		const queryWords = lowerQuery.split(' ');
		const textWords = lowerText.split(' ');
		let matchCount = 0;
		
		queryWords.forEach(queryWord => {
			if (textWords.some(textWord => textWord.includes(queryWord))) {
				matchCount++;
			}
		});
		
		return (matchCount / queryWords.length) * 50;
	}

	function clearSearch() {
		searchQuery = '';
		searchResults = [];
	}

	function selectResult(result: any) {
		selectedResult = result;
		console.log('Selected result:', result);
	}

	function getIcon(type: string): string {
		switch (type) {
			case 'report': return '📄';
			case 'project': return '📋';
			case 'document': return '📁';
			default: return '🔍';
		}
	}

	function getTypeColor(type: string): string {
		switch (type) {
			case 'report': return 'bg-blue-100 text-blue-800';
			case 'project': return 'bg-green-100 text-green-800';
			case 'document': return 'bg-purple-100 text-purple-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function clearSearchHistory() {
		searchHistory = [];
	}
</script>

<div class="unified-search">
	<div class="search-header">
		<h3>🔍 Unified Search</h3>
		<button class="toggle-btn" onclick={() => showFilters = !showFilters}>
			{showFilters ? 'Hide' : 'Show'} Filters
		</button>
	</div>

	<div class="search-controls">
		<div class="search-input-container">
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Search reports, projects, documents..."
				class="search-input"
				onkeydown={(e) => {
					if (e.key === 'Escape') clearSearch();
					if (e.key === 'Enter') performSearch();
				}}
			/>
			{#if searchQuery}
				<button class="clear-btn" onclick={clearSearch}>✕</button>
			{/if}
			{#if isLoading}
				<div class="loading-indicator">⏳</div>
			{/if}
		</div>

		<div class="search-type-selector">
			<select bind:value={searchType} class="type-select">
				<option value="all">All Types</option>
				<option value="reports">Reports</option>
				<option value="projects">Projects</option>
				<option value="documents">Documents</option>
			</select>
		</div>
	</div>

	{#if showFilters}
		<div class="search-filters">
			<div class="filter-group">
				<h4>Search History</h4>
				{#if searchHistory.length > 0}
					<div class="history-items">
						{#each searchHistory as term}
							<button class="history-item" onclick={() => searchQuery = term}>
								🕒 {term}
							</button>
						{/each}
						<button class="clear-history" onclick={clearSearchHistory}>
							Clear History
						</button>
					</div>
				{:else}
					<p class="no-history">No search history yet</p>
				{/if}
			</div>
		</div>
	{/if}

	{#if searchResults.length > 0}
		<div class="search-results">
			<div class="results-header">
				<h4>Results ({searchResults.length})</h4>
				<div class="sort-options">
					<select class="sort-select">
						<option value="relevance">Relevance</option>
						<option value="date">Date</option>
						<option value="name">Name</option>
					</select>
				</div>
			</div>

			<div class="results-list">
				{#each searchResults as result}
					<div class="result-item" onclick={() => selectResult(result)}>
						<div class="result-icon">
							{getIcon(result.type)}
						</div>
						<div class="result-content">
							<div class="result-header">
								<h5>{result.title || result.name}</h5>
								<span class={`type-badge ${getTypeColor(result.type)}`}>
									{result.type}
								</span>
							</div>
							<p class="result-description">
								{result.description || `Search result for "${searchQuery}"`}
							</p>
							<div class="result-meta">
								{#if result.client}
									<span class="meta-item">👤 {result.client}</span>
								{/if}
								{#if result.project}
									<span class="meta-item">📋 {result.project}</span>
								{/if}
								{#if result.date}
									<span class="meta-item">📅 {formatDate(result.date)}</span>
								{/if}
								{#if result.modified}
									<span class="meta-item">🔄 {formatDate(result.modified)}</span>
								{/if}
								{#if result.size}
									<span class="meta-item">📦 {formatFileSize(result.size)}</span>
								{/if}
							</div>
							{#if result.tags && result.tags.length > 0}
								<div class="result-tags">
									{#each result.tags as tag}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							{/if}
						</div>
						<div class="result-actions">
							<button class="action-btn">View</button>
							<button class="action-btn">Edit</button>
							{#if result.type === 'document'}
								<button class="action-btn">Download</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if searchQuery && !isLoading}
		<div class="no-results">
			<div class="no-results-icon">🔍</div>
			<h4>No results found</h4>
			<p>Try adjusting your search terms or check your spelling.</p>
	</div>
{/if}

	{#if selectedResult}
		<div class="result-details">
			<div class="details-header">
				<h4>{selectedResult.title || selectedResult.name}</h4>
				<button class="close-btn" onclick={() => selectedResult = null}>✕</button>
			</div>
			<div class="details-content">
				<div class="details-section">
					<h5>Type</h5>
					<span class={`type-badge ${getTypeColor(selectedResult.type)}`}>
						{selectedResult.type}
					</span>
				</div>
				<div class="details-section">
					<h5>Description</h5>
					<p>{selectedResult.description || 'No description available'}</p>
				</div>
				<div class="details-section">
					<h5>Details</h5>
					<div class="details-grid">
						{#if selectedResult.client}
							<div class="detail-item">
							  <span class="detail-label">Client:</span>
							  <span class="detail-value">{selectedResult.client}</span>
							</div>
					{/if}
						{#if selectedResult.status}
							<div class="detail-item">
								<span class="detail-label">Status:</span>
								<span class="detail-value">{selectedResult.status}</span>
							</div>
						{/if}
						{#if selectedResult.date}
							<div class="detail-item">
								<span class="detail-label">Date:</span>
								<span class="detail-value">{formatDate(selectedResult.date)}</span>
							</div>
						{/if}
						{#if selectedResult.size}
							<div class="detail-item">
								<span class="detail-label">Size:</span>
								<span class="detail-value">{formatFileSize(selectedResult.size)}</span>
							</div>
						{/if}
					</div>
				</div>
				<div class="details-actions">
					<button class="btn-primary">Open</button>
					<button class="btn-secondary">Edit</button>
					<button class="btn-secondary">Share</button>
					{#if selectedResult.type === 'document'}
						<button class="btn-secondary">Download</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
.unified-search {
	background: white;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
	overflow: hidden;
}

.search-header {
	padding: 1rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
}

.search-header h3 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.search-controls {
	display: flex;
	gap: 0.75rem;
	padding: 1rem;
	align-items: flex-start;
}

.search-input-container {
	flex: 1;
	position: relative;
}

.search-input {
	width: 100%;
	padding: 0.75rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	background: white;
}

.search-input:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	font-size: 1rem;
	cursor: pointer;
	color: #6b7280;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
}

.clear-btn:hover {
	background: #f3f4f6;
}

.loading-indicator {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	color: #6b7280;
}

.type-select {
	padding: 0.75rem;
	border: 1px solid #d1d5db;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	background: white;
	min-width: 120px;
}

.search-filters {
	padding: 1rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
}

.filter-group h4 {
	margin: 0 0 0.5rem 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.history-items {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.history-item {
	background: #f3f4f6;
	color: #374151;
	padding: 0.375rem 0.75rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	border: none;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.history-item:hover {
	background: #e5e7eb;
}

.clear-history {
	background: #fee2e2;
	color: #991b1b;
	padding: 0.375rem 0.75rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	border: none;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.clear-history:hover {
	background: #fecaca;
}

.no-history {
	font-size: 0.75rem;
	color: #6b7280;
	margin: 0;
}

.search-results {
	padding: 1rem;
}

.results-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.results-header h4 {
	margin: 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.sort-select {
	padding: 0.375rem;
	border: 1px solid #d1d5db;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	background: white;
}

.results-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.result-item {
	display: flex;
	align-items: flex-start;
	padding: 0.75rem;
	border: 1px solid #e5e7eb;
	border-radius: 0.375rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.result-item:hover {
	border-color: #3b82f6;
	background: #f8fafc;
}

.result-icon {
	font-size: 1.25rem;
	margin-right: 0.75rem;
	flex-shrink: 0;
}

.result-content {
	flex: 1;
	min-width: 0;
}

.result-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.5rem;
}

.result-header h5 {
	margin: 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #111827;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.type-badge {
	padding: 0.125rem 0.25rem;
	border-radius: 0.125rem;
	font-size: 0.625rem;
	font-weight: 500;
}

.result-description {
	margin: 0;
	font-size: 0.75rem;
	color: #6b7280;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.result-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
	font-size: 0.625rem;
	color: #9ca3af;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 0.25rem;
}

.result-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
}

.tag {
	background: #f3f4f6;
	color: #374151;
	padding: 0.0625rem 0.1875rem;
	border-radius: 0.0625rem;
	font-size: 0.5rem;
}

.result-actions {
	display: flex;
	gap: 0.25rem;
	margin-left: 0.75rem;
	flex-shrink: 0;
}

.action-btn {
	background: #f3f4f6;
	color: #374151;
	border: none;
	padding: 0.25rem 0.5rem;
	border-radius: 0.125rem;
	font-size: 0.625rem;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.action-btn:hover {
	background: #e5e7eb;
}

.no-results {
	text-align: center;
	padding: 2rem 1rem;
}

.no-results-icon {
	font-size: 3rem;
	margin-bottom: 1rem;
	opacity: 0.5;
}

.no-results h4 {
	margin: 0 0 0.5rem 0;
	font-size: 1rem;
	font-weight: 600;
	color: #374151;
}

.no-results p {
	margin: 0;
	font-size: 0.875rem;
	color: #6b7280;
}

.result-details {
	margin-top: 1rem;
	padding: 1rem;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	background: #f9fafb;
}

.details-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.details-header h4 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.close-btn {
	background: none;
	border: none;
	font-size: 1rem;
	cursor: pointer;
	color: #6b7280;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
}

.close-btn:hover {
	background: #e5e7eb;
}

.details-section {
	margin-bottom: 1rem;
}

.details-section h5 {
	margin: 0 0 0.5rem 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.details-section p {
	margin: 0;
	font-size: 0.875rem;
	color: #374151;
	line-height: 1.4;
}

.details-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 0.5rem;
}

.detail-item {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.detail-label {
	font-size: 0.625rem;
	color: #6b7280;
	text-transform: uppercase;
}

.detail-value {
	font-size: 0.75rem;
	color: #111827;
	font-weight: 500;
}

.details-actions {
	display: flex;
	gap: 0.5rem;
	margin-top: 1rem;
}

.btn-primary, .btn-secondary {
	padding: 0.5rem 1rem;
	border-radius: 0.375rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
	font-size: 0.75rem;
}

.btn-primary {
	background: #3b82f6;
	color: white;
}

.btn-primary:hover {
	background: #2563eb;
}

.btn-secondary {
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #d1d5db;
}

.btn-secondary:hover {
	background: #e5e7eb;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
	.search-controls {
		flex-direction: column;
		gap: 0.5rem;
	}

	.type-select {
		width: 100%;
	}

	.results-header {
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-start;
	}

	.result-item {
		flex-direction: column;
		gap: 0.5rem;
	}

	.result-actions {
		margin-left: 0;
		justify-content: flex-end;
	}

	.details-grid {
		grid-template-columns: 1fr;
	}

	.details-actions {
		flex-direction: column;
	}

	.btn-primary, .btn-secondary {
		width: 100%;
	}
}
</style>