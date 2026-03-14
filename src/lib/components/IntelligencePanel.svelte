<script lang="ts">
	import { intelligence } from '$lib/intelligence';
	import IntelligencePanelHeader from './intelligence/IntelligencePanelHeader.svelte';
	import IntelligencePanelSearch from './intelligence/IntelligencePanelSearch.svelte';
	import IntelligencePanelTabs from './intelligence/IntelligencePanelTabs.svelte';
	import IntelligencePhasesGrid from './intelligence/IntelligencePhasesGrid.svelte';
	import IntelligenceWorkflowsList from './intelligence/IntelligenceWorkflowsList.svelte';
	import IntelligenceReportsGrid from './intelligence/IntelligenceReportsGrid.svelte';
	import IntelligenceIntegrationView from './intelligence/IntelligenceIntegrationView.svelte';

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

	function handleToggleExpand() {
		expanded = !expanded;
	}

	function handleTabChange(id: string) {
		activeTab = id as 'phases' | 'workflows' | 'reports' | 'integration';
	}

	function handleSelectPhase(id: string) {
		selectedPhase = selectedPhase === id ? null : id;
	}
</script>

<div class="intelligence-panel" class:focused={expanded}>
	<IntelligencePanelHeader
		{title}
		{expanded}
		onToggleExpand={handleToggleExpand}
	/>
	
	{#if expanded}
		<div class="panel-content">
			<IntelligencePanelSearch bind:searchQuery />
			
			<IntelligencePanelTabs
				{tabs}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>
			
			<div class="tab-content">
				{#if activeTab === 'phases'}
					<IntelligencePhasesGrid
						phases={filteredPhases()}
						selectedPhase={selectedPhase}
						getPhaseDescription={getPhaseDescription}
						getPhaseStatus={getPhaseStatus}
						onSelectPhase={handleSelectPhase}
					/>
					
				{:else if activeTab === 'workflows'}
					<IntelligenceWorkflowsList {workflows} />
					
				{:else if activeTab === 'reports'}
					<IntelligenceReportsGrid
						reportEngines={reportEngines}
						getPhaseDescription={getPhaseDescription}
					/>
					
				{:else if activeTab === 'integration'}
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
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.intelligence-panel.focused {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.panel-content {
		padding: 1rem;
	}

	.tab-content {
		margin-top: 1rem;
	}
</style>