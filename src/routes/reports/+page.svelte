<script lang="ts">
	import { getIntelligenceLayer } from '$lib/intelligence';
	import ReportsFilters from '$lib/components/ReportsFilters.svelte';
	import ReportsStats from '$lib/components/ReportsStats.svelte';
	import ReportCard from '$lib/components/ReportCard.svelte';
	
	const intelligence = getIntelligenceLayer();
	
	let searchQuery = '';
	let selectedType = 'all';
	let selectedStatus = 'all';
	
	let reports = [
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
		},
		{ 
			id: 3, 
			title: 'Tree Preservation Order Survey', 
			type: 'survey', 
			typeLabel: 'Survey Report',
			status: 'review',
			date: '2024-03-05',
			client: 'Heritage Trust',
			location: 'Historic Estate',
			tags: ['tpo', 'historic', 'survey'],
			description: 'Detailed survey of trees subject to Tree Preservation Orders.'
		},
		{ 
			id: 4, 
			title: 'Woodland Management Plan 2024-2029', 
			type: 'management', 
			typeLabel: 'Management Plan',
			status: 'published',
			date: '2024-02-28',
			client: 'National Trust',
			location: 'Ancient Woodland',
			tags: ['management', '5-year', 'biodiversity'],
			description: 'Five-year management plan for ancient woodland conservation.'
		},
		{ 
			id: 5, 
			title: 'Emergency Tree Inspection - Storm Damage', 
			type: 'inspection', 
			typeLabel: 'Inspection Report',
			status: 'published',
			date: '2024-02-20',
			client: 'Emergency Services',
			location: 'Residential Area',
			tags: ['emergency', 'storm', 'safety'],
			description: 'Post-storm inspection of damaged trees for public safety.'
		},
		{ 
			id: 6, 
			title: 'Tree Works Specification - Highway Maintenance', 
			type: 'method', 
			typeLabel: 'Method Statement',
			status: 'draft',
			date: '2024-02-15',
			client: 'Highways Agency',
			location: 'A-Road Network',
			tags: ['highway', 'maintenance', 'specification'],
			description: 'Specification for tree works along highway network.'
		}
	];
	
	let filteredReports = $derived(
		reports.filter(report => {
			const matchesSearch = searchQuery === '' || 
				report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				report.client.toLowerCase().includes(searchQuery.toLowerCase());
			
			const matchesType = selectedType === 'all' || report.type === selectedType;
			const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
			
			return matchesSearch && matchesType && matchesStatus;
		})
	);
	
	function createNewReport() {
		console.log('Creating new report');
	}
	
	function exportReports() {
		console.log('Exporting reports');
	}
	
	function handleEdit(id: number) {
		console.log('Edit report', id);
	}
	
	function handleView(id: number) {
		console.log('View report', id);
	}
	
	function handleShare(id: number) {
		console.log('Share report', id);
	}
</script>

<main class="reports-page">
	<div class="page-header">
		<div>
			<h1>Reports</h1>
			<p class="subtitle">Manage your arboricultural reports and documentation</p>
		</div>
		<div class="header-actions">
			<button class="btn-secondary" on:click={exportReports}>
				📤 Export
			</button>
			<button class="btn-primary" on:click={createNewReport}>
				➕ New Report
			</button>
		</div>
	</div>
	
	<ReportsFilters 
		bind:searchQuery 
		bind:selectedType 
		bind:selectedStatus 
	/>
	
	<ReportsStats 
		{reports} 
		intelligencePhaseCount={intelligence.phaseCount} 
	/>
	
	{#if filteredReports.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📄</div>
			<h3>No reports found</h3>
			<p>Try adjusting your search or filters, or create a new report.</p>
			<button class="btn-primary" on:click={() => {
				searchQuery = '';
				selectedType = 'all';
				selectedStatus = 'all';
			}}>Clear filters</button>
		</div>
	{:else}
		<div class="reports-grid">
			{#each filteredReports as report}
				<ReportCard 
					{report} 
					onEdit={handleEdit}
					onView={handleView}
					onShare={handleShare}
				/>
			{/each}
		</div>
	{/if}
	
	<div class="intelligence-section">
		<h2>Report Intelligence</h2>
		<p>The following intelligence layers are available for report processing:</p>
		
		<div class="intelligence-cards">
			{#each intelligence.phases.filter(p => p.name.includes('Report')) as phase}
				<div class="intelligence-card">
					<div class="intelligence-icon">🧠</div>
					<div class="intelligence-content">
						<h4>{phase.name}</h4>
						<p>{phase.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	.reports-page {
		max-width: 100%;
	}
	
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}
	
	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #111827;
	}
	
	.subtitle {
		color: #6b7280;
		font-size: 1rem;
		margin: 0;
	}
	
	.header-actions {
		display: flex;
		gap: 0.75rem;
	}
	
	.btn-primary, .btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border: none;
		transition: all 0.2s ease;
	}
	
	.btn-primary {
		background: #3b82f6;
		color: white;
	}
	
	.btn-primary:hover {
		background: #2563eb;
	}
	
	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
	}
	
	.btn-secondary:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}
	
	.reports-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}
	
	.empty-state {
		background: white;
		border-radius: 12px;
		padding: 3rem;
		text-align: center;
		margin-bottom: 3rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
	
	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}
	
	.empty-state p {
		color: #6b7280;
		margin: 0 0 1.5rem 0;
	}
	
	.intelligence-section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.intelligence-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}
	
	.intelligence-section p {
		color: #6b7280;
		margin: 0 0 1.5rem 0;
	}
	
	.intelligence-cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}
	
	.intelligence-card {
		background: #f0f9ff;
		border-radius: 8px;
		padding: 1.5rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}
	
	.intelligence-icon {
		font-size: 1.5rem;
	}
	
	.intelligence-content {
		flex: 1;
	}
	
	.intelligence-content h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #0369a1;
		margin: 0 0 0.5rem 0;
	}
	
	.intelligence-content p {
		font-size: 0.875rem;
		color: #0c4a6e;
		margin: 0;
	}
</style>
