<script lang="ts">
	import { onMount } from 'svelte';
	import { getIntelligenceEngine } from '$lib/intelligence/engine';
	import { getReasoningStats, processReasoningQuery } from '$lib/intelligence/reasoning';
	
	export let title = 'Intelligence Introspection';
	export let expanded = false;
	
	let engine: any = null;
	let stats: any = null;
	let query = '';
	let queryResults: any = null;
	let isLoading = false;
	let activeTab: 'overview' | 'query' | 'stats' | 'debug' = 'overview';
	
	onMount(async () => {
		try {
			engine = await getIntelligenceEngine();
			stats = await getReasoningStats();
		} catch (error) {
			console.error('Failed to load introspection data:', error);
		}
	});
	
	async function handleQuery() {
		if (!query.trim()) return;
		
		isLoading = true;
		try {
			queryResults = await processReasoningQuery(query);
		} catch (error) {
			console.error('Query failed:', error);
			queryResults = {
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		} finally {
			isLoading = false;
		}
	}
	
	function formatDate(date: Date) {
		return date.toLocaleString();
	}
</script>

<div class="introspection-panel">
	<div class="panel-header">
		<div class="header-left">
			<div class="panel-icon">🔍</div>
			<h3 class="panel-title">{title}</h3>
		</div>
		<div class="header-right">
			<button class="expand-button" on:click={() => expanded = !expanded} title={expanded ? 'Collapse' : 'Expand'}>
				{expanded ? '−' : '+'}
			</button>
		</div>
	</div>
	
	{#if expanded}
		<div class="panel-content">
			<div class="tabs">
				<button 
					class="tab-button {activeTab === 'overview' ? 'active' : ''}"
					on:click={() => activeTab = 'overview'}
				>
					<span class="tab-icon">📊</span>
					<span class="tab-label">Overview</span>
				</button>
				<button 
					class="tab-button {activeTab === 'query' ? 'active' : ''}"
					on:click={() => activeTab = 'query'}
				>
					<span class="tab-icon">🔍</span>
					<span class="tab-label">Query</span>
				</button>
				<button 
					class="tab-button {activeTab === 'stats' ? 'active' : ''}"
					on:click={() => activeTab = 'stats'}
				>
					<span class="tab-icon">📈</span>
					<span class="tab-label">Stats</span>
				</button>
				<button 
					class="tab-button {activeTab === 'debug' ? 'active' : ''}"
					on:click={() => activeTab = 'debug'}
				>
					<span class="tab-icon">🐛</span>
					<span class="tab-label">Debug</span>
				</button>
			</div>
			
			<div class="tab-content">
				{#if activeTab === 'overview'}
					<div class="overview-section">
						<h4>Intelligence Layer Status</h4>
						{#if engine}
							<div class="status-grid">
								<div class="status-item success">
									<div class="status-icon">✅</div>
									<div class="status-content">
										<h5>Engine Active</h5>
										<p>Intelligence engine initialized</p>
									</div>
								</div>
								
								<div class="status-item info">
									<div class="status-icon">📚</div>
									<div class="status-content">
										<h5>Phase Files</h5>
										<p>{engine.getAllMetadata().length} phase files loaded</p>
									</div>
								</div>
								
								<div class="status-item info">
									<div class="status-icon">📊</div>
									<div class="status-content">
										<h5>Report Types</h5>
										<p>{engine.getReportTypes().length} report types available</p>
									</div>
								</div>
								
								<div class="status-item info">
									<div class="status-icon">🔄</div>
									<div class="status-content">
										<h5>Workflows</h5>
										<p>{engine.getWorkflowDefinitions().length} workflows defined</p>
									</div>
								</div>
							</div>
						{:else}
							<div class="loading">Loading engine status...</div>
						{/if}
						
						<div class="architecture-rules">
							<h4>Architecture Rules</h4>
							<ul>
								<li>Phase Files are authoritative blueprint</li>
								<li>HAR provides UI only (no logic)</li>
								<li>Phase Files take priority over HAR contradictions</li>
								<li>No legacy logic import from HAR</li>
							</ul>
						</div>
					</div>
					
				{:else if activeTab === 'query'}
					<div class="query-section">
						<h4>Query Intelligence Layer</h4>
						<div class="query-input">
							<input 
								type="text" 
								bind:value={query}
								placeholder="Ask about phases, workflows, or reports..."
								class="query-text"
								on:keydown={(e) => e.key === 'Enter' && handleQuery()}
							/>
							<button class="query-button" on:click={handleQuery} disabled={isLoading}>
								{#if isLoading}
									<span class="loading-spinner-small"></span>
								{:else}
									Search
								{/if}
							</button>
						</div>
						
						{#if queryResults}
							<div class="query-results">
								<h5>Results ({queryResults.results?.length || 0})</h5>
								
								{#if queryResults.error}
									<div class="error-message">
										Error: {queryResults.error}
									</div>
								{:else if queryResults.results && queryResults.results.length > 0}
									<div class="results-list">
										{#each queryResults.results as result, i}
											<div class="result-item">
												<div class="result-type">{result.type}</div>
												<div class="result-content">
													<strong>
														{#if result.type === 'phase'}
															Phase {result.phase}: {result.title}
														{:else if result.type === 'phase_metadata'}
															Phase {result.phaseNumber}: {result.title}
														{:else if result.type === 'workflow'}
															Workflow: {result.name}
														{:else if result.type === 'report'}
															Report Type: {result.name}
														{:else}
															{result.name || result.title}
														{/if}
													</strong>
													<p>{result.summary || result.description || 'No description available'}</p>
													<div class="result-meta">
														<span class="confidence">Confidence: {(result.matchScore * 100).toFixed(0)}%</span>
													</div>
												</div>
											</div>
										{/each}
									</div>
									
									<div class="query-meta">
										<p><strong>Explanation:</strong> {queryResults.explanation}</p>
										<p><strong>Confidence:</strong> {(queryResults.confidence * 100).toFixed(0)}%</p>
										<p><strong>Timestamp:</strong> {formatDate(queryResults.timestamp)}</p>
									</div>
								{:else}
									<div class="no-results">
										No results found. Try different keywords.
									</div>
								{/if}
							</div>
						{/if}
					</div>
					
				{:else if activeTab === 'stats'}
					<div class="stats-section">
						<h4>Reasoning Statistics</h4>
						{#if stats}
							<div class="stats-grid">
								<div class="stat-card">
									<div class="stat-value">{stats.totalPhases}</div>
									<div class="stat-label">Phase Files</div>
								</div>
								
								<div class="stat-card">
									<div class="stat-value">{stats.totalArchitectureSummaries}</div>
									<div class="stat-label">Architecture Summaries</div>
								</div>
								
								<div class="stat-card">
									<div class="stat-value">{stats.totalReportTypes}</div>
									<div class="stat-label">Report Types</div>
								</div>
								
								<div class="stat-card">
									<div class="stat-value">{stats.totalWorkflows}</div>
									<div class="stat-label">Workflows</div>
								</div>
							</div>
							
							<div class="coverage-section">
								<h5>Coverage</h5>
								<div class="coverage-item">
									<div class="coverage-label">Phase Files</div>
									<div class="coverage-bar">
										<div class="coverage-fill" style="width: {stats.coverage.phases}%"></div>
									</div>
									<div class="coverage-value">{stats.coverage.phases.toFixed(1)}%</div>
								</div>
								
								<div class="coverage-item">
									<div class="coverage-label">Report Types</div>
									<div class="coverage-bar">
										<div class="coverage-fill" style="width: {stats.coverage.reports}%"></div>
									</div>
									<div class="coverage-value">{stats.coverage.reports.toFixed(1)}%</div>
								</div>
								
								<div class="coverage-item">
									<div class="coverage-label">Workflows</div>
									<div class="coverage-bar">
										<div class="coverage-fill" style="width: {stats.coverage.workflows}%"></div>
									</div>
									<div class="coverage-value">{stats.coverage.workflows.toFixed(1)}%</div>
								</div>
							</div>
							
							<div class="last-updated">
								<strong>Last Updated:</strong> {formatDate(stats.lastUpdated)}
							</div>
						{:else}
							<div class="loading">Loading statistics...</div>
						{/if}
					</div>
					
				{:else if activeTab === 'debug'}
					<div class="debug-section">
						<h4>Debug Information</h4>
						
						<div class="debug-actions">
							<button class="debug-button" on:click={() => console.log('Engine:', engine)}>
								Log Engine to Console
							</button>
							<button class="debug-button" on:click={() => location.reload()}>
								Reload Page
							</button>
						</div>
						
						<div class="debug-info">
							<h5>Environment</h5>
							<ul>
								<li><strong>Mode:</strong> Development</li>
								<li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
								<li><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</li>
							</ul>
						</div>
						
						<div class="debug-tips">
							<h5>Debug Tips</h5>
							<ol>
								<li>Check browser console for detailed logs</li>
								<li>Verify Phase Files are in correct location</li>
								<li>Ensure intelligence engine is initialized</li>
								<li>Check network requests for API calls</li>
								<li>Validate TypeScript compilation</li>
							</ol>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.introspection-panel {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		margin: 1rem 0;
	}
	
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		cursor: pointer;
	}
	
	.header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.panel-icon {
		font-size: 1.25rem;
	}
	
	.panel-title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.expand-button {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		color: #374151;
		cursor: pointer;
	}
	
	.panel-content {
		padding: 1rem;
	}
	
	.tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}
	
	.tab-button {
		background: transparent;
		border: none;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 4px;
	}
	
	.tab-button:hover {
		background: #f3f4f6;
		color: #374151;
	}
	
	.tab-button.active {
		background: #3b82f6;
		color: white;
	}
	
	.tab-content {
		margin-top: 1rem;
	}
	
	.tab-content h4 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
	}
	
	.tab-content h5 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}
	
	.status-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.status-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 6px;
		background: #f9fafb;
	}
	
	.status-item.success {
		border-left: 4px solid #10b981;
	}
	
	.status-item.info {
		border-left: 4px solid #3b82f6;
	}
	
	.status-icon {
		font-size: 1.25rem;
	}
	
	.status-content h5 {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.status-content p {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.architecture-rules ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.875rem;
		color: #374151;
	}
	
	.architecture-rules li {
		margin-bottom: 0.25rem;
	}
	
	.query-input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.query-text {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}
	
	.query-button {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}
	
	.query-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.loading-spinner-small {
		width: 16px;
		height: 16px;
		border: 2px solid #e5e7eb;
		border-top: 2px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		display: inline-block;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.query-results {
		margin-top: 1rem;
	}
	
	.results-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 300px;
		overflow-y: auto;
		margin-bottom: 1rem;
	}
	
	.result-item {
		background: #f9fafb;
		border-radius: 6px;
		padding: 0.75rem;
		border-left: 3px solid #3b82f6;
	}
	
	.result-type {
		font-size: 0.625rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		margin-bottom: 0.25rem;
	}
	
	.result-content strong {
		font-size: 0.875rem;
		color: #111827;
		display: block;
		margin-bottom: 0.25rem;
	}
	
	.result-content p {
		font-size: 0.75rem;
		color: #4b5563;
		margin: 0 0 0.5rem 0;
	}
	
	.result-meta {
		font-size: 0.625rem;
		color: #9ca3af;
	}
	
	.query-meta {
		background: #f0f9ff;
		border-radius: 6px;
		padding: 0.75rem;
		font-size: 0.75rem;
		color: #374151;
	}
	
	.query-meta p {
		margin: 0 0 0.25rem 0;
	}
	
	.no-results {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
		font-size: 0.875rem;
	}
	
	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.75rem;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.stat-card {
		background: #f9fafb;
		border-radius: 8px;
		padding: 1rem;
		text-align: center;
	}
	
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #3b82f6;
		margin-bottom: 0.25rem;
	}
	
	.stat-label {
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.coverage-section {
		margin-bottom: 1.5rem;
	}
	
	.coverage-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}
	
	.coverage-label {
		font-size: 0.75rem;
		color: #374151;
		min-width: 100px;
	}
	
	.coverage-bar {
		flex: 1;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
	}
	
	.coverage-fill {
		height: 100%;
		background: #10b981;
		border-radius: 4px;
	}
	
	.coverage-value {
		font-size: 0.75rem;
		font-weight: 600;
		color: #111827;
		min-width: 50px;
		text-align: right;
	}
	
	.last-updated {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: center;
	}
	
	.debug-actions {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	
	.debug-button {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		cursor: pointer;
	}
	
	.debug-button:hover {
		background: #e5e7eb;
	}
	
	.debug-info ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.75rem;
		color: #374151;
	}
	
	.debug-info li {
		margin-bottom: 0.25rem;
	}
	
	.debug-tips ol {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.75rem;
		color: #374151;
	}
	
	.debug-tips li {
		margin-bottom: 0.5rem;
	}
	
	.loading {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
		font-size: 0.875rem;
	}
</style>