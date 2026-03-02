<script lang="ts">
	import { onMount } from 'svelte';
	import { getIntelligenceEngine } from '$lib/intelligence/engine';
	import {
		getIntelligenceCapabilities,
		getArchitectureSummaries,
		getReportTypes,
		getWorkflowDefinitions,
		getSchemaMappings
	} from '$lib/intelligence/api';
	import { intelligenceContext } from '$lib/stores/intelligence/intelligenceContext';
	
	import IntelligenceHeader from '$lib/components/intelligence/IntelligenceHeader.svelte';
	import IntelligenceSection from '$lib/components/intelligence/IntelligenceSection.svelte';
	import PhaseFilesContent from '$lib/components/intelligence/PhaseFilesContent.svelte';
	import IntelligencePanel from '$lib/components/IntelligencePanel.svelte';
	
	let intelligenceEngine: any;
	let capabilities: any = null;
	let architectureSummaries: any[] = [];
	let reportTypes: string[] = [];
	let workflowDefinitions: string[] = [];
	let schemaMappings: string[] = [];
	let isLoading = true;
	let error: string | null = null;
	
	let expandedPanels = {
		phases: true,
		workflows: true,
		engines: true,
		integration: true
	};
	
	function togglePanel(panel: keyof typeof expandedPanels) {
		expandedPanels[panel] = !expandedPanels[panel];
	}
	
	onMount(async () => {
		try {
			// Initialize intelligence engine
			intelligenceEngine = await getIntelligenceEngine();
			
			// Load capabilities
			capabilities = await getIntelligenceCapabilities();
			architectureSummaries = await getArchitectureSummaries();
			reportTypes = await getReportTypes();
			workflowDefinitions = await getWorkflowDefinitions();
			schemaMappings = await getSchemaMappings();
			
			// Update intelligence context store
			intelligenceContext.updateEngineStatus({
				initialized: true,
				phaseCount: capabilities?.stats.totalPhases || 0,
				lastUpdated: new Date()
			});
			
			isLoading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to initialize intelligence engine';
			isLoading = false;
			console.error('Intelligence engine initialization error:', err);
		}
	});
</script>

<main class="intelligence-page">
	{#if isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Initializing Intelligence Engine...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<div class="error-icon">⚠️</div>
			<h2>Failed to Initialize Intelligence Engine</h2>
			<p>{error}</p>
			<button on:click={() => location.reload()}>Retry</button>
		</div>
	{:else}
		<IntelligenceHeader {capabilities} />
		
		<div class="introduction">
			<h2>Architecture Overview</h2>
			<p>
				The Intelligence Layer is the authoritative architectural blueprint for Oscar AI V2,
				consisting of {capabilities?.stats.totalPhases || 0} phase files that define the system's
				architecture, intelligence layers, workflows, report engines, schema logic, and
				intended behaviour.
			</p>
			<p>
				<strong>Current Status:</strong> {capabilities?.stats.executionPrompts || 0} execution prompts,
				{capabilities?.reportTypes?.length || 0} report types, {capabilities?.workflows?.length || 0} workflows,
				and {capabilities?.schemaMappings?.length || 0} schema mappings are available.
			</p>
			<p>
				<strong>Architecture Rule:</strong> Phase Files take priority over any UI or behaviour
				extracted from the HAR file. HAR-derived contradictions are discarded or adapted.
			</p>
		</div>
		
		<div class="intelligence-grid">
			<IntelligenceSection 
				title="Phase Files" 
				expanded={expandedPanels.phases}
				description="The authoritative architectural blueprint. These files define the complete system architecture and intelligence layers."
			>
				<PhaseFilesContent {architectureSummaries} />
			</IntelligenceSection>
			
			<IntelligenceSection 
				title="Workflows" 
				expanded={expandedPanels.workflows}
				description="Defined workflows for report processing, schema learning, template generation, and compliance validation."
			>
				<div class="workflows-list">
					{#each workflowDefinitions as workflow, i}
						<div class="workflow">
							<h4>{workflow}</h4>
							<div class="workflow-steps">
								{#each Array.from({ length: 4 }, (_, j) => j + 1) as step}
									<div class="step">{step}. Step {step}</div>
								{/each}
							</div>
						</div>
					{/each}
					
					{#if workflowDefinitions.length === 0}
						<div class="workflow">
							<h4>Default Report Workflow</h4>
							<div class="workflow-steps">
								<div class="step">1. Analyze</div>
								<div class="step">2. Decompile</div>
								<div class="step">3. Classify</div>
								<div class="step">4. Generate</div>
							</div>
						</div>
					{/if}
				</div>
			</IntelligenceSection>
			
			<IntelligenceSection 
				title="Report Types" 
				expanded={expandedPanels.engines}
				description="Supported report types from Phase 1: Report Type Registry. Each type has defined sections, compliance rules, and AI guidance."
			>
				<div class="engines-grid">
					{#each reportTypes as reportType}
						<div class="engine-card">
							<div class="engine-icon">
								{#if reportType.includes('Tree')}
									🌳
								{:else if reportType.includes('Safety')}
									⚠️
								{:else if reportType.includes('Impact')}
									📊
								{:else if reportType.includes('Method')}
									📝
								{:else if reportType.includes('Condition')}
									🏥
								{:else if reportType.includes('Mortgage')}
									💰
								{:else}
									📄
								{/if}
							</div>
							<h4>{reportType.split('(')[0].trim()}</h4>
							<p>{reportType.includes('(') ? reportType.split('(')[1].replace(')', '') : 'Standard report type'}</p>
							<div class="engine-status active">Available</div>
						</div>
					{/each}
					
					{#if reportTypes.length === 0}
						<div class="engine-card">
							<div class="engine-icon">📄</div>
							<h4>BS5837:2012 Tree Survey</h4>
							<p>Standard tree survey report</p>
							<div class="engine-status active">Available</div>
						</div>
					{/if}
				</div>
			</IntelligenceSection>
			
			<IntelligenceSection 
				title="Integration Status" 
				expanded={expandedPanels.integration}
				description="Current integration status of the intelligence layer with the reconstructed UI."
			>
				<div class="integration-status">
					<div class="status-item success">
						<div class="status-icon">✅</div>
						<div class="status-content">
							<h4>Intelligence Engine Active</h4>
							<p>Engine initialized with {capabilities?.stats.totalPhases || 0} phase files</p>
						</div>
					</div>
					
					<div class="status-item success">
						<div class="status-icon">✅</div>
						<div class="status-content">
							<h4>API Layer Ready</h4>
							<p>Public API exposed with {reportTypes.length} report types and {workflowDefinitions.length} workflows</p>
						</div>
					</div>
					
					<div class="status-item success">
						<div class="status-icon">✅</div>
						<div class="status-content">
							<h4>State Stores Active</h4>
							<p>5 intelligence stores managing report, workflow, context, search, and reasoning state</p>
						</div>
					</div>
					
					<div class="status-item warning">
						<div class="status-icon">⚠️</div>
						<div class="status-content">
							<h4>Schema Mappings</h4>
							<p>{schemaMappings.length} schema mappings defined from Phase 3</p>
						</div>
					</div>
				</div>
			</IntelligenceSection>
		</div>
		
		<div class="intelligence-panel-section">
			<h2>Interactive Intelligence Panel</h2>
			<p>Use the interactive panel below to explore the intelligence layer:</p>
			
			<IntelligencePanel 
				title="Oscar AI V2 Intelligence Layer" 
				expanded={true}
			/>
		</div>
		
		<div class="architecture-rules">
			<h2>Architecture Rules</h2>
			<div class="rules-list">
				<div class="rule">
					<h3>1. Phase Files are Authoritative</h3>
					<p>The Phase Files define the system architecture, intelligence layers, workflows, report engines, schema logic, naming conventions, and intended behaviour.</p>
				</div>
				
				<div class="rule">
					<h3>2. HAR Provides UI Only</h3>
					<p>The HAR provides ONLY the UI, routing, component structure, styling, and runtime behaviour of the working Cloudflare deployment.</p>
				</div>
				
				<div class="rule">
					<h3>3. Phase Files Take Priority</h3>
					<p>If any behaviour, structure, naming, or logic extracted from the HAR contradicts the Phase Files, the Phase Files take priority. HAR-derived contradictions must be discarded or adapted.</p>
				</div>
				
				<div class="rule">
					<h3>4. HAR UI Inclusion</h3>
					<p>If the HAR contains UI or behaviour that is not described in the Phase Files, include it ONLY if it does not violate the architecture.</p>
				</div>
				
				<div class="rule">
					<h3>5. No Legacy Logic Import</h3>
					<p>Do NOT import legacy logic from the HAR. The HAR is NOT a logic source. It is ONLY a visual + behavioural reference.</p>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	@import '../../../lib/components/intelligence/IntelligencePage.css';
</style>