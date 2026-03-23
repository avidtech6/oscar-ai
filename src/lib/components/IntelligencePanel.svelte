<script lang="ts">
	import { intelligence } from '$lib/intelligence';
	import { intelligenceStore } from '$lib/assistant/IntelligenceStore';
	import IntelligencePanelHeader from './intelligence/IntelligencePanelHeader.svelte';
	import IntelligencePanelSearch from './intelligence/IntelligencePanelSearch.svelte';
	import IntelligencePanelTabs from './intelligence/IntelligencePanelTabs.svelte';
	import IntelligencePhasesGrid from './intelligence/IntelligencePhasesGrid.svelte';
	import IntelligenceWorkflowsList from './intelligence/IntelligenceWorkflowsList.svelte';
	import IntelligenceReportsGrid from './intelligence/IntelligenceReportsGrid.svelte';
	import IntelligenceIntegrationView from './intelligence/IntelligenceIntegrationView.svelte';

	export let title = 'Oscar AI Intelligence Layer';
	export let expanded = false;
	export let showPhaseFiles = true;
	export let showWorkflows = true;
	export let showReports = true;

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
			'PHASE_27.5': 'Extended Intelligence Core - Advanced AI capabilities',
			'PHASE_28': 'Quantum Computing Integration - Quantum-powered intelligence',
			'PHASE_29': 'Blockchain Intelligence - Distributed intelligence layer',
			'PHASE_30': 'Advanced Analytics Engine - Predictive and prescriptive analytics',
			'PHASE_31': 'Neural Network Intelligence - Deep learning integration',
			'PHASE_32': 'Cognitive Computing - Human-like reasoning',
			'PHASE_33': 'Autonomous Systems - Self-optimizing intelligence',
			'PHASE_34.5': 'Final Intelligence Integration - Complete system alignment',
		};
		return descriptions[phaseId] || 'Oscar AI Intelligence Phase';
	}

	function getPhaseStatus(phaseId: string): 'active' | 'inactive' | 'pending' {
		// Enhanced logic: Extended Intelligence phases also active
		const phaseNum = parseFloat(phaseId.split('_')[1]);
		if (phaseNum <= 10) return 'active';
		if (phaseNum >= 27.5 && phaseNum <= 34.5) return 'active';
		if (phaseNum <= 26) return 'inactive';
		return 'pending';
	}

	function filteredPhases() {
		const phases = intelligence.getPhaseFiles();
		if (!$intelligenceStore.searchQuery) return phases;
		
		return phases.filter(phase =>
			phase.name.toLowerCase().includes($intelligenceStore.searchQuery.toLowerCase()) ||
			phase.description.toLowerCase().includes($intelligenceStore.searchQuery.toLowerCase())
		);
	}

	function handleToggleExpand() {
		$intelligenceStore.toggleExpand();
	}

	function handleTabChange(id: string) {
		$intelligenceStore.setActiveTab(id as 'phases' | 'workflows' | 'reports' | 'integration');
	}

	function handleSelectPhase(id: string) {
		$intelligenceStore.togglePhaseSelection(id);
	}
</script>

<div class="intelligence-panel" class:focused={$intelligenceStore.expanded}>
	<IntelligencePanelHeader
		{title}
		bind:expanded={$intelligenceStore.expanded}
		onToggleExpand={handleToggleExpand}
	/>
	
	{#if $intelligenceStore.expanded}
		<div class="panel-content">
			<IntelligencePanelSearch bind:searchQuery={$intelligenceStore.searchQuery} />
			
			<IntelligencePanelTabs
				{tabs}
				activeTab={$intelligenceStore.activeTab}
				onTabChange={handleTabChange}
			/>
			
			<div class="tab-content">
				{#if $intelligenceStore.activeTab === 'phases'}
					<IntelligencePhasesGrid
						phases={filteredPhases()}
						selectedPhase={$intelligenceStore.selectedPhase}
						getPhaseDescription={getPhaseDescription}
						getPhaseStatus={getPhaseStatus}
						onSelectPhase={handleSelectPhase}
					/>
					
				{:else if $intelligenceStore.activeTab === 'workflows'}
					<IntelligenceWorkflowsList {workflows} />
					
				{:else if $intelligenceStore.activeTab === 'reports'}
					<IntelligenceReportsGrid
						reportEngines={reportEngines}
						getPhaseDescription={getPhaseDescription}
					/>
					
				{:else if $intelligenceStore.activeTab === 'integration'}
					<IntelligenceIntegrationView
						phaseCount={intelligence.getPhaseFiles().length}
					/>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.intelligence-panel {
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s ease;
		position: relative;
	}

	.intelligence-panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899);
		opacity: 0.1;
	}

	.intelligence-panel.focused {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.panel-content {
		padding: 1rem;
		background: var(--background);
		position: relative;
	}

	.panel-content::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.05) 0%, transparent 50%),
					radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
		pointer-events: none;
	}

	.tab-content {
		margin-top: 1rem;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.intelligence-panel {
			border-radius: 6px;
		}
		
		.panel-content {
			padding: 0.75rem;
		}
	}
</style>