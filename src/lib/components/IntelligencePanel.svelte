<script lang="ts">
	import { intelligence } from '$lib/intelligence';
	
	export let title = 'Intelligence Layer';
	export let expanded = false;
	export let showPhaseFiles = true;
	export let showWorkflows = true;
	export let showReports = true;
	
	let activeTab: 'phases' | 'workflows' | 'reports' | 'integration' = 'phases';
	let selectedPhase: string | null = null;
	let searchQuery = '';
	
	const tabs = [
		{ id: 'phases', label: 'Phase Files', icon: '📚' },
		{ id: 'workflows', label: 'Workflows', icon: '🔄' },
		{ id: 'reports', label: 'Report Engines', icon: '📊' },
		{ id: 'integration', label: 'Integration', icon: '🔗' },
	];
	
	const reportEngines = [
		{ name: 'Report Decompiler', phase: 'PHASE_2', status: 'active' },
		{ name: 'Schema Mapper', phase: 'PHASE_3', status: 'active' },
		{ name: 'Style Learner', phase: 'PHASE_5', status: 'active' },
		{ name: 'Classification Engine', phase: 'PHASE_6', status: 'active' },
		{ name: 'Self-Healing Engine', phase: 'PHASE_7', status: 'active' },
		{ name: 'Template Generator', phase: 'PHASE_8', status: 'active' },
		{ name: 'Compliance Validator', phase: 'PHASE_9', status: 'active' },
		{ name: 'Reproduction Tester', phase: 'PHASE_10', status: 'active' },
	];
	
	const workflows = [
		{ name: 'Report Processing', steps: ['Upload', 'Decompile', 'Classify', 'Generate'], active: true },
		{ name: 'Schema Learning', steps: ['Extract', 'Map', 'Validate', 'Update'], active: true },
		{ name: 'Template Generation', steps: ['Analyze', 'Design', 'Generate', 'Test'], active: true },
		{ name: 'Compliance Validation', steps: ['Check', 'Validate', 'Report', 'Fix'], active: true },
	];
	
	function getPhaseDescription(phaseId: string): string {
		const descriptions: Record<string, string> = {
			'PHASE_0': 'Master Vision & Copilot Layer - Core intelligence foundation',
			'PHASE_1': 'Report Type Registry - Central registry for all report types',
			'PHASE_2': 'Report Decompiler Engine - Extracts structure from raw reports',
			'PHASE_3': 'Report Schema Mapper - Maps extracted data to structured schemas',
			'PHASE_4': 'Schema Updater Engine - Continuously improves schemas',
			'PHASE_5': 'Report Style Learner - Learns and applies report styling',
			'PHASE_6': 'Report Classification Engine - Classifies reports by type',
			'PHASE_7': 'Report Self-Healing Engine - Automatically fixes report issues',
			'PHASE_8': 'Report Template Generator - Creates templates from examples',
			'PHASE_9': 'Report Compliance Validator - Ensures regulatory compliance',
			'PHASE_10': 'Report Reproduction Tester - Tests report generation',
			'PHASE_11': 'Report Type Expansion Framework - Expands supported report types',
			'PHASE_12': 'AI Reasoning Integration - Adds AI reasoning to reports',
			'PHASE_13': 'User Workflow Learning - Learns from user interactions',
			'PHASE_14': 'Final Integration & Validation - System-wide integration',
			'PHASE_15': 'HTML Rendering Engine - Visual reproduction engine',
			'PHASE_16': 'PDF Parsing Engine - Direct PDF parsing and layout extraction',
			'PHASE_17': 'Content Intelligence Engine - Blog post and content generation',
			'PHASE_18': 'Unified Editor & Supabase Integration - Editor and database integration',
			'PHASE_19': 'Email Calendar Task Intelligence - Email and calendar integration',
			'PHASE_20': 'Full System Testing & Debugging - Comprehensive testing',
			'PHASE_21': 'Global Assistant Intelligence - Global AI assistant layer',
			'PHASE_22': 'Media Intelligence Layer - Media processing intelligence',
			'PHASE_23': 'AI Layout Engine - Intelligent layout generation',
			'PHASE_24': 'Document Intelligence Layer - Document processing intelligence',
			'PHASE_25': 'Workflow Intelligence Layer - Workflow optimization',
			'PHASE_26': 'Final System Integration - Final build preparation',
		};
		return descriptions[phaseId] || 'Intelligence phase';
	}
	
	function getPhaseStatus(phaseId: string): 'active' | 'inactive' | 'pending' {
		// Simple logic: first 10 phases active, others pending
		const phaseNum = parseInt(phaseId.split('_')[1]);
		if (phaseNum <= 10) return 'active';
		if (phaseNum <= 20) return 'inactive';
		return 'pending';
	}
	
	function filteredPhases() {
		const phases = intelligence.getPhaseFiles();
		if (!searchQuery) return phases;
		
		return phases.filter(phase => 
			phase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			phase.description.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}
</script>

<div class="intelligence-panel" class:focused={expanded}>
	<div class="panel-header">
		<div class="header-left">
			<div class="panel-icon">🧠</div>
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
			<div class="search-box">
				<input 
					type="text" 
					bind:value={searchQuery}
					placeholder="Search phase files..."
					class="search-input"
				/>
				<div class="search-icon">🔍</div>
			</div>
			
			<div class="tabs">
				{#each tabs as tab}
					<button 
						class="tab-button {activeTab === tab.id ? 'active' : ''}"
						on:click={() => activeTab = tab.id}
					>
						<span class="tab-icon">{tab.icon}</span>
						<span class="tab-label">{tab.label}</span>
					</button>
				{/each}
			</div>
			
			<div class="tab-content">
				{#if activeTab === 'phases'}
					<div class="phases-grid">
						{#each filteredPhases() as phase}
							<div 
								class="phase-card {getPhaseStatus(phase.id)} {selectedPhase === phase.id ? 'selected' : ''}"
								on:click={() => selectedPhase = selectedPhase === phase.id ? null : phase.id}
							>
								<div class="phase-header">
									<div class="phase-icon">📄</div>
									<div class="phase-info">
										<h4 class="phase-name">{phase.name}</h4>
										<div class="phase-id">{phase.id}</div>
									</div>
									<div class="phase-status {getPhaseStatus(phase.id)}">
										{getPhaseStatus(phase.id)}
									</div>
								</div>
								
								<div class="phase-description">
									{getPhaseDescription(phase.id)}
								</div>
								
								{#if selectedPhase === phase.id}
									<div class="phase-details">
										<div class="detail-item">
											<strong>Path:</strong> {phase.path}
										</div>
										<div class="detail-item">
											<strong>Size:</strong> {phase.size} bytes
										</div>
										<div class="detail-item">
											<strong>Last Modified:</strong> {phase.modified}
										</div>
										<div class="detail-actions">
											<button class="action-button view">View</button>
											<button class="action-button integrate">Integrate</button>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
					
				{:else if activeTab === 'workflows'}
					<div class="workflows-list">
						{#each workflows as workflow}
							<div class="workflow-card {workflow.active ? 'active' : 'inactive'}">
								<div class="workflow-header">
									<div class="workflow-icon">🔄</div>
									<h4 class="workflow-name">{workflow.name}</h4>
									<div class="workflow-status">
										{workflow.active ? 'Active' : 'Inactive'}
									</div>
								</div>
								
								<div class="workflow-steps">
									{#each workflow.steps as step, i}
										<div class="workflow-step">
											<div class="step-number">{i + 1}</div>
											<div class="step-name">{step}</div>
											<div class="step-connector"></div>
										</div>
									{/each}
								</div>
								
								<div class="workflow-actions">
									<button class="action-button run">Run Workflow</button>
									<button class="action-button configure">Configure</button>
								</div>
							</div>
						{/each}
					</div>
					
				{:else if activeTab === 'reports'}
					<div class="reports-grid">
						{#each reportEngines as engine}
							<div class="report-engine-card {engine.status}">
								<div class="engine-header">
									<div class="engine-icon">⚙️</div>
									<div class="engine-info">
										<h4 class="engine-name">{engine.name}</h4>
										<div class="engine-phase">{engine.phase}</div>
									</div>
									<div class="engine-status {engine.status}">
										{engine.status}
									</div>
								</div>
								
								<div class="engine-description">
									{getPhaseDescription(engine.phase)}
								</div>
								
								<div class="engine-metrics">
									<div class="metric">
										<div class="metric-label">Processed</div>
										<div class="metric-value">1,234</div>
									</div>
									<div class="metric">
										<div class="metric-label">Accuracy</div>
										<div class="metric-value">98.5%</div>
									</div>
									<div class="metric">
										<div class="metric-label">Speed</div>
										<div class="metric-value">2.3s</div>
									</div>
								</div>
								
								<div class="engine-actions">
									<button class="action-button test">Test Engine</button>
									<button class="action-button logs">View Logs</button>
								</div>
							</div>
						{/each}
					</div>
					
				{:else if activeTab === 'integration'}
					<div class="integration-view">
						<div class="integration-status">
							<div class="status-card connected">
								<div class="status-icon">✅</div>
								<div class="status-info">
									<h4>Phase Files Integrated</h4>
									<p>All {intelligence.getPhaseFiles().length} phase files loaded</p>
								</div>
							</div>
							
							<div class="status-card active">
								<div class="status-icon">⚡</div>
								<div class="status-info">
									<h4>Report Engines Active</h4>
									<p>8 of 8 engines running</p>
								</div>
							</div>
							
							<div class="status-card ready">
								<div class="status-icon">🚀</div>
								<div class="status-info">
									<h4>System Ready</h4>
									<p>All intelligence layers operational</p>
								</div>
							</div>
						</div>
						
						<div class="integration-actions">
							<h4>Integration Actions</h4>
							<div class="action-buttons">
								<button class="action-button primary">Validate Integration</button>
								<button class="action-button secondary">Run Full Test Suite</button>
								<button class="action-button tertiary">Export Configuration</button>
							</div>
						</div>
						
						<div class="integration-logs">
							<h4>Recent Integration Logs</h4>
							<div class="log-entries">
								<div class="log-entry success">
									<div class="log-time">19:08:42</div>
									<div class="log-message">Phase files loaded successfully</div>
								</div>
								<div class="log-entry info">
									<div class="log-time">19:08:15</div>
									<div class="log-message">Report decompiler engine initialized</div>
								</div>
								<div class="log-entry success">
									<div class="log-time">19:07:58</div>
									<div class="log-message">Schema mapper connected to database</div>
								</div>
								<div class="log-entry warning">
									<div class="log-time">19:07:23</div>
									<div class="log-message">Style learner cache warming up</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.intelligence-panel {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s ease;
	}
	
	.intelligence-panel.focused {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
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
		transition: all 0.2s ease;
	}
	
	.expand-button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}
	
	.panel-content {
		padding: 1rem;
	}
	
	.search-box {
		position: relative;
		margin-bottom: 1rem;
	}
	
	.search-input {
		width: 100%;
		padding: 0.5rem 2.5rem 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #374151;
	}
	
	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.search-icon {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
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
		transition: all 0.2s ease;
	}
	
	.tab-button:hover {
		background: #f3f4f6;
		color: #374151;
	}
	
	.tab-button.active {
		background: #3b82f6;
		color: white;
	}
	
	.tab-icon {
		font-size: 0.875rem;
	}
	
	.tab-label {
		font-weight: 500;
	}
	
	.tab-content {
		margin-top: 1rem;
	}
	
	.phases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
	}
	
	.phase-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.phase-card:hover {
		border-color: #d1d5db;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}
	
	.phase-card.selected {
		border-color: #3b82f6;
		background: #eff6ff;
	}
	
	.phase-card.active {
		border-left: 4px solid #10b981;
	}
	
	.phase-card.inactive {
		border-left: 4px solid #f59e0b;
	}
	
	.phase-card.pending {
		border-left: 4px solid #9ca3af;
	}
	
	.phase-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	
	.phase-icon {
		font-size: 1.25rem;
	}
	
	.phase-info {
		flex: 1;
	}
	
	.phase-name {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.phase-id {
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.phase-status {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		text-transform: uppercase;
	}
	
	.phase-status.active {
		background: #d1fae5;
		color: #065f46;
	}
	
	.phase-status.inactive {
		background: #fef3c7;
		color: #92400e;
	}
	
	.phase-status.pending {
		background: #f3f4f6;
		color: #374151;
	}
	
	.phase-description {
		font-size: 0.75rem;
		color: #4b5563;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}
	
	.phase-details {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.detail-item {
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}
	
	.detail-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
	
	.action-button {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.action-button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}
	
	.action-button.view {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	
	.action-button.integrate {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}
	
	.workflows-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
	}
	
	.workflow-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 1rem;
	}
	
	.workflow-card.active {
		border-left: 4px solid #10b981;
	}
	
	.workflow-card.inactive {
		border-left: 4px solid #9ca3af;
		opacity: 0.7;
	}
	
	.workflow-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	
	.workflow-icon {
		font-size: 1.25rem;
	}
	
	.workflow-name {
		flex: 1;
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.workflow-status {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		text-transform: uppercase;
		background: #d1fae5;
		color: #065f46;
	}
	
	.workflow-card.inactive .workflow-status {
		background: #f3f4f6;
		color: #374151;
	}
	
	.workflow-steps {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.workflow-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}
	
	.step-number {
		width: 24px;
		height: 24px;
		background: #3b82f6;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}
	
	.step-name {
		font-size: 0.75rem;
		color: #4b5563;
		text-align: center;
	}
	
	.step-connector {
		width: 100%;
		height: 2px;
		background: #e5e7eb;
		margin-top: -13px;
		margin-left: 12px;
	}
	
	.workflow-step:last-child .step-connector {
		display: none;
	}
	
	.workflow-actions {
		display: flex;
		gap: 0.5rem;
	}
	
	.action-button.run {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	
	.action-button.configure {
		background: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.reports-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
	}
	
	.report-engine-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 1rem;
	}
	
	.report-engine-card.active {
		border-left: 4px solid #10b981;
	}
	
	.engine-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	
	.engine-icon {
		font-size: 1.25rem;
	}
	
	.engine-info {
		flex: 1;
	}
	
	.engine-name {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.engine-phase {
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.engine-status {
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		text-transform: uppercase;
		background: #d1fae5;
		color: #065f46;
	}
	
	.engine-description {
		font-size: 0.75rem;
		color: #4b5563;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}
	
	.engine-metrics {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	
	.metric {
		flex: 1;
		text-align: center;
	}
	
	.metric-label {
		font-size: 0.625rem;
		color: #6b7280;
		text-transform: uppercase;
		margin-bottom: 0.125rem;
	}
	
	.metric-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.engine-actions {
		display: flex;
		gap: 0.5rem;
	}
	
	.action-button.test {
		background: #8b5cf6;
		color: white;
		border-color: #8b5cf6;
	}
	
	.action-button.logs {
		background: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.integration-view {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.integration-status {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}
	
	.status-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.status-card.connected {
		border-left: 4px solid #10b981;
	}
	
	.status-card.active {
		border-left: 4px solid #3b82f6;
	}
	
	.status-card.ready {
		border-left: 4px solid #f59e0b;
	}
	
	.status-icon {
		font-size: 1.5rem;
	}
	
	.status-info h4 {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.status-info p {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.integration-actions h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}
	
	.action-button.primary {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	
	.action-button.secondary {
		background: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.action-button.tertiary {
		background: #f3f4f6;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.integration-logs h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}
	
	.log-entries {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.75rem;
		max-height: 200px;
		overflow-y: auto;
	}
	
	.log-entry {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-bottom: 1px solid #f3f4f6;
	}
	
	.log-entry:last-child {
		border-bottom: none;
	}
	
	.log-time {
		font-size: 0.75rem;
		color: #6b7280;
		min-width: 60px;
	}
	
	.log-message {
		font-size: 0.75rem;
		color: #374151;
		flex: 1;
	}
	
	.log-entry.success .log-message {
		color: #065f46;
	}
	
	.log-entry.info .log-message {
		color: #1e40af;
	}
	
	.log-entry.warning .log-message {
		color: #92400e;
	}